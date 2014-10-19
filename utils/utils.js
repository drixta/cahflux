module.exports = {
    findClientsSocket: function(io, roomId) {
        var res = [], 
            room = io.sockets.adapter.rooms[roomId];
        if (room) {
            for (var id in room) {
            res.push(io.sockets.adapter.nsp.connected[id]);
            }
        }
        return res;
    },
    convertObjectNameToArray: function(obj) {
        var result = [];
        console.log(obj);
        for (var key in obj) {
            result.push(obj[key]);
        }
        return result;
    }
};