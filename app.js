const http = require('http');
const express = require('express');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
