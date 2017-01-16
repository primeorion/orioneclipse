/**
 * O.js file
 * 
 * Reason For name "0" because "0" made sure to load this file at the startup of mocha before running any test cases
 * as it configures mocha with certain settings
 */

var pathArr = __dirname.split("\\");
var pathArrLength = pathArr.length;
var newPathArr = [];

for(var i = 0 ; i < pathArrLength - 1 ; i++){
	newPathArr.push(pathArr[i]);	
}
newPathArr = newPathArr.join("\\");

require('app-module-path').addPath(newPathArr);
//require('service/dbpool/DBPoolInitService');
