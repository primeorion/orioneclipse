"use strict";

module.exports = function(bean, data){
	
	bean.reqId = data.reqId;
	bean.user.userId = data.user.userId;
	bean.user.actualUserId = data.user.actualUserId;
	bean.user.firmId = data.user.firmId;
	bean.user.roleId = data.user.roleId;
	bean.user.roleTypeId = data.user.roleTypeId;
	bean.user.teamIds = data.user.teamIds;
	bean.search = data.search;
	bean.token = data.token;
	
}
