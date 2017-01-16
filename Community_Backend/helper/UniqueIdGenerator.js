"use strict";

var shortid = require('shortid');

module.exports = {
	get : function(){
		return shortid.generate();
	}
};