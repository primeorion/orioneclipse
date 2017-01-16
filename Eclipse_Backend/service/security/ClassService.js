"use strict";

var moduleName = __filename;

var config = require('config');

var logger = require("helper").logger(moduleName);

var SecurityDao = require('dao/security/SecurityDao');
var ClassDao = require('dao/security/ClassDao');

var ClassCoverter = require('converter/security/ClassConverter.js');

var responseCode = config.responseCode;
var messages = config.messages;

var Class = function(){
	
}

Class.prototype.getList = function getList(model, cb){
	logger.info("Class getList()");
	
	ClassDao.getClassList(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassCoverter.classListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null, responseCode.SUCCESS, models);
		})
	});
	
}


Class.prototype.getClassDetail = function getSubClassDetail(model, cb){
	logger.info(" Class getList()");
	
	ClassDao.getClassDetail(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassCoverter.classListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null, responseCode.SUCCESS, models.pop());
		})
	});
	
}

Class.prototype.deleteClass = function(model, cb){
	var self = this;
	
	self.uniquenessCheckAndImportedCheck(model, function(err, status){
		if(err){
			if(status === responseCode.INTERNAL_SERVER_ERROR){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				logger.error("deleteClass() " + err);
				return cb(err, status);
			}
		}
		SecurityDao.checkSecurityForAssetClass(model, function(err, status){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			if(status){
				ClassDao.deleteClass(model, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}
					cb(null, responseCode.SUCCESS, {"messages" : messages.classRemoved});
				});
			}else{
				logger.info("deleteClassClass() class is imported so cannot delete");
				cb(messages.associatedClassRemoveFail, responseCode.UNPROCESSABLE);
			}		
		}, 2);
	});
};

Class.prototype.updateClass = function getList(model, cb){
	var self = this;
	logger.info(" Class updateClass() ");

	self.uniquenessCheckAndImportedCheck(model, function(err, status){
			if(err){
				if(status === responseCode.INTERNAL_SERVER_ERROR){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}else if(status === responseCode.ALREADY_DELETED){
					logger.error("updateClass() " + err);
					return cb(err, responseCode.NOT_FOUND);
				}else{
					logger.error("updateClass() " + err);
					return cb(err, status);
				}
			}
			ClassDao.updateClass(model, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}else{
					self.getClassDetail(model, function(err, status, data){
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

Class.prototype.createClass = function(model, cb){
	var self = this;

	logger.info("Class createClass()");
	model.isImported = 0;

	self.alreadyExistCheck(model, function(err, status){
		if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(status){
			ClassDao.createClass(model, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}
				model.id = rs.id;
				self.getClassDetail(model, function(err, status, data){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}else{
						cb(null, responseCode.CREATED, data);
					}
				});
			});				
		}else{
			logger.info("createClass() class name already exist");
			cb(messages.classNameExists, responseCode.UNPROCESSABLE)
		}
	});
}

Class.prototype.uniquenessCheckAndImportedCheck = function(model, cb){
	var id = model.id;
	ClassDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			ClassCoverter.classListEntityToModel(rs, function(err, rs){
				if(rs && (rs.length === 0 || (rs.length === 1 && rs[0].id != id ))){
					return cb(messages.nonExistingClassRemoveFail, responseCode.ALREADY_DELETED);
				}else if(rs && rs.length === 1 && rs[0].isImported === 0){
					return cb(null, responseCode.SUCCESS);
				}else if(rs && rs.length === 1 && rs[0].isImported !== 0){
					return cb(messages.importedClassUpdateFail, responseCode.IMPORTED);
				}else if(rs && rs.length > 1){
					if((rs[0].id != id && rs[1].id == id && rs[1].isImported !== 0)
							|| rs[0].id == id && rs[0].isImported !== 0){
						return cb(messages.importedClassUpdateFail, responseCode.IMPORTED);
					}
					return cb(messages.classNameExists, responseCode.DUPLICATE_ENTRY);
				}
			});
		}
	});
};

Class.prototype.alreadyExistCheck = function(model, cb){
	
	ClassDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			ClassCoverter.classListEntityToModel(rs, function(err, rs){
				if(rs && rs.length > 0){
					return cb(null, false, rs[0]);
				}else{
					return cb(null, true);
				}				
			});
		}
	});
};

Class.prototype.classesExistence = function(model, cb){
	
	ClassDao.classesExistence(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			cb(null, responseCode.SUCCESS, rs);
		}
	});
};

module.exports = new Class();