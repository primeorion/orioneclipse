var applicationEnum = {
	privilege : {
		0 : 'Record',
		1 : 'Function'
	},
	roleType:{
		FIRMADMIN: 1,
		TEAMADMIN: 2,
		USER: 3
	},
	ETLUserId : 0,
	relatedType : {
		CLASS : 'CLASS',
		CATEGORY : 'CATEGORY',
		SUBCLASS : 'SUBCLASS'
	},
	/*
	 * normal security search = 2 security search when adding to securityset = 6
	 */securityStatus : {
		ACTIVE : 6, // 2 searchable
		NOT_APPROVED : 1, // non searchable
		EXCLUDED : 2, // 6 searchable but cannot be added to securityset
		INACTIVE : 8, // change status when deleted
	},
	sellPriorities : {
		DO_NOT_SELL : 0,
		HARD_TO_SELL : 1,
		SELL_IF_NO_GAIN : 2,
		CAN_SELL : 3,
		SELL_TO_TARGET : 4,
		PRIORITY_SELL : 5
	},
	buyPriorities : {
		DO_NOT_BUY : 0,
		HARD_TO_BUY : 1,
		CAN_BUY : 2,
		BUY_TO_TARGET : 3,
		PRIORITY_BUY : 4
	},
	securitySetToleranceType : {
		BAND : 1,
		ABSOLUTE : 0
	}
};

var securityStatus = applicationEnum.securityStatus;
var reverseSecurityStatus = {};
applicationEnum.reverseSecurityStatus = reverseSecurityStatus;
for ( var key in securityStatus) {
	if (securityStatus.hasOwnProperty(key)) {
		reverseSecurityStatus[securityStatus[key]] = key;
	}
}

var buyPriorities = applicationEnum.buyPriorities;
var reverseBuyPriorities = {};
applicationEnum.reverseBuyPriorities = reverseBuyPriorities;

for ( var key in buyPriorities) {
	if (buyPriorities.hasOwnProperty(key)) {
		reverseBuyPriorities[buyPriorities[key]] = key;
	}
}

var sellPriorities = applicationEnum.sellPriorities;
var reverseSellPriorities = {};
applicationEnum.reverseSellPriorities = reverseSellPriorities;

for ( var key in sellPriorities) {
	if (sellPriorities.hasOwnProperty(key)) {
		reverseSellPriorities[sellPriorities[key]] = key;
	}
}

var securitySetToleranceType = applicationEnum.securitySetToleranceType;
var reverseSecuritySetToleranceType = {};
applicationEnum.reverseSecuritySetToleranceType = reverseSecuritySetToleranceType;

for ( var key in securitySetToleranceType) {
	if (securitySetToleranceType.hasOwnProperty(key)) {
		reverseSecuritySetToleranceType[securitySetToleranceType[key]] = key;
	}
}

module.exports = applicationEnum;