const express = require('express');
const app = express();
const fs = require('fs');
const router = express.Router();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
const util = require('./utils/utils');
const cah = require('./card-io/cah-io');
const redis = require('redis');

exports.io = io;
app.use(express.static(__dirname + '/dist'));
io.sockets.on('connection', cah);



http.listen(process.env.PORT || 3000, function(){  //CONFIG.port
  console.log("Server running on port " + 3000);
});