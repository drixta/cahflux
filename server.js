var express = require('express');
var app = express();
var fs = require('fs');
var router = express.Router();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var util = require('./utils/utils');
var userlist = {};

app.use(express.static(__dirname + '/dist'));
io.sockets.on('connection', function(socket){
	var address = socket.handshake.address;
	console.log('New connection from ' + address + ':' + address.port);
	console.log(util.findClientsSocket(io));
	socket.on('create user', function(name){
		userlist[name]   = true;
		socket.emit('user list', userlist);
	});
});

http.listen(process.env.PORT || 3000, function(){  //CONFIG.port
  console.log("Server running on port " + 3000);
});