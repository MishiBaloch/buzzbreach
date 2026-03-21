const { db } = require("../../database/config");
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Check if we're in development mode (no Keycloak)
const DEV_MODE = !process.env.KEYCLOAK_URL || process.env.DEV_MODE === "true";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

// Normalize Keycloak base URL at runtime to avoid common misconfigurations
// - Ensures https://
// - Removes any trailing slashes
// - Ensures it does NOT include /realms/ segment (callers will append it)
function normalizeKeycloakUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return rawUrl;
  }
  let url = rawUrl.trim();
  // Remove any trailing slash
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  // If the url mistakenly contains /realms/..., strip it to base
  const realmsIdx = url.indexOf("/realms/");
  if (realmsIdx !== -1) {
    url = url.slice(0, realmsIdx);
  }
  // Force https scheme if http provided
  if (url.startsWith("http://")) {
    url = "https://" + url.slice("http://".length);
  }
  return url;
}

const KEYCLOAK_URL = normalizeKeycloakUrl(process.env.KEYCLOAK_URL);

// Simple password hashing for dev mode
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// ✅ Helper: Get Admin Token to Create Users in Keycloak
const getAdminToken = async () => {
  const data = qs.stringify({
    client_id: process.env.KEYCLOAK_ADMIN_CLIENT_ID || "admin-cli",
    username: process.env.KEYCLOAK_ADMIN_USERNAME,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    grant_type: process.env.KEYCLOAK_ADMIN_GRANT_TYPE || "password",
  });

  const config = {
    method: "post",
    url: `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Forwarded-Proto": "https"
    },
    data: data,
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false
    })
  };

  try {
  const response = await axios(config);
  return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get Keycloak admin token:", error.response?.data || error.message);
    throw new Error(`Keycloak admin token error: ${error.response?.data?.error_description || error.message}`);
  }
};

// ========== DEV MODE LOGIN (No Keycloak) ==========
const loginUserDev = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user in ArangoDB - query fresh data from database
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get fresh user document from database to ensure we have latest isOnboarded value
    const userDoc = users[0];
    const collection = db.collection("users");
    const user = await collection.document(userDoc._key); // Re-fetch to ensure fresh data

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token - use keycloakId as sub for consistency with getUserDetails
    const token = jwt.sign(
      {
        sub: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Ensure isOnboarded is always present (default to false if not set)
    // Handle both boolean and any other truthy values
    const isOnboardedValue = userWithoutPassword.isOnboarded !== undefined 
      ? (userWithoutPassword.isOnboarded === true || userWithoutPassword.isOnboarded === 'true' || userWithoutPassword.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...userWithoutPassword,
      isOnboarded: isOnboardedValue,
    };

    // Log for debugging
    console.log(`[Login Dev] User ${user.email} login - isOnboarded:`, userWithoutPassword.isOnboarded, '->', isOnboardedValue);

    return res.status(200).json({
      success: true,
      token: token,
      refreshToken: token, // Same token for dev mode
      expiresIn: 604800, // 7 days
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ========== DEV MODE REGISTER (No Keycloak) ==========
const registerUserDev = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const existing = await cursor.all();

    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user in ArangoDB
    const newUser = {
      firstName: firstName || "",
      lastName: lastName || "",
      email,
      password: hashedPassword,
      userType: "Individual",
      keycloakId: `dev-${Date.now()}`, // Fake keycloak ID for dev
      createdAt: new Date(),
      updatedAt: new Date(),
      isOnboarded: false,
    };

    const meta = await db.collection("users").save(newUser);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    const user = { ...userWithoutPassword, _id: meta._id, _key: meta._key };

    console.log(`[DEV] User registered: ${email}`);
    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

// ========== KEYCLOAK MODE LOGIN ==========
const loginUserKeycloak = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const realm = process.env.REALM_NAME || "buzzbreach";
    const clientId = process.env.KEYCLOAK_CLIENT_ID || "buzzbreach-client";

    // Get token from Keycloak using Resource Owner Password Credentials Grant
    const data = qs.stringify({
      client_id: clientId,
      username: email,
      password: password,
      grant_type: "password",
      scope: "openid profile email",
    });

    const tokenConfig = {
      method: "post",
      url: `${KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Forwarded-Proto": "https"
      },
      data: data,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    };

    const tokenResponse = await axios(tokenConfig);

    // Decode the token to get user info
    const decoded = jwt.decode(tokenResponse.data.access_token);

    // Get or create user in ArangoDB
    const cursor = await db.query(`
      FOR user in users 
      FILTER user.keycloakId == "${decoded.sub}" 
      RETURN user
    `);
    const existingUsers = await cursor.all();

    let user;
    if (existingUsers.length === 0) {
      // Create user in ArangoDB
      const newUser = {
        firstName: decoded.given_name || "",
        lastName: decoded.family_name || "",
        email: decoded.email || email,
        userType: "Individual",
        keycloakId: decoded.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };
      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _id: meta._id, _key: meta._key };
    } else {
      user = existingUsers[0];
    }
    
    // Ensure isOnboarded is always present (default to false if not set)
    // Handle both boolean and any other truthy values
    const isOnboardedValue = user.isOnboarded !== undefined 
      ? (user.isOnboarded === true || user.isOnboarded === 'true' || user.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...user,
      isOnboarded: isOnboardedValue,
    };

    // Log for debugging
    console.log(`[Login Keycloak] User ${user.email || 'unknown'} login - isOnboarded:`, user.isOnboarded, '->', isOnboardedValue);

    return res.status(200).json({
      success: true,
      token: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);

    // Handle Keycloak specific errors
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (error.response?.data?.error_description) {
      return res.status(401).json({ message: error.response.data.error_description });
    }

    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ========== KEYCLOAK MODE REGISTER ==========
const registerUserKeycloak = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1. Get Admin Token
    const adminToken = await getAdminToken();
    const realm = process.env.REALM_NAME || "buzzbreach";

    // Create HTTPS agent for all Keycloak requests
    const httpsAgent = new (require('https').Agent)({
      rejectUnauthorized: false
    });

    // 2. Create User in Keycloak
    const createUserConfig = {
      method: "post",
      url: `${KEYCLOAK_URL}/admin/realms/${realm}/users`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "X-Forwarded-Proto": "https"
      },
      data: JSON.stringify({
        username: email,
        email: email,
        firstName: firstName || "",
        lastName: lastName || "",
        enabled: true,
      }),
      httpsAgent: httpsAgent
    };

    try {
      await axios(createUserConfig);
    } catch (kcError) {
      if (kcError.response && kcError.response.status === 409) {
        return res.status(409).json({ message: "User already exists" });
      }
      throw kcError;
    }

    // 3. Get the new User's ID
    const getUserConfig = {
      method: "get",
      url: `${KEYCLOAK_URL}/admin/realms/${realm}/users?email=${email}`,
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        "X-Forwarded-Proto": "https"
      },
      httpsAgent: httpsAgent
    };

    const userList = await axios(getUserConfig);
    if (!userList.data || userList.data.length === 0) {
      throw new Error("Failed to retrieve created user from Keycloak");
    }
    const keycloakId = userList.data[0].id;

    // 4. Set Password
    const setPassConfig = {
      method: "put",
      url: `${KEYCLOAK_URL}/admin/realms/${realm}/users/${keycloakId}/reset-password`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        "X-Forwarded-Proto": "https"
      },
      data: JSON.stringify({
        type: "password",
        value: password,
        temporary: false,
      }),
      httpsAgent: httpsAgent
    };
    await axios(setPassConfig);

    // 5. Save User to ArangoDB
    const cursor = await db.query(`
      FOR user in users 
      FILTER user.keycloakId == "${keycloakId}" 
      RETURN user
    `);
    const existing = await cursor.all();

    let user;
    if (existing.length === 0) {
      const newUser = {
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        userType: "Individual",
        keycloakId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };

      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _id: meta._id, _key: meta._key };
    } else {
      user = existing[0];
    }

    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Registration Error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

// ========== MAIN FUNCTIONS (Auto-select based on mode) ==========
const loginUser = async (req, res) => {
  if (DEV_MODE) {
    console.log("[DEV MODE] Using local authentication");
    return loginUserDev(req, res);
  }
  return loginUserKeycloak(req, res);
};

const registerUser = async (req, res) => {
  if (DEV_MODE) {
    console.log("[DEV MODE] Using local registration");
    return registerUserDev(req, res);
  }
  return registerUserKeycloak(req, res);
};

// ========== OTHER FUNCTIONS (unchanged) ==========
const syncUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.sub) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const { sub: keycloakId, email, name, given_name, family_name } = decoded;

    const cursor = await db.query(`
      FOR user in users 
      FILTER user.keycloakId == "${keycloakId}" 
      RETURN user
    `);

    const checkUser = await cursor.all();
    let user;

    if (checkUser.length === 0) {
      console.log(`[Sync] Creating new user for ${email}`);
      const newUser = {
        firstName: given_name || (name ? name.split(" ")[0] : ""),
        lastName: family_name || (name ? name.split(" ")[1] : ""),
        email,
        userType: "Individual",
        keycloakId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };

      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _key: meta._key, _id: meta._id };
    } else {
      console.log(`[Sync] User found: ${email}`);
      user = checkUser[0];
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Sync Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const createIndividualUser = async (req, res) => {
  try {
    const { name, email, id } = req.body;
    const splitName = name.split(" ");

    const collection = db.collection("users");
    const cursor = await db.query(`
    FOR user in users 
      FILTER user.keycloakId == "${id}" 
      RETURN user
    `);
    const checkUser = await cursor.all();
    if (checkUser.length == 0 || checkUser == undefined) {
      const user = {
        firstName: splitName[0],
        lastName: splitName[1],
        email,
        userType: "Individual",
        keycloakId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userInfo = await collection.save(user);
      return res.status(200).json({ data: userInfo, message: "user created" });
    }
    return res.status(200).json({ data: checkUser[0], message: "user already exist" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const keycloakFunction = async ({ id, firstName, lastName }) => {
  if (DEV_MODE) return; // Skip in dev mode
  
  var data = qs.stringify({
    client_id: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
    username: process.env.KEYCLOAK_ADMIN_USERNAME,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    grant_type: process.env.KEYCLOAK_ADMIN_GRANT_TYPE,
  });
  var config = {
    method: "post",
    url: `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Forwarded-Proto": "https"
    },
    data: data,
  };
  const getToken = await axios(config)
    .then(function (response) {
      token = response.data.access_token;
      return token;
    })
    .catch(function (error) {
      console.log("Error getting Keycloak token:", error.message);
    });

  let updatedData = JSON.stringify({
    id: id,
    firstName: firstName,
    lastName: lastName,
  });

  let keycloakConfig = {
    method: "put",
    maxBodyLength: Infinity,
    url: `${KEYCLOAK_URL}/admin/realms/${process.env.REALM_NAME}/users/${id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
      "X-Forwarded-Proto": "https"
    },
    data: updatedData,
  };

  axios
    .request(keycloakConfig)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

const updateBasicInfo = async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    const id = req.user.sub;
    const cursor = await db.query(`FOR user IN users
    FILTER user.keycloakId== "${id}"
    RETURN user
    `);
    const collection = db.collection("users");
    const info = await cursor.all();
    const updateData = await collection.update(info[0]._key, updates);
    const getData = await collection.document(updateData._key);

    if (req.body.firstName || req.body.lastName) {
      keycloakFunction({
        id: id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      });
    }

    res.status(200).json({ data: getData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = req.user;
    const cursor = await db.query(`FOR user IN users
    FILTER user.keycloakId== "${user.sub}"
    RETURN user
    `);
    const info = await cursor.all();
    
    if (info.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userData = info[0];
    
    // Ensure isOnboarded is always present and properly formatted
    // Handle both boolean and any other truthy values
    const isOnboardedValue = userData.isOnboarded !== undefined 
      ? (userData.isOnboarded === true || userData.isOnboarded === 'true' || userData.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...userData,
      isOnboarded: isOnboardedValue,
    };
    
    // Log for debugging
    console.log(`[GetUserDetails] User ${userData.email || 'unknown'} - isOnboarded:`, userData.isOnboarded, '->', isOnboardedValue);
    
    res.status(200).json({ data: userResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========== COMPLETE ONBOARDING ==========
const completeOnboarding = async (req, res) => {
  try {
    const user = req.user;
    const { onboardingData } = req.body;

    // Find user by keycloakId (works for both dev and keycloak mode)
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.keycloakId == "${user.sub}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDoc = users[0];
    const collection = db.collection("users");

    // Update user with onboarding data and mark as onboarded
    const updates = {
      isOnboarded: true,
      onboardingData: onboardingData || {},
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.update(userDoc._key, updates);
    
    // Re-fetch the user to verify the update was saved
    const updatedUser = await collection.document(userDoc._key);
    
    // Verify the update was successful
    if (updatedUser.isOnboarded !== true && updatedUser.isOnboarded !== 'true' && updatedUser.isOnboarded !== 1) {
      console.error(`[Onboarding] WARNING: User ${userDoc.email} onboarding update may have failed. isOnboarded value:`, updatedUser.isOnboarded);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    // Ensure isOnboarded is explicitly true in response
    const userResponse = {
      ...userWithoutPassword,
      isOnboarded: true, // Always set to true since we just completed onboarding
    };

    // Log the updated user to verify isOnboarded was saved
    console.log(`[Onboarding] User ${userDoc.email} completed onboarding`);
    console.log(`[Onboarding] Database isOnboarded value:`, updatedUser.isOnboarded);
    console.log(`[Onboarding] Response isOnboarded value:`, userResponse.isOnboarded);
    
    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Complete onboarding error:", error.message);
    return res.status(500).json({ 
      message: "Failed to complete onboarding", 
      error: error.message 
    });
  }
};

const isUserClientAdmin = async (req, res, next) => {
  const user = req.user;
  try {
    if (user.resource_access?.[process.env.KEYCLOAK_CLIENT_ID]?.roles?.includes("admin")) {
      res.status(200).json({ message: "User is admin" });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const updateProfessionalProfile = async (req, res) => {
  try {
    const {
      workExperience,
      salaryExpectations,
      payStory,
      certifications,
      skills,
      language,
      education,
    } = req.body;
    const id = req.user.sub;
    const cursor = await db.query(`FOR user IN users
    FILTER user.keycloakId== "${id}"
    RETURN user
    `);
    const info = await cursor.all();
    const updates = {
      workExperience,
      salaryExpectations,
      payStory,
      certifications,
      skills,
      language,
      education,
      user: info[0]._key,
      updatedAt: new Date(),
    };
    const profile = db.collection("profile");
    const cursorProfile = await db.query(`FOR profile IN profile
      FILTER profile.user== "${info[0]._key}"
      RETURN profile
      `);
    const profileInfo = await cursorProfile.all();
    if (profileInfo.length == 0 || profileInfo == undefined) {
      const createProfile = await profile.save(updates);
      return res.status(200).json({ data: createProfile });
    }
    const updateData = await profile.update(profileInfo[0]._key, updates);
    const getData = await profile.document(updateData._key);
    return res.status(200).json({ data: getData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProfessionalProfile = async (req, res) => {
  try {
    const id = req.user.sub;
    const cursor = await db.query(`FOR user IN users
    FILTER user.keycloakId== "${id}"
    RETURN user
    `);
    const info = await cursor.all();

    const cursorProfile = await db.query(`FOR profile IN profile
      FILTER profile.user== "${info[0]._key}"
      RETURN profile
      `);
    const profileInfo = await cursorProfile.all();
    res.status(200).json({ data: profileInfo[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ========== FORGOT PASSWORD (Send OTP) ==========
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find user in ArangoDB
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      // Return success even if user doesn't exist (security)
      return res.status(200).json({ 
        success: true, 
        message: "If an account with that email exists, a verification code has been sent." 
      });
    }

    const user = users[0];

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in user document
    await db.collection("users").update(user._key, {
      resetOtp: hashPassword(otp), // Hash the OTP for security
      resetOtpExpiry: otpExpiry,
      updatedAt: new Date(),
    });

    // Always try to send email - use existing transporter utility
    let emailSent = false;
    let emailError = null;

    try {
      // Use the existing transporter utility that uses EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD
      const { otpEmail } = require("../../utils/otpEmail");

      console.log(`[Email] Attempting to send OTP to ${email}`);
      console.log(`[Email] OTP: ${otp}`);
      console.log(`[Email] DEV_MODE: ${DEV_MODE}`);
      console.log(`[Email] EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
      console.log(`[Email] EMAIL_HOST_USER: ${process.env.EMAIL_HOST_USER || 'NOT SET'}`);
      console.log(`[Email] EMAIL_HOST_PASSWORD: ${process.env.EMAIL_HOST_PASSWORD ? 'SET' : 'NOT SET'}`);

      // Send OTP email using the existing OTP email utility
      // The otpEmail function handles the "from" field formatting internally
      await otpEmail({
        firstName: user.firstName || "User",
        lastName: user.lastName || "",
        corporateEmail: email,
        otp: otp,
        isPasswordReset: true, // Mark as password reset email
      });

      emailSent = true;
      console.log(`[Email] ✅ Password reset OTP sent successfully to ${email}`);
    } catch (err) {
      emailError = err;
      console.error("[Email] ❌ Failed to send password reset OTP");
      console.error("[Email] Error message:", err.message);
      console.error("[Email] Error stack:", err.stack);
      console.error("[Email] Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      // Log configuration status
      console.error("[Email] Configuration check:");
      if (!process.env.EMAIL_HOST) {
        console.error("[Email] ❌ EMAIL_HOST is not configured in .env file");
      } else {
        console.log(`[Email] ✅ EMAIL_HOST: ${process.env.EMAIL_HOST}`);
      }
      if (!process.env.EMAIL_HOST_USER) {
        console.error("[Email] ❌ EMAIL_HOST_USER is not configured in .env file");
      } else {
        console.log(`[Email] ✅ EMAIL_HOST_USER: ${process.env.EMAIL_HOST_USER}`);
      }
      if (!process.env.EMAIL_HOST_PASSWORD) {
        console.error("[Email] ❌ EMAIL_HOST_PASSWORD is not configured in .env file");
      } else {
        console.log(`[Email] ✅ EMAIL_HOST_PASSWORD: SET`);
      }
    }

    // In DEV MODE or if email failed, also log the OTP for testing
    if (DEV_MODE || !emailSent) {
      console.log(`[DEV MODE] Password reset OTP for ${email}: ${otp}`);
      
      return res.status(200).json({ 
        success: true, 
        message: emailSent 
          ? "Verification code has been sent to your email." 
          : "Verification code generated. Check console/logs for the OTP (DEV MODE).",
        // Include OTP in dev mode or if email failed
        devOtp: otp 
      });
    }

    // Email sent successfully
    return res.status(200).json({ 
      success: true, 
      message: "Verification code has been sent to your email." 
    });

  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};

// ========== RESET PASSWORD ==========
const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: "Email, token, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Check if password contains both letters and numbers
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({ message: "Password must contain both letters and numbers" });
  }

  try {
    // Find user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = users[0];

    // Check token validity
    if (!user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check if token matches
    const hashedToken = hashPassword(token);
    if (user.resetToken !== hashedToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check if token is expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    const newHashedPassword = hashPassword(newPassword);
    await db.collection("users").update(user._key, {
      password: newHashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    });

    console.log(`[Auth] Password reset successful for ${email}`);

    return res.status(200).json({ 
      success: true, 
      message: "Password has been reset successfully. You can now login with your new password." 
    });

  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

// ========== VERIFY RESET OTP ==========
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // Find user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const user = users[0];

    // Check OTP validity
    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check if OTP matches
    const hashedOtp = hashPassword(otp);
    if (user.resetOtp !== hashedOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // OTP is valid
    console.log(`[Auth] OTP verified successfully for ${email}`);

    return res.status(200).json({ 
      success: true, 
      message: "Verification code verified successfully." 
    });

  } catch (error) {
    console.error("Verify reset OTP error:", error.message);
    return res.status(500).json({ message: "Failed to verify code", error: error.message });
  }
};

// ========== RESET PASSWORD WITH OTP ==========
const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Check if password contains both letters and numbers
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({ message: "Password must contain both letters and numbers" });
  }

  try {
    // Find user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}"
      RETURN user
    `);
    const users = await cursor.all();

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const user = users[0];

    // Check OTP validity
    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check if OTP matches
    const hashedOtp = hashPassword(otp);
    if (user.resetOtp !== hashedOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    // Update password and clear OTP
    const newHashedPassword = hashPassword(newPassword);
    await db.collection("users").update(user._key, {
      password: newHashedPassword,
      resetOtp: null,
      resetOtpExpiry: null,
      updatedAt: new Date(),
    });

    console.log(`[Auth] Password reset successful for ${email}`);

    return res.status(200).json({ 
      success: true, 
      message: "Password has been reset successfully. You can now login with your new password." 
    });

  } catch (error) {
    console.error("Reset password with OTP error:", error.message);
    return res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

// ========== OAUTH AUTHENTICATION ==========

// Google OAuth Login
const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Google ID token is required" });
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google" });
    }

    // Find or create user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}" OR user.googleId == "${googleId}"
      RETURN user
    `);
    const existingUsers = await cursor.all();

    let user;
    if (existingUsers.length === 0) {
      // Create new user
      const newUser = {
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        googleId,
        userType: "Individual",
        keycloakId: `google-${googleId}`,
        profilePicture: picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };
      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _id: meta._id, _key: meta._key };
    } else {
      // Update existing user with Google ID if not set
      user = existingUsers[0];
      if (!user.googleId) {
        await db.collection("users").update(user._key, {
          googleId,
          profilePicture: picture || user.profilePicture,
          updatedAt: new Date(),
        });
        user = await db.collection("users").document(user._key);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    const isOnboardedValue = userWithoutPassword.isOnboarded !== undefined 
      ? (userWithoutPassword.isOnboarded === true || userWithoutPassword.isOnboarded === 'true' || userWithoutPassword.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...userWithoutPassword,
      isOnboarded: isOnboardedValue,
    };

    console.log(`[Google OAuth] User ${email} logged in`);

    return res.status(200).json({
      success: true,
      token: token,
      refreshToken: token,
      expiresIn: 604800,
      user: userResponse,
    });
  } catch (error) {
    console.error("Google OAuth Error:", error.message);
    return res.status(401).json({ message: "Invalid Google token", error: error.message });
  }
};

// Facebook OAuth Login
const loginWithFacebook = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: "Facebook access token is required" });
  }

  try {
    // Verify token and get user info from Facebook
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id: facebookId, email, name, picture } = fbResponse.data;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Facebook" });
    }

    // Parse name
    const nameParts = (name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Find or create user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}" OR user.facebookId == "${facebookId}"
      RETURN user
    `);
    const existingUsers = await cursor.all();

    let user;
    if (existingUsers.length === 0) {
      // Create new user
      const newUser = {
        firstName,
        lastName,
        email,
        facebookId,
        userType: "Individual",
        keycloakId: `facebook-${facebookId}`,
        profilePicture: picture?.data?.url || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };
      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _id: meta._id, _key: meta._key };
    } else {
      // Update existing user with Facebook ID if not set
      user = existingUsers[0];
      if (!user.facebookId) {
        await db.collection("users").update(user._key, {
          facebookId,
          profilePicture: picture?.data?.url || user.profilePicture,
          updatedAt: new Date(),
        });
        user = await db.collection("users").document(user._key);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    const isOnboardedValue = userWithoutPassword.isOnboarded !== undefined 
      ? (userWithoutPassword.isOnboarded === true || userWithoutPassword.isOnboarded === 'true' || userWithoutPassword.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...userWithoutPassword,
      isOnboarded: isOnboardedValue,
    };

    console.log(`[Facebook OAuth] User ${email} logged in`);

    return res.status(200).json({
      success: true,
      token: token,
      refreshToken: token,
      expiresIn: 604800,
      user: userResponse,
    });
  } catch (error) {
    console.error("Facebook OAuth Error:", error.response?.data || error.message);
    return res.status(401).json({ message: "Invalid Facebook token", error: error.message });
  }
};

// Apple OAuth Login
const loginWithApple = async (req, res) => {
  const { identityToken, authorizationCode, user: appleUser } = req.body;

  if (!identityToken) {
    return res.status(400).json({ message: "Apple identity token is required" });
  }

  try {
    // Decode the identity token (JWT)
    const decoded = jwt.decode(identityToken);
    
    if (!decoded) {
      return res.status(400).json({ message: "Invalid Apple identity token" });
    }

    // Apple provides email in the token or in the user object (first time only)
    const email = decoded.email || appleUser?.email;
    const appleId = decoded.sub;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Apple" });
    }

    // Parse name if provided (only on first sign-in)
    const name = appleUser?.name;
    const firstName = name?.firstName || name?.givenName || "";
    const lastName = name?.lastName || name?.familyName || "";

    // Find or create user
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.email == "${email}" OR user.appleId == "${appleId}"
      RETURN user
    `);
    const existingUsers = await cursor.all();

    let user;
    if (existingUsers.length === 0) {
      // Create new user
      const newUser = {
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        appleId,
        userType: "Individual",
        keycloakId: `apple-${appleId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnboarded: false,
      };
      const meta = await db.collection("users").save(newUser);
      user = { ...newUser, _id: meta._id, _key: meta._key };
    } else {
      // Update existing user with Apple ID if not set
      user = existingUsers[0];
      const updates = { updatedAt: new Date() };
      
      if (!user.appleId) {
        updates.appleId = appleId;
      }
      
      // Update name if provided and user doesn't have it
      if (firstName && !user.firstName) {
        updates.firstName = firstName;
      }
      if (lastName && !user.lastName) {
        updates.lastName = lastName;
      }
      
      if (Object.keys(updates).length > 1) {
        await db.collection("users").update(user._key, updates);
        user = await db.collection("users").document(user._key);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    const isOnboardedValue = userWithoutPassword.isOnboarded !== undefined 
      ? (userWithoutPassword.isOnboarded === true || userWithoutPassword.isOnboarded === 'true' || userWithoutPassword.isOnboarded === 1)
      : false;
    
    const userResponse = {
      ...userWithoutPassword,
      isOnboarded: isOnboardedValue,
    };

    console.log(`[Apple OAuth] User ${email} logged in`);

    return res.status(200).json({
      success: true,
      token: token,
      refreshToken: token,
      expiresIn: 604800,
      user: userResponse,
    });
  } catch (error) {
    console.error("Apple OAuth Error:", error.message);
    return res.status(401).json({ message: "Invalid Apple token", error: error.message });
  }
};

// Log the mode and effective Keycloak URL on startup
console.log(`[Auth] Running in ${DEV_MODE ? "DEVELOPMENT" : "PRODUCTION (Keycloak)"} mode`);
console.log(`[Auth] Effective KEYCLOAK_URL: ${KEYCLOAK_URL || "NOT SET"}`);

module.exports = {
  registerUser,
  loginUser,
  syncUser,
  getUserDetails,
  isUserClientAdmin,
  createIndividualUser,
  updateBasicInfo,
  updateProfessionalProfile,
  getProfessionalProfile,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
  completeOnboarding,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
};

