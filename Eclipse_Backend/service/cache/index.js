/**
 * New node file
 */
"use strict";

var local = require('./localcache');
var shared = require('./sharedcache');

module.exports = {
		local : local,
		shared: shared
};