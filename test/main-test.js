var should = require('chai').should();
var io = require('socket.io-client');

var SOCKET_URL = 'http://0.0.0.0:3000';

var user1 = {
	name: 'Bob',
	room: '4321a'
};
var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("CAH User",function(){
	it('Should be able to be created and join a room', function(done){
		var client1 = io.connect(SOCKET_URL, options);
		client1.on('connect', function(data){
			client1.emit('create user', user1.name);
			client1.on('user list', function(users){
				users.should.have.property('Bob');
				done();
			});
		});
	});
	it('Should be able to broadcast new user to the room', function(done){
	});
	it('Should be able to leave the room and reenter a new room', function(done){
	});
	it('Should be able to get room information when enter a new room', function(done){
	});
	it('Should be able to change their name', function(done){
	});
});