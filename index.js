
const express = require("express");
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const redisClient = require('./config/redis');
const http = require('http');
const { getStudentDetail, getStudentDetailWithCache } = require("./controllers/student.controller");
// Tạo server http
const server = http.createServer(app);
// Connect db
dbConnect();

// Connect redis server in docker
redisClient.connect();

app.use(cors());
app.get('/api/students/:id',getStudentDetail);
app.get('/api/students-cache/:id',getStudentDetailWithCache);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server start in PORT ${PORT}`);
});