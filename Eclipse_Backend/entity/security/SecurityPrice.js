/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var SecurityPrice = {
		tableName : 'securityPrice',
		columns : {
			id : 'securityPrice.id',
			securityId : 'securityPrice.securityId',
			price : 'securityPrice.price',
			priceType : 'securityPrice.priceType',
			priceDateTime : 'securityPrice.priceDateTime',
			isDeleted : 'securityPrice.isDeleted',
			createdBy : 'securityPrice.createdBy',
			createdDate : 'securityPrice.createdDate',
			editedBy : 'securityPrice.editedBy',
			editedDate : 'securityPrice.editedDate'
		}
}

module.exports = SecurityPrice;
