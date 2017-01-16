"use strict";

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();

var _ = require('lodash');


var Class = {

};

module.exports = function(){
	_.assign(this, Class, baseModel);
}