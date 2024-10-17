
const express = require("express");
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const redisClient = require('./config/redis');
const http = require('http');
const { generateMockData } = require("./controllers/mockdata.controller");
// Tạo server http
const server = http.createServer(app);
// Connect db
dbConnect();

// Connect redis server in docker
// redisClient.connect();

app.use(cors());
app.post('/api/hotels/mock-data',generateMockData)
// app.use('/api/hotels/');

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server start in PORT ${PORT}`);
});