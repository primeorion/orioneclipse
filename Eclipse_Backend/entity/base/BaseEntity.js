"use strict";

module.exports = function () {
    this.id = null;
    this.name = null;
    this.isDeleted = null;
    this.createdDate = null;
    this.createdBy = null;
    this.editedDate = null;
    this.editedBy = null;
    this.search = null;
    this.isPermissioned = null;
    this.user = {
        userId: null,
        firmId: null,
        actualUserId: null,
        roleTypeId:null,
        teamIds:null
    };
    this.reqId = null;
}; 
