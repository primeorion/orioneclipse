"use strict";

var memory = require('./MemoryCache.js');

module.exports = {
		get : function(key){
			return memory.get(key);
		},
		put : function(key, value){
			return memory.put(key, value);
		},
		keys : function(){
			return memory.keys();
		},
		del : function(key){
			return memory.del(key);
		},
		memsize: function(){
			return memory.memsize();
		},
		size: function(){
			return memory.size();
		}
};