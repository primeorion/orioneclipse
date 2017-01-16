/**
 * NotificationController accepts the connections from clients
 */

"use strict";
//var sockets = require("socket.io");

module.exports = function(io) {
	io.on('connection', function(socket) {
		// Connection established;
	});
};