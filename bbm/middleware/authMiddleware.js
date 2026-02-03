// Auth middleware with support for both Keycloak and Dev mode
const jwt = require("jsonwebtoken");

// Check if we're in development mode (no Keycloak)
const DEV_MODE = !process.env.KEYCLOAK_URL || process.env.DEV_MODE === "true";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  token = token.split(" ")[1];

  try {
    if (DEV_MODE) {
      // Development mode - use simple JWT verification
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } else {
      // Production mode - use Keycloak public key
      const keycloakSecret = process.env.KEYCLOAK_PUBLIC_KEY;
      
      if (!keycloakSecret) {
        console.error("KEYCLOAK_PUBLIC_KEY not set");
        return res.status(500).json({ message: "Server configuration error" });
      }
      
      // Convert Keycloak public key to PEM format for jose
      const pem = `-----BEGIN PUBLIC KEY-----\n${keycloakSecret}\n-----END PUBLIC KEY-----`;

      const { jwtVerify, importSPKI } = await import("jose");
      const publicKey = await importSPKI(pem, "RS256");
      const { payload } = await jwtVerify(token, publicKey);
      req.user = payload;
      next();
    }
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const isClientAdmin = (req, res, next) => {
  const user = req.user;
  
  // In dev mode, skip admin check or implement a simple one
  if (DEV_MODE) {
    // For dev mode, check if user has admin flag
    if (user.isAdmin === true) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden: Admin role required" });
  }
  
  // Production mode - check Keycloak roles
  const clientId = process.env.KEYCLOAK_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ message: "Server error: Client ID is not configured" });
  }

  if (
    user.resource_access &&
    user.resource_access[clientId] &&
    user.resource_access[clientId].roles.includes("admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin role required" });
  }
};

module.exports = {
  authMiddleware,
  isClientAdmin,
};
