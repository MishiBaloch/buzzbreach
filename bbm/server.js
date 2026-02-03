const express = require("express");
const colors = require("colors");
const env = require("dotenv");
const { db } = require("./database/config");
const routes = require("./routes/route");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const {sendReminderEmails} = require('./corporate/events/controller');

// Swagger UI setup
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

sendReminderEmails();

env.config();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import Routes
app.use("/api/v1", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`.yellow.bold);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`.cyan.bold);
});
