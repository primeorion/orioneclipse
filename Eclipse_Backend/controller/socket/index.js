"use strict";

module.exports = function(io){
    require('controller/socket/SocketController.js')(io);
};