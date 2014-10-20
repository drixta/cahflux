const redis = require('redis');
const jsonify = require('redis-jsonify');

var standardCallback = function(err,res) {
	if (err) 
		throw err;
	else 
		return res;
};

var CahRedis = function(){
	this.client = jsonify(redis.createClient());
	this.client.flushall();
};

CahRedis.prototype.init = function() {
	this.createLobby();
};
CahRedis.prototype.createLobby = function() {
	this.client.hset('rooms', 'cah-lobby', {users: {}}, redis.print);
};
//Rooms

CahRedis.prototype.getRoom = function(name, callback) {
	this.client.hget('rooms', name, function(err,res){
		if (typeof callback === 'function'){
			callback(err,res);
		}
		else {
			redis.print(err,res);
		}
	});
};

CahRedis.prototype.createRoom = function(name, callback) {
	var result;
	defaultRoom = {
		users: {},
		WCards: {},
		QCards: {},
		used_cards: {},
		state: 0,
		count_down: undefined,
		ready_count: 0
	};
	this.client.hset('rooms', name, defaultRoom, function(err, res){
		redis.print(err, res);
	});
};

CahRedis.prototype.addUserToLobby = function(room, id, name){
	var self = this;
	this.getRoom('cah-lobby', function(err, res){
		var result;
		if (err) {
			throw err;
		}
		if (res.users[id] === null || 'undefined' === typeof res.users[id]) {
			res.users[id] = name;
			self.client.hset('rooms', 'cah-lobby', res, redis.print);
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
			callback(err,res);
		}
		else {
			redis.print(err,res);
		}
	});
};

CahRedis.prototype.initUser = function(user, callback){
	var req = {
		name: user.name,
	};
	this.client.hset('users', user.id, req, redis.print);
	this.addUserToLobby('cah-lobby',user.id, user.name);
};

CahRedis.prototype.joinRoom = function(user, room) {
	var self = this;
	this.getRoom(room, function(err, res){
		debugger;
		if (res) {
			res.users[user.id] = user.name;
			self.client.hset('rooms', room, res, redis.print);
		}
		else {
			self.createRoom(room, function(err, res){
				res.users[user.id] = user.name;
				self.client.hset('rooms', room, res, redis.print);
			});
		}
	});
};

CahRedis.prototype.leaveRoom = function(user,room) {
	var self = this;
	this.getRoom(room, function(err, res){
		var count = 0;
		if (res && res.users[user.id]) {
			res.users[user.id] = undefined;
		}
		for (var i in res.users) {
			if(res.users[i]) {
				count++;
			}
		}
		if (count === 0 && room !== 'cah-lobby') {
			self.client.hdel('rooms', room, redis.print);
		}
		else {
			self.client.hset('rooms', room, res, redis.print);
		}
	});
};

CahRedis.prototype.disconnect = function(id) {
	var self = this;
	this.getUser(id, function(err,res){
		if (res) {
			self.client.hdel('users', id, res.print);
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
		this.client.hset('users', user.id, res, redis.print);
	});
};
//TODO createUser, getUser, getUserGroup etc.

module.exports = CahRedis;