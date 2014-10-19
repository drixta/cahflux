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
			client1.on('lobby user list', function(users){
				users.should.include(user1.name);
			});	
			client1.emit('join room', user1.room);
			client1.on('room user list', function(users){
				users.should.include(user1.name);
				client1.disconnect();
				done();
			});
		});
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
				client2.on('room user list', function(users){
					users.should.include(user2.name);
					client1.disconnect();
					client2.disconnect();
					done();
				});
			});
		});
	});
	it('Should be able to leave the room and reenter a new room', function(done){
		var client1 = io.connect(SOCKET_URL, options);
		client1.on('connect', function(data){
			client1.emit('create user', user1.name);
			client1.emit('join room', user1.room);

			client1.on('room user list', function(users){

				users.should.include(user1.name);
				client1.emit('leave room', user1.room);

				client1.on('lobby user list', function(users){

					users.should.include(user1.name);
					client1.emit('join room', user1.room);

					client1.on('room user list', function(users){
						users.should.include(user1.name);
						client1.disconnect();
						done();
					});
				});
			});
		});
	});
	it('Should be able to get room information when enter a new room');
});

describe("Game play phase",function(){
	it('Should be waiting if there\'s not enough people in the room');
	it('Should not be able to select a card when there\'s not enough people in the room');
	it('Should have a B person selected when there are enough people in the room');
	it('Should let W players play a card when in the W playable status');
	it('Should have "play W card status" when B card is shown');
	it('Should end W playable status after 30 seconds when not all players chose their card');
	it('Should end W playable status when all players played a card');
	it('By 30 seconds W players who didn\'t play a card will have a random card selected');
	it('Should require everyone in the room to play W before status complete');
	it('Should be able to complete when people leave in the middle of the play');
});