const redis = require('redis');

var CahRedis = function(){
	var self = this;
	self.client = redis.createClient();
};

CahRedis.prototype.init = function() {
};

module.exports = CahRedis;