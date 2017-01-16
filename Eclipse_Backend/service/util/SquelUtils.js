var mysql      = require('mysql');
var SquelUtils = function () { }
var re = new RegExp("^(select)", "i");

SquelUtils.prototype.joinEql = function (val1,val2) {
	return val1+" = "+val2;
};

SquelUtils.prototype.joinLtEql = function (val1,val2) {
	return val1 +" <= "+val2;
};

SquelUtils.prototype.joinGtEql = function (val1,val2) {
	return val1 +" >= "+val2;
};

SquelUtils.prototype.eql = function (val1,val2) {
	if(typeof val2 === 'undefined'){
		val2 = null;
	}
	if(re.test(val2)){
		return val1+" = "+val2;
	}
	return val1+" = "+mysql.escape(val2);
};

SquelUtils.prototype.notEql = function (val1,val2) {
	if(typeof val2 === 'undefined'){
		val2 = " IS NOT NULL ";
	}
	if(re.test(val2)){
		return val1+" != "+val2;
	}
	return val1+" != "+mysql.escape(val2);
};

SquelUtils.prototype.ltEql = function (val1,val2) {
	return val1 +" <= "+mysql.escape(val2);
};

SquelUtils.prototype.gtEql = function (val1,val2) {
	return val1 +" >= "+mysql.escape(val2);
};

SquelUtils.prototype.lt = function (val1,val2) {
	return val1 +" < "+mysql.escape(val2);
};

SquelUtils.prototype.gt = function (val1,val2) {
	return val1+" > "+ mysql.escape(val2);
};

SquelUtils.prototype.in = function (val1,val2) {

	if(re.test(val2)){
		return val1+" IN ("+val2+")";
	}
	return val1+" IN ("+mysql.escape(val2)+")";

};
SquelUtils.prototype.notIn = function (val1,val2) {
	if(re.test(val2)){
		return val1+" NOT IN ("+val2+")";
	}
	return val1+" NOT IN ("+mysql.escape(val2)+")";
};

SquelUtils.prototype.concat = function (val1,val2,seprator) {
	if(!seprator){
		seprator = "' '";
	}
	return "CONCAT_WS("+seprator+","+val1+","+val2+")";

};

SquelUtils.prototype.like = function (val1,val2) {
	return val1 +" LIKE " + mysql.escape("%" + val2 + "%");
};


SquelUtils.prototype.lower = function (val1) {
	return "LOWER(" + val1 + ")";
};

SquelUtils.prototype.isNUll = function (val1) {
	return val1 + " IS NULL ";
};

module.exports = new SquelUtils();
