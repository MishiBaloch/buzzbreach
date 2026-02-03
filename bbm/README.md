# BuzzBreach Backend API

A Node.js/Express backend with Keycloak authentication and OpenAPI (Swagger) documentation.

## Quick Start

### 1. Clone & Install
```sh
git clone <repo-url>
cd buzzbreach-be-v1
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory with these variables:
```
KEYCLOAK_REALM=buzzbreach
KEYCLOAK_CLIENT_ID=buzzbreach-backend
KEYCLOAK_CLIENT_SECRET=<your-client-secret>
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_ISSUER=http://localhost:8080/realms/buzzbreach
KEYCLOAK_PUBLIC_KEY=<your-keycloak-public-key>
ARANGODB_URL=http://localhost:8529
ARANGODB_DATABASE=buzzbreach
ARANGODB_USERNAME=root
ARANGODB_PASSWORD=test
```
- Get `KEYCLOAK_PUBLIC_KEY` from Keycloak Admin Console → Realm Settings → Keys → Active RSA key → Public Key (copy only the base64 string, no headers/footers).

### 3. Start Keycloak (Step-by-Step)

#### A. Run Keycloak Locally
1. Download Keycloak from [keycloak.org](https://www.keycloak.org/downloads).
2. Extract and open a terminal in the Keycloak directory.
3. Start Keycloak:
   ```sh
   bin/kc.bat start-dev   # (Windows)
   ```
   or
   ```sh
   bin/kc.sh start-dev    # (Linux/Mac)
   ```
4. Open [http://localhost:8080/](http://localhost:8080/) in your browser.

#### B. Create the Initial Admin User
1. If prompted, create an admin user:
   ```sh
   bin/kc.bat create-admin --user admin --password admin
   ```
   (or use your own username/password)

#### C. Log in to the Keycloak Admin Console
- Go to [http://localhost:8080/](http://localhost:8080/)
- Log in with your admin credentials.

#### D. Create a Realm
1. In the left sidebar, click **Realm selector** (top left) → **Create realm**.
2. Enter a name (e.g., `buzzbreach`), click **Create**.

#### E. Create a Client
1. In your realm, go to **Clients** → **Create client**.
2. Set **Client ID**: `buzzbreach-backend`
3. Click **Next**.
4. Set **Client authentication**: ON (for confidential client)
5. Set **Access type**: `confidential`
6. Set **Valid redirect URIs**: `*` (for testing)
7. Click **Save**.
8. After saving, go to the **Credentials** tab and copy the **Secret** (for your `.env`).

#### F. Enable Direct Access Grants
1. In your client (`buzzbreach-backend`), go to the **Settings** tab.
2. Scroll down to **Authentication Flow Overrides**.
3. Set **Direct Access Grants Enabled**: ON.
4. Click **Save**.

#### G. Create a User
1. Go to **Users** → **Add user**.
2. Fill in **Username** , email, etc.
3. Click **Create**.

#### H. Set a Permanent Password
1. After creating the user, go to the **Credentials** tab.
2. Enter a password (e.g., `root`).
3. Set **Temporary**: OFF (so the user does not need to change it at first login).
4. Click **Set Password**.

#### I. Remove Required Actions
1. In the **Details** tab, ensure **Required User Actions** is empty.
2. Make sure **Email Verified** is ON (optional, but helps avoid issues).
3. Make sure **Enabled** is ON.

---

### 4. Initialize Database Collections
Before starting the backend, run the following command to create required ArangoDB collections:
```sh
node createCollections.js
```
- Ensure your ArangoDB server is running and the `.env` variables for ArangoDB are set correctly.

### 5. Start the Backend
```sh
node server.js
```

### 6. Get a JWT Token
Use curl to get a token:
```sh
curl -X POST 'http://localhost:8080/realms/buzzbreach/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=buzzbreach-backend' \
  -d 'client_secret=qlyRcHsrDpy8eKu2vXVoWIa5cA5mkWaH' \
  -d 'username=<your-username>' \
  -d 'password=<your-password>' \
  -d 'grant_type=password'
```
- Copy the `access_token` from the response.

### 7. Test Protected APIs
Use the token in the `Authorization` header:
```sh
curl -X GET 'http://localhost:5000/api/v1/user/isadmin' \
  -H 'Authorization: Bearer <your-access-token>'
```

### 8. API Documentation
- Open `swagger.json` for OpenAPI docs and example payloads.
- You can use Swagger UI or Postman for interactive testing.

---

## Troubleshooting
- **401 Unauthorized:**
  - Check your token is fresh and valid.
  - Ensure `KEYCLOAK_PUBLIC_KEY` matches the active Keycloak public key.
  - Restart backend after changing `.env`.
- **Token signature errors:**
  - Double-check the public key format (no headers/footers in `.env`).
- **404 Not Found:**
  - The endpoint may not be implemented yet.

---

## Adding Endpoints
- Add new route handlers in the appropriate `corporate/*/route.js` files.
- Update `swagger.json` to document new endpoints and payloads.

---

## Contact
For help, check the code comments, this README, or ask the project maintainer.
