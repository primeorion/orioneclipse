"use strict";

var moduleName = __filename;

var config = require('config');

var logger = require("helper").logger(moduleName);
var ClassDao = require('dao/security/ClassDao');
var SecurityDao = require('dao/security/SecurityDao');

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
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassCoverter.classListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassCoverter.classListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null, responseCode.SUCCESS, models.pop());
		})
	});
	
}

Class.prototype.deleteClass = function(model, cb){
	var self = this;
	
	ClassCoverter.classModelToEntity(model, function(err, classEntity){
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		self.uniquenessCheckAndImportedCheck(model, function(err, status){
			if(err){
				if(status === responseCode.INTERNAL_SERVER_ERROR){
					logger.error(err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}else{
					logger.error("deleteClass() " + err);
					return cb(err, status);
				}
			}
			ClassCoverter.classModelToSecurityEntity(classEntity, function(err, securityEntity){
				SecurityDao.checkSecurityForAssetClass(securityEntity, function(err, status){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					if(status){
						ClassDao.deleteClass(classEntity, function(err, rs){
							if(err){
								logger.error(err);
								return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
							}
							cb(null, responseCode.SUCCESS, {"messages" : messages.classRemoved});
						});
					}else{
						logger.info("deleteClassClass() class is imported so cannot delete");
						cb(messages.associatedClassRemoveFail, responseCode.UNPROCESSABLE);
					}
				});					
			});
		});
	});
};

Class.prototype.updateClass = function getList(model, cb){
	var self = this;
	logger.info(" Class updateClass() ");
	ClassCoverter.classModelToEntity(model, function(err, entityBean){
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			self.uniquenessCheckAndImportedCheck(model, function(err, status){
					if(err){
						if(status === responseCode.INTERNAL_SERVER_ERROR){
							logger.error(err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}else if(status === responseCode.ALREADY_DELETED){
							logger.error("updateClass() " + err);
							return cb(err, responseCode.NOT_FOUND);
						}else{
							logger.error("updateClass() " + err);
							return cb(err, status);
						}
					}
					ClassDao.updateClass(entityBean, function(err, rs){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
						}else{
							self.getClassDetail(model, function(err, status, data){
								if(err){
									logger.error(err);
									return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
								}else{
									cb(null, status, data);
								}
							});
						}
					});						
					
			});
		}
	});
	
}

Class.prototype.createClass = function(model, cb){
	var self = this;

	logger.info("Class createClass()");
	model.isImported = 0;
	ClassCoverter.classModelToEntity(model, function(err, classEntity){
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		self.alreadyExistCheck(model, function(err, status){
			if(err){
					logger.error(err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}
			if(status){
				ClassDao.createClass(classEntity, function(err, rs){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					model.id = rs.id;
					self.getClassDetail(model, function(err, status, data){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
	})
}

Class.prototype.uniquenessCheckAndImportedCheck = function(model, cb){
	ClassCoverter.classModelToEntity(model, function(err, classEntity){
		var id = model.id;
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassDao.uniquenessCheckAndImportedCheck(classEntity, function(err, rs){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
	});
};

Class.prototype.alreadyExistCheck = function(model, cb){
	
	ClassCoverter.classModelToEntity(model, function(err, classEntity){
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
		}
		ClassDao.uniquenessCheckAndImportedCheck(classEntity, function(err, rs){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				ClassCoverter.classListEntityToModel(rs, function(err, rs){
					if(rs && rs.length > 0){
						return cb(null, false);
					}else{
						return cb(null, true);
					}				
				});
			}
		});
	});
};

module.exports = new Class();