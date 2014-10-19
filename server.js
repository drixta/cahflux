const express = require('express');
const app = express();
const fs = require('fs');
const router = express.Router();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
const util = require('./utils/utils');
const CahIo = require('./card-io/cah-io');

app.use(express.static(__dirname + '/dist'));

new CahIo({io: io}).init();

http.listen(process.env.PORT || 3000, function(){  //CONFIG.port
  console.log("Server running on port " + 3000);
});