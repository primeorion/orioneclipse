/**
 * 
 */

"use strict";

module.exports = {
		getUniqueElementsFromList : function(securityIds){
			var securityIdsMap = {};
			if(securityIds && securityIds.length > 0){
				securityIds.forEach(function(value){
					securityIdsMap[value] = 1;
				});
			}
			var securityids = [];
			for(var i in securityIdsMap){
				if(securityIdsMap.hasOwnProperty(i)){				
					securityids.push(i);
				}
			}
			return securityids;
		}
}