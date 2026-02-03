const { Database } = require("arangojs");
const env = require("dotenv");
env.config();

const maxRetries = 5;
const retryDelay = 1000; // 1 second delay between retries

async function connectWithRetry(db, retries = maxRetries) {
  try {
    await db.get();
    console.log("Successfully connected to ArangoDB");
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Connection failed. Retrying... (${
          maxRetries - retries + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay)); // wait before retrying
      return connectWithRetry(db, retries - 1);
    } else {
      console.error(
        "Failed to connect to ArangoDB after multiple retries:",
        error.message
      );
      process.exit(1);
    }
  }
}

const db = new Database({
  url: process.env.ARANGO_URL,
  databaseName: process.env.ARANGO_DATABASE_NAME,
  auth: {
    username: process.env.ARANGO_USERNAME,
    password: process.env.ARANGO_PASSWORD,
  },
  agentOptions: {
    timeout: 60000,
  },
});

connectWithRetry(db);

module.exports = { db };

// const { Database } = require("arangojs");
// const env = require("dotenv");
// env.config();

// const db = new Database({
//   url: process.env.ARANGO_URL,
//   databaseName: process.env.ARANGO_DATABASE_NAME,
//   auth: {
//     username: process.env.ARANGO_USERNAME,
//     password: process.env.ARANGO_PASSWORD,
//   },
//   agentOptions: {
//     timeout: 60000,
//   },
// });

// db.get().catch((error) => {
//   console.error("Failed to connect to ArangoDB:", error.message);
//   process.exit(1);
// });

// module.exports = { db };
