const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const redisClient = require('./config/redis');
const http = require("http");
const {
  getStudentDetail,
  getStudentDetailWithCache,
  createStudent,
} = require("./controllers/student.controller");
const { createStudentSchema } = require("./validations/student.validation");
const { idSchema } = require("./validations/common.validation");
const { validateBodyRequest } = require("./middlewares/validation.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Tạo server http
const server = http.createServer(app);
// Connect db
dbConnect();

// Connect redis server in docker
redisClient.connect();

app.use(bodyParser.json());
app.use(cors());
app.get("/api/students/:id", getStudentDetail);
app.get("/api/students-cache/:id", getStudentDetailWithCache);
app.post(
  "/api/students",
  validateBodyRequest(createStudentSchema),
  createStudent
);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server start in PORT ${PORT}`);
});
