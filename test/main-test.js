var should = require('chai').should();
var io = require('socket.io-client');

var SOCKET_URL = 'http://0.0.0.0:3000';

var user1 = {
	name: 'Bob',
	room: '4321a'
};
var user2 ={
	name: 'Jill',
	room: '4321a'
};
var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("CAH User",function(){
	it('Should be able to be created and join a room', function(done){
		var client1 = io.connect(SOCKET_URL,options);
		client1.on('connect', function(data){
			client1.emit('create user', user1.name);
			client1.on('user list', function(users){
				users.should.have.property(user1.name);
				done();
			});
		});
		client1.disconnect();
	});
	it('Should be able to broadcast new user to the room', function(done){
		var client1 = io.connect(SOCKET_URL, options);
		client1.on('connect', function(data){
			var client2 = io.connect(SOCKET_URL, options);
			client1.emit('create user', user1.name);
			client1.emit('join room', user1.room);
			client2.on('connect', function(data){
				client2.emit('create user', user2.name);
				client2.emit('join room', user2.room);
			});
			client1.on('user list', function(users){
				users.should.have.property(user2.name);
				client1.disconnect();
				client2.disconnect();
			});
		});
	});
	it('Should be able to leave the room and reenter a new room', function(done){
		var client1 = io.connect(SOCKET_URL, options);
		client1.on('connect', function(data){
			client1.emit('create user', user1.name);
			client1.emit('join room', user1.room);

			client1.on('user list', function(users){

				users.should.have.property(user1.name);
				client1.emit('leave room', user1.room);

				client1.on('user list', function(users){

					users.should.not.have.property(user1.name);
					client1.emit('join room', user1.room);

					client1.on('user list', function(users){
						users.should.have.property(user1.name);
						client1.disconnect();
					});
				});
			});
		});
	});

	it('Should be able to get room information when enter a new room', function(done){
	});
	it('Should be able to change their name', function(done){
		var client1 = io.connect(SOCKET_URL, options);
		client1.on('connect', function(data){
			client1.emit('create user', user1.name);
			client1.emit('join room', user1.room);
			client1.emit('change name', 'John');
			client1.emit('leave room', user1.room);
			client1.on('user list', function(users) {
				users.should.not.have.property('John');
				client1.emit('change name', 'John');
				client1.emit('join room', user1.room);
				client1.on('user list', function(users) {
					users.should.have.property('John');
				});
			});
		});
	});
});