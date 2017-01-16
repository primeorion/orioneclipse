"use strict";

module.exports = function(io){
    require('controller/socket/NotificationController.js')(io);
};