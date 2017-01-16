/**
 * 
 */


"use strict";


var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		tableName : 'securityTLHInSecuritySet',
		columns : {
			securitySetId : 'securityTLHInSecuritySet.securitySetId',
			securityId : 'securityTLHInSecuritySet.securityId',
			tlhSecurityId : 'securityTLHInSecuritySet.tlhSecurityId',
			priority : 'securityTLHInSecuritySet.priority',
			isDeleted : 'securityTLHInSecuritySet.isDeleted',
			createdBy : 'securityTLHInSecuritySet.createdBy',
			createdDate : 'securityTLHInSecuritySet.createdDate',
			editedBy : 'securityTLHInSecuritySet.editedBy',
			editedDate : 'securityTLHInSecuritySet.editedDate'
		}
};

module.exports = Security;