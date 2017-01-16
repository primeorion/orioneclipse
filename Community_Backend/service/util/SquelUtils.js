var SquelUtils = function () { }

SquelUtils.prototype.joinEql = function (val1,val2) {

	return val1+" = "+val2;
};

SquelUtils.prototype.eql = function (val1,val2) {
	if(typeof val2 === 'undefined'){
		val2 = null;
	}else if(typeof val2 === 'string'){
		return val1+" = '"+val2+"'";
	}
		return val1+" = "+val2;

};

SquelUtils.prototype.ltEql = function (val1,val2) {

	return val1+" <= "+val2;
};

SquelUtils.prototype.gtEql = function (val1,val2) {

	return val1+" >= "+val2;
};

SquelUtils.prototype.lt = function (val1,val2) {

	return val1+" < "+val2;
};

SquelUtils.prototype.gt = function (val1,val2) {

	return val1+" > "+val2;
};

SquelUtils.prototype.in = function (val1,val2) {

	return val1+" IN ("+val2+")";
};
SquelUtils.prototype.notIn = function (val1,val2) {

	return val1+" NOT IN ("+val2+")";
};

SquelUtils.prototype.concat = function (val1,val2,seprator) {
	if(!seprator){
		seprator = "' '";
	}
	return "CONCAT_WS("+seprator+","+val1+","+val2+")";
};

SquelUtils.prototype.like = function (val1,val2) {

	return val1 +" LIKE '%" + val2 + "%'";
};
module.exports = new SquelUtils();
