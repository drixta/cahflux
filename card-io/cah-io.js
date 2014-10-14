const utils = require('../utils/utils');
const cardsdb = require('../utils/cardsdb');
var io = require('../server');
/*
	STATUS
	Wait for at least 4 players -> chose B players -> B player draws a black card -> W players put in cards within 30 seconds
	-> everyone sees the card -> B player choose the card in 1 minute -> A W player gain a point and card-> Choose next B player

	data structure
	rooms = {
		lobby: {
			'Bob' : socketInfo,
			'Jill': socketInfo
		},
		111999: {
			users : {
				'Bob' : socketInfo,
				'Jill': socketInfo
			},
			white: [],
			black: [],
			status: ''
		},
		222999: {
			users : {
				'Bob' : socketInfo,
				'Jill': socketInfo
			},
			white: [],
			black: [],
			status: ''
		}
	}
*/
var rooms = {
	lobby: {}
};

function main(socket) {
	var address = socket.handshake.address;
	console.log('New connection from ' + address + ':' + socket.id);
	socket.on('create user', createUser.bind(socket));
	socket.on('join room', joinRoom.bind(socket));
	socket.on('leave room', leaveRoom.bind(socket));
	socket.on('disconnect', disconnect.bind(socket));
	socket.on('change name', changeName.bind(socket));
}

function createUser(name){
	this.name = name;
	this.room = 'lobby';
	rooms.lobby[name] = this;
	this.emit('lobby user list', Object.keys(rooms.lobby));
}

function joinRoom(room){
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
}
module.exports = main;