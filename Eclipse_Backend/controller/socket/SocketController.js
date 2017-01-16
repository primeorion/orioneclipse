/**
 * NotificationController accepts the connections from clients
 */

"use strict";
var events = require('events');
var eventEmitter = new events.EventEmitter();
var redisConf = require('config').env.prop.orion.redis;
var redis = require("redis");
var pub = redis.createClient(redisConf);
var sub = redis.createClient(redisConf);



module.exports = function(io) {
	io.on('connection', function(socket) {
		var topics = socket.topicsToJoin;
		topics.forEach(function(topic){
			socket.join(topic);
		});
		sub.on("message", function (channel, data) {
			var finalData = JSON.parse(data);
			var emitData  = JSON.stringify(finalData.emitData);
		    //socket.emit(channel, data);  
		    socket.in(finalData.firmId).emit(channel, emitData);     

		});
		eventEmitter.on('realTimeNotification', function (data) {
			pub.publish(data.code,JSON.stringify(data));
		});
		socket.on('subscribeTopic',function(data){
			sub.subscribe(data.topic);
		});
		socket.on('unSubscribeTopic',function(data){
			socket.leave(socket.firmId);
			sub.unsubscribe(data.topic);

		});
		socket.on('disconnect', function(){
			socket.leave(socket.firmId);
		 });
		eventEmitter.on('realTimeActivityNotification', function (data) {
			var users = data.userIds;
			var firmId = data.user.firmId;
			users.forEach(function(userId){
				var userIdentifier = firmId+"_"+userId;
				console.log("userIdentifier is"+userIdentifier);
				pub.publish(userIdentifier,JSON.stringify(data));
			});
		});
		/*setInterval(function(){
			 var emitData = {
	            body: "Trade genration completed successfully",
	            timestamp:new Date()
	        };
	        var data = {
	        	emitData:emitData,
	        	firmId:11
	        }
			pub.publish("TRADEGEN", JSON.stringify(data));
		}, 5000);
		setInterval(function(){
			 var data = {  
			   "typeId":1,
			   "code":"MODASSIGNAPP",
			   "userNotification":{  
			      "id":6,
			      "subject":"model assignment",
			      "body":"Model assignment approved",
			      "readStatus":0,
			      "notificationCategory":{  
			         "id":2,
			         "name":"Approval"
			      },
			      "notificationCategoryType":{  
			         "id":3,
			         "name":"Model Assignment Approval",
			         "code":"MODASSIGNAPP",
			         "iconUrl":null
			      },
			      "isDeleted":0,
			      "createdOn":new Date(),
			      "createdBy":"prime@tgi.com",
			      "editedOn":new Date(),
			      "editedBy":"prime@tgi.com"
			   },
			   "progressNotification":null,
        		"menuNotification":null
			};
			socket.emit("MODASSIGNAPP",JSON.stringify(data));
		}, 7000);
		var count = 0;
		var total = 100;
		var percent = 0;
		var status = "IN_PROGRESS";
		setInterval(function(){
			 var data = {  
			   "typeId":2,
			   "code":"TRADEGEN",
			   "userNotification":null,
			   "progressNotification":{  
			      "message":"Rebalancer is running…..."+percent+"%",
			      "status":status,
			      "progress":count
			   },
			   "menuNotification":null
			};
			socket.emit("TRADEGEN",JSON.stringify(data));
			if(count<=90){
				count = count+10;
			}else{
				count = 0;
			}
			percent = (count*100)/total;
			if(count === 100){
				status = "COMPLETED";
			}else{
				status = "IN_PROGRESS";
			}
		}, 6000);*/
	});
};

module.exports.eventEmitter = eventEmitter;