const utils = require('../utils/utils');
const cardsdb = require('../utils/cardsdb');
/*
	STATUS
	Wait for at least 4 players -> choose B players -> B player draws a black card -> W players put in cards within 30 seconds
	-> everyone sees the card -> B player choose the card in 1 minute -> A W player gain a point and card-> Choose next B player

	CONST_STATUS =
	{
		0: wait for 4 player
		2: wait for W players put cards for 3 seconds
		3: wait for B player to pick a card
		4: wait for timeout for gaining points and card and choosing next B player
	}
	Every time the room change status, check all clients are ready
	Each status has its own data structure to manage the state of the game:

	For example:
		0: {
			status: {
				stage: CONST_STATUS['0'],
				wait: true,
				readyPlayers: 3
			}
		}
		1: {
			status: {
				stage: CONST_STATUS['0']
			}
		}

	schema
	users : {
		1: {
			name : '',
			bcard: [], //exist when users is not in lobby
			
		}
	}
	rooms : {
		['name'] : {
			users: ['id1','id2','id3'];
			Wcards: ['id1','id2','id3'];
			Qcards: ['id1','id2','id3'];
			usedCards: ['id1','id2','id3'];
			state: 0,1,2,3,4,5
			time: null
			readyCount: null
		}
		cah-lobby: {
			users: {'id1': true,'id2': true,'id3': true}
		}
	}
*/
var redis;
var CahIo = function(options){
	this.io = options.io;
	redis = options.redis;
};

CahIo.prototype.init = function(){
	var self = this;
	this.io.on('connection',function(socket){
		self.main(socket);
	});
};

CahIo.prototype.main = function(socket){
	var user;
	user = new User(socket, this.io);
};

var User = function(socket, io){
	this.socket = socket;
	this.io = io;
	var address = socket.handshake.address;
	console.log('New connection from ' + address + ':' + socket.id);
	this.socket.on('disconnect', this.disconnect);
	this.socket.on('get room', this.getRoom);
	this.socket.on('init user', this.initUser);
	this.socket.on('change name', this.changeName);
	this.socket.on('join room', this.joinRoom);
	this.socket.on('leave room', this.leaveRoom);
};

User.prototype.getRoom = function(name){
	var self = this;
	var result;
	redis.getRoom(name, function(err, res){
		console.log('server get room:' + name);
		console.log(res);
		result = utils.convertObjectNameToArray(res.users);
		self.emit('room response', result);
	});
};

User.prototype.initUser = function(name){
	var self = this;
	this.leave(this.id);
	this.join('cah-lobby');
	this.room = 'cah-lobby';
	this.name = name;
	redis.initUser({
		id: self.id,
		name: name,
	});
};

User.prototype.joinRoom = function(name) {
	var self = this;
	this.emit('leave room');
	redis.joinRoom({
		id: self.id,
		name: self.name
	}, name);
	this.join(name);
	this.room = name;
};

User.prototype.leaveRoom = function(){
	redis.leaveRoom({
		id: this.id,
	}, this.rooms[0]);
	this.leave(this.rooms[0]);
};

User.prototype.changeName = function(){

};

User.prototype.disconnect = function(){
	redis.disconnect(this.id);
	if (!this.room) {
		return;
	}
	redis.leaveRoom({
		id: this.id
	}, this.room);
	console.log('User '+ this.id +' with name '+ this.name +' has disconnected');
};

/*function joinRoom(room){
	if (rooms.hasOwnProperty(room)){
		if (rooms[room].users.hasOwnProperty(this.name)){
			throw new Error('User with this name already exist in this room:' + this.name);
		}
		this.join(room);
	}
	else {
		createDefaultRoom(room);
		this.join(room);
	}
	this.room = room;
	rooms[room].users[this.name] = this;
	delete rooms.lobby[this.name];
	console.log(this.name + ' joined room:' + this.room);
	this.emit('room user list', Object.keys(rooms[room].users));
	console.log(utils.findClientsSocket(io.io, this.room));
}

function getRoomInfo(room){
	if (rooms[room]) {
		this.emit('room status')
	}
}

function createDefaultRoom(room){
	var OPTION = {
		users: {},
		white: cardsdb.getNAmountOfCards(500, 'W'),
		black: cardsdb.getNAmountOfCards(50, 'B'),
		status: 'waiting for more players',
	};
	if (rooms.hasOwnProperty(room)) {
		throw new Error('ERROR: Room '+ room+' exists');
	}
	rooms[room] = OPTION;
}

function leaveRoom(room){
	if (rooms.hasOwnProperty(room) && rooms[room].users.hasOwnProperty(this.name)){
		this.leave(room);
		console.log(this.name + ' left room:' + room);
		delete rooms[room].users[this.name];
	}
	else if (!Object.keys(rooms[room].users)) {
		delete rooms[room];
		console.log(room + ' is empty, removing room');
	}
	else {
		throw new Error('Room does not exist or user does not exist');
	}
	this.room = 'lobby';
	rooms.lobby[this.name] = this;
	this.emit('lobby user list', Object.keys(rooms.lobby));
}

function changeName(name){
	if (this.room === 'lobby'){
		console.log(this.name + ' changed name to:' + name);
		rooms[this.room][this.name] = name;
		this.name = name;
		this.emit('lobby user list', Object.keys(rooms.lobby));
	}
	else if (this.room) {
		console.log('Can\'t change name while already in a room');
		return;
	}
	else {
		throw new Error('User isn\'t in any room, can\'t change name');
	}
}
function disconnect(){
	if (this.room === 'lobby'){
		delete rooms.lobby[this.name];
	}
	else if (this.room && this.name){
		this.leave(this.room);
		delete rooms[this.room].users[this.name];
	}
	else {
		throw new Error('This user doesn\'t have a room');
	}
	console.log(this.name + ' has disconnected and left room:' + this.room);
}*/
module.exports = CahIo;