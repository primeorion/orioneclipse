"use strict";

var moduleName = __filename;

var config = require('config');

var logger = require("helper").logger(moduleName);

var SecurityDao = require('dao/security/SecurityDao');
var SubClassDao = require('dao/security/SubClassDao');
var SubClassCoverter = require('converter/security/SubClassConverter.js');

var responseCode = config.responseCode;
var messages = config.messages;

var SubClass = function(){
	
}

SubClass.prototype.getList = function getList(model, cb){
	logger.info("SubClass getList()");
	
	SubClassDao.getSubClassList(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		SubClassCoverter.subClassListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null,responseCode.SUCCESS, models);
		})
	});
	
}

SubClass.prototype.getSubClassDetail = function getSubClassDetail(model, cb){
	logger.info("SubClass getList()");
	SubClassDao.getSubClassDetail(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		SubClassCoverter.subClassListEntityToModel(rs, function(err, models){
			cb(null,responseCode.SUCCESS, models.pop());
		});
	});
	
}

SubClass.prototype.deleteSubClass = function(model, cb){
	
	var self = this;
	
	self.uniquenessCheckAndImportedCheck(model, function(err, status){
		if(err){
			if(status === responseCode.INTERNAL_SERVER_ERROR){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				logger.error("deleteSubClass() " + err);
				return cb(err, status);
			}
		}

		SecurityDao.checkSecurityForAssetClass(model, function(err, status){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			if(status){
				SubClassDao.deleteSubClass(model, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}
					cb(null, responseCode.SUCCESS, {"messages" : messages.subClassRemoved});
				});
			}else{
				logger.info("deleteSubClass() Sub Class is imported so cannot delete");
				cb(messages.associatedSubClassRemoveFail, responseCode.UNPROCESSABLE);
			}
		}, 3);					
	});
};

SubClass.prototype.updateSubClass = function getList(model, cb){
	var self = this;
	logger.info("SubClass updateSubClass()");

	self.uniquenessCheckAndImportedCheck(model, function(err, status){
		if(err){
			if(status === responseCode.INTERNAL_SERVER_ERROR){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else if(status === responseCode.ALREADY_DELETED){
				logger.error("updateSubClass() " + err);
				return cb(err, responseCode.NOT_FOUND);
			}else{
				logger.error("updateSubClass() " + err);
				return cb(err, status);
			}
		}
		SubClassDao.updateSubClass(model, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				self.getSubClassDetail(model, function(err, status, data){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}else{
						cb(null, status, data);
					}
				});
			}
		});						
	});
	
}

SubClass.prototype.createSubClass = function(model, cb){
	var self = this;

	logger.info("SubClass createSubClass()");
	
	model.isImported = 0;

	self.alreadyExistCheck(model, function(err, status){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(status){
			SubClassDao.createSubClass(model, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}
				model.id = rs.id;
				self.getSubClassDetail(model, function(err, status, data){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}else{
						cb(null, responseCode.CREATED, data);
					}
				});
			});				
		}else{
			logger.info("createSubClass() subClass name already exist");
			cb(messages.subClassNameExists, responseCode.UNPROCESSABLE)
		}
	});
}

SubClass.prototype.uniquenessCheckAndImportedCheck = function(model, cb){
	
	var id = model.id;
	SubClassDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			SubClassCoverter.subClassListEntityToModel(rs, function(err, rs){
				if(rs && (rs.length === 0 || (rs.length === 1 && rs[0].id != id ))){
					return cb(messages.nonExistingSubClassRemoveFail, responseCode.ALREADY_DELETED);
				}else if(rs && rs.length === 1 && rs[0].isImported === 0){
					return cb(null, responseCode.SUCCESS);
				}else if(rs && rs.length === 1 && rs[0].isImported !== 0){
					return cb(messages.importedSubClassUpdateFail, responseCode.IMPORTED);
				}else if(rs && rs.length > 1){
					if((rs[0].id != id && rs[1].id == id && rs[1].isImported !== 0)
							|| rs[0].id == id && rs[0].isImported !== 0){
						return cb(messages.importedSubClassUpdateFail, responseCode.IMPORTED);
					}
					return cb(messages.subClassNameExists, responseCode.DUPLICATE_ENTRY);
				}
			});
		}
	});
};

SubClass.prototype.alreadyExistCheck = function(model, cb){
	
	SubClassDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			SubClassCoverter.subClassListEntityToModel(rs, function(err, rs){
				if(rs && rs.length > 0){
					return cb(null, false, rs[0]);
				}else{
					return cb(null, true);
				}				
			});
		}
	});
};

SubClass.prototype.subclassesExistence = function(model, cb){
	
	SubClassDao.subclassesExistence(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			cb(null, responseCode.SUCCESS, rs);
		}
	});
};

module.exports = new SubClass();