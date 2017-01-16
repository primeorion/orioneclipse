"use strict";
var moduleName = __filename;

var helper = require('helper');
var utilDao = require('dao/util/UtilDao.js');
var lodash = require("lodash");
var logger = helper.logger(moduleName);

var UtilService = function() {};


UtilService.prototype.getNextSeqId = function (data, cb) {
    utilDao.getNextSeqId(data, function (err, fetched) {
        if (err) {
            return cb(err);
        }
        return cb(null, fetched);
    });
};

UtilService.prototype.getRoleTypeId = function (user) {
    logger.debug("get roleTypeId for User");
    return user.roleTypeId;
}

UtilService.prototype.getPrimaryTeamForUser = function (user) {
    logger.debug("get Primary time for User");
    console.log("user");
    console.log(user);
    if(user.primaryTeam){    	
    	return user.primaryTeam.name;
    }else{
    	return null;
    }
}

UtilService.prototype.getFirstTeamForUser = function (user) {
    logger.debug("get First team for User");
    logger.debug(user);
    console.log(user);
    if(user.teamNames){        	
       return user.teamNames.pop();
   }else{
       return null;
   }
}

UtilService.prototype.isNegativePercent = function (percent) {
    var value = parseInt(percent);
    var status = true;
    if(value >= 0){
    	status = false;
    }
    return status;
}

UtilService.prototype.storeNextSeqId = function (data, cb) {
    utilDao.storeNextSeqId(data, function (err, added) {
        if (err) {
            return cb(err);
        }
        return cb(null, added);
    });
};

UtilService.prototype.getAndStoreNextSeqId = function (data, cb) {
    var thisService = this;
    thisService.getNextSeqId(data, function (err, sequence) {
        if (err) {
            return cb(err);
        }
        if (sequence && sequence.length > 0) {
            data.seqId = Number(sequence[0].seqId) + 1;
            data.prevSeqId = sequence[0].seqId;
            utilDao.updateNextSeqId(data, function (err, stored) {
                if (err) {
                    return cb(err);
                }
                return cb(null, data.seqId);
            });
        } else {
            data.seqId = 1;
            thisService.storeNextSeqId(data, function (err, stored) {
                if (err) {
                    return cb(err);
                }
                return cb(null, data.seqId);
            });
        }

    });
};

UtilService.prototype.isJson = function (str) {
    //var str  = JSON.stringify(data);
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

UtilService.prototype.getAllTeamsForUser = function (user) {
    logger.debug("get All Teams for User");
    logger.debug(user);
    if(user.teamIds){        	
    	return user.teamIds;
    }else{
    	return [];
    }
}

UtilService.prototype.getAuditUserId = function (user) {
    logger.debug("get Audit User"+JSON.stringify(user));
    return user.actualUserId||user.userId;
}

UtilService.prototype.compareDate = function(date){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    var d1 = Date.parse(date);
    var d2 = Date.parse(today);
    if (d1 < d2) {
     return -1;
 }else if(d1 > d2){
     return 1;
 }else{
    return 0;
}
}

UtilService.prototype.getObjectByPropertyValueFromArray = function(arr, property, value) {
  var result = [];
  arr.forEach(function(o){if (o[property] == value) result.push(o);} );
  return result? result[0] : null; // or undefined
}

UtilService.prototype.getObjectByLowestPropertyValueFromArray = function(arr, property) {
    var result = [];
    var lowestValue = arr[0].property;
    var temp = arr[0];
    arr.forEach(function(o){
        if (o[property] < lowestValue){
            lowestValue = o[property];
            temp = o;
        }
    });
    return temp? temp : null; // or undefined
}

UtilService.prototype.getObjectArrayByPropertyValueFromArray = function(arr, property, value) {
  var result = [];
  arr.forEach(function(o){if (o[property] == value) result.push(o);} );
  return result? result : null; // or undefined
}

UtilService.prototype.dayDiffrenceInTwoDates = function(date1, date2){
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return (Math.ceil(timeDiff / (1000 * 3600 * 24))); 
}

UtilService.prototype.mySqlToJavascriptDate = function(dateTime){
    return new Date(dateTime);
}

UtilService.prototype.roundOfValue = function(value, roundFactor){
    if(roundFactor){
        if(typeof roundFactor === undefined ){
            roundFactor = 1;
        }else{
            roundFactor = Number(roundFactor);
            if(roundFactor === 0){
                roundFactor = 1;
            }
        }
    }else{
        roundFactor = 1;
    }
    var decidingValue = (value)%(roundFactor);
    var roundValueMid = (roundFactor)/2;
    if((decidingValue) <= (roundValueMid)){
        return ((value)-(decidingValue));
    }else{
        var fullValue = ((value)/(roundFactor))*(roundFactor);
        return (fullValue)+(roundFactor);
    }
}
UtilService.prototype.joinArrayValues = function(array1, array2){
    return lodash.concat(array1, array2);
}
module.exports = UtilService;


