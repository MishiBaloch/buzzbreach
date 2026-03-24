// Auth middleware with support for both Keycloak and Dev mode
const jwt = require("jsonwebtoken");

// Check if we're in development mode (no Keycloak)
const DEV_MODE = !process.env.KEYCLOAK_URL || process.env.DEV_MODE === "true";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const keyStoreCache = new Map();

const normalizeBaseUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  let out = url.trim();
  if (out.endsWith("/")) out = out.slice(0, -1);
  const realmsIdx = out.indexOf("/realms/");
  if (realmsIdx !== -1) out = out.slice(0, realmsIdx);
  if (out.startsWith("http://")) out = "https://" + out.slice("http://".length);
  return out;
};

const getRealmFromToken = (token) => {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    const iss = payload?.iss;
    const match = typeof iss === "string" ? iss.match(/\/realms\/([^/]+)/) : null;
    return match?.[1] || null;
  } catch (_) {
    return null;
  }
};

const getKeycloakRealm = (token) => {
  return process.env.REALM_NAME || process.env.KEYCLOAK_REALM || getRealmFromToken(token) || "master";
};

const getJwks = async (realm) => {
  const { createRemoteJWKSet } = await import("jose");
  const base = normalizeBaseUrl(process.env.KEYCLOAK_URL);
  if (!base) throw new Error("KEYCLOAK_URL not configured");
  const jwksUrl = `${base}/realms/${realm}/protocol/openid-connect/certs`;
  if (!keyStoreCache.has(jwksUrl)) {
    keyStoreCache.set(jwksUrl, createRemoteJWKSet(new URL(jwksUrl)));
  }
  return keyStoreCache.get(jwksUrl);
};

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
      return;
    }

    // Production mode - first try Keycloak verification
    try {
      const realm = getKeycloakRealm(token);
      const jwks = await getJwks(realm);
      const { jwtVerify } = await import("jose");
      const { payload } = await jwtVerify(token, jwks);
      req.user = payload;
      next();
      return;
    } catch (kcErr) {
      // Fallback: accept dev-issued JWTs signed with JWT_SECRET.
      // This helps when the app logs in with email/password (dev flow)
      // while the server has KEYCLOAK_URL configured.
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
        return;
      } catch (_) {
        // Re-throw original Keycloak error for clearer diagnostics
        throw kcErr;
      }
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
