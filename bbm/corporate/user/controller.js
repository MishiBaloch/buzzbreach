const { db } = require("../../database/config");
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Check if we're in development mode (no Keycloak)
const DEV_MODE = !process.env.KEYCLOAK_URL || process.env.DEV_MODE === "true";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

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
    url: `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: data,
  };

  const response = await axios(config);
  return response.data.access_token;
};

// ========== DEV MODE LOGIN (No Keycloak) ==========
const loginUserDev = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

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

    return res.status(200).json({
      success: true,
      token: token,
      refreshToken: token, // Same token for dev mode
      expiresIn: 604800, // 7 days
      user: userWithoutPassword,
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
      url: `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: data,
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

    return res.status(200).json({
      success: true,
      token: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in,
      user: user,
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

    // 2. Create User in Keycloak
    const createUserConfig = {
      method: "post",
      url: `${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      data: JSON.stringify({
        username: email,
        email: email,
        firstName: firstName || "",
        lastName: lastName || "",
        enabled: true,
      }),
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
      url: `${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users?email=${email}`,
      headers: { Authorization: `Bearer ${adminToken}` },
    };

    const userList = await axios(getUserConfig);
    if (!userList.data || userList.data.length === 0) {
      throw new Error("Failed to retrieve created user from Keycloak");
    }
    const keycloakId = userList.data[0].id;

    // 4. Set Password
    const setPassConfig = {
      method: "put",
      url: `${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users/${keycloakId}/reset-password`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      data: JSON.stringify({
        type: "password",
        value: password,
        temporary: false,
      }),
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
    url: `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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
    url: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.REALM_NAME}/users/${id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
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
    
    res.status(200).json({ data: info[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

// ========== FORGOT PASSWORD ==========
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
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in user document
    await db.collection("users").update(user._key, {
      resetToken: hashPassword(resetToken), // Hash the token for security
      resetTokenExpiry,
      updatedAt: new Date(),
    });

    // In DEV MODE, we'll log the reset link instead of sending email
    if (DEV_MODE) {
      console.log(`[DEV MODE] Password reset token for ${email}: ${resetToken}`);
      console.log(`[DEV MODE] Reset link: http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
      
      return res.status(200).json({ 
        success: true, 
        message: "Password reset link has been sent to your email.",
        // Include token in dev mode for testing
        devToken: resetToken 
      });
    }

    // PRODUCTION MODE - Send email using nodemailer
    try {
      const nodemailer = require("nodemailer");
      
      // Create transporter - configure these in .env
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"BuzzBreach" <noreply@buzzbreach.com>',
        to: email,
        subject: "Password Reset Request - BuzzBreach",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6C63FF;">Password Reset Request</h2>
            <p>Hello ${user.firstName || "User"},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #6C63FF; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">BuzzBreach Team</p>
          </div>
        `,
      });

      console.log(`[Email] Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
      // Don't reveal email sending failure to user
    }

    return res.status(200).json({ 
      success: true, 
      message: "If an account with that email exists, a password reset link has been sent." 
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

// Log the mode on startup
console.log(`[Auth] Running in ${DEV_MODE ? "DEVELOPMENT" : "PRODUCTION (Keycloak)"} mode`);

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
};
