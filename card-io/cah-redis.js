const redis = require('redis');

var standardCallback = function(err,res) {
	if (err) 
		throw err;
	else 
		console.log(res);
		return res;
};

var CahRedis = function(){
	this.client = redis.createClient();
};

CahRedis.prototype.init = function() {
	this.createLobby();
};
CahRedis.prototype.createLobby = function() {
	this.client.hset('rooms', 'cah-lobby', '{"users": {}}', function(err,res){
		return standardCallback(err,res);
	});
};
//Rooms

CahRedis.prototype.getRoom = function(name, callback) {
	this.client.hget('rooms', name, function(err,res){
		if (typeof callback === 'function'){
			callback(err,JSON.parse(res));
		}
		else {
			standardCallback(err,JSON.parse(res));
		}
	});
};

CahRedis.prototype.createRoom = function(name, callback) {
	var result;
	defaultRoom = {
		users: [],
		WCards: [],
		QCards: [],
		used_cards: [],
		state: 0,
		count_down: null,
		ready_count: 0
	};
	defaultRoom = JSON.stringify(defaultRoom);
	this.client.hset('rooms', name, defaultRoom, function(err, res){
		standardCallback(err, res);
	});
};

CahRedis.prototype.addUserToLobby = function(room, id, name){
	var self = this;
	this.getRoom('cah-lobby', function(err, res){
		var result;
		if (err) {
			throw err;
		}
		if (res[id] === null || 'undefined' === typeof res[id]) {
			res[id] = name;
			result = JSON.stringify(res);
			self.client.hset('rooms', 'cah-lobby', result, function(err,res){
				console.log('adding user to lobby');
				standardCallback(err,res);
			});
		}
		else {
			throw new Error('User with id' + id + ' already exist in the game');
		}
	});
};

//Users

CahRedis.prototype.getUser = function(id,callback){
	this.client.hget('users', id, function(err, res){
		if (typeof callback === 'function') {
			callback(err,JSON.parse(res));
		}
		else {
			standardCallback(err,JSON.parse(res));
		}
	});
};

CahRedis.prototype.initUser = function(user, callback){
	var req = {
		name: user.name,
		room: 'cah-lobby'
	};
	this.client.hset('users', user.id, JSON.stringify(req), function(err, res){
		standardCallback(err, res);
	});
	this.addUserToLobby('cah-lobby',user.id, user.name);
};

CahRedis.prototype.joinRoom = function(user, room) {
	this.getRoom(room, function(err, res){
		if (res) {
			this.client.hset('rooms');
		}
		else {
			this.createRoom(room);
		}
	});
};

CahRedis.prototype.changeName = function(user) {
	this.getUser(user.id, function(err, res){
		var result;
		if (res) {
			res.name = user.name;
		}
		else {
			throw new Error('User id ' + user.id + ' not found');
		}
		result = JSON.stringify(res);
		this.client.hset('users', user.id, result, function(err, res){
			return standardCallback(err,res);
		});
	});
};
//TODO createUser, getUser, getUserGroup etc.

module.exports = CahRedis;