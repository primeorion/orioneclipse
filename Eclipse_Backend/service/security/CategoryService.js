"use strict";

var moduleName = __filename;

var config = require('config');

var logger = require("helper").logger(moduleName);
var CategoryDao = require('dao/security/CategoryDao');
var CategoryCoverter = require('converter/security/CategoryConverter.js');
var SecurityDao = require('dao/security/SecurityDao');

var responseCode = config.responseCode;
var messages = config.messages;

var Category = function(){
	
}

Category.prototype.getList = function getList(model, cb){
	logger.info("Category getList()");
	
	CategoryDao.getCategories(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		CategoryCoverter.categoryListEntityToModel(rs, function(err, models){
			if(err){			
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null, responseCode.SUCCESS, models);
		})
	});
}

Category.prototype.getCategoryDetail = function getCategoryDetail(model, cb){
	logger.info("Category getCategoryDetail()");
	
	CategoryDao.getCategoryDetail(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		CategoryCoverter.categoryListEntityToModel(rs, function(err, models){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			cb(null, responseCode.SUCCESS, models.pop());
		});
	});
}

Category.prototype.updateCategoryClass = function getList(model, cb){
	var self = this;
	logger.info("Category updateCategoryClass()");
	
	self.uniquenessCheckAndImportedCheck(model, function(err, status){
		if(err){
			if(status === responseCode.INTERNAL_SERVER_ERROR){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else if(status === responseCode.ALREADY_DELETED){
				logger.error("updateCategoryClass() " + err);
				return cb(err, responseCode.NOT_FOUND);
			}else{
				logger.error("updateCategoryClass() " + err);
				return cb(err, status);
			}
		}
		CategoryDao.updateCategory(model, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				self.getCategoryDetail(model, function(err, status, data){
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

Category.prototype.deleteCategoryClass = function(model, cb){
	
	var self = this;

	self.uniquenessCheckAndImportedCheck(model, function(err, status){
		if(err){
			if(status === responseCode.INTERNAL_SERVER_ERROR){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}else{
				logger.error("deleteCategoryClass() " + err);
				return cb(err, status);
			}
		}
		
		SecurityDao.checkSecurityForAssetClass(model, function(err, status){
			if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			if(status){
				CategoryDao.deleteCategory(model, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}
					cb(null, responseCode.SUCCESS, {"messages" : messages.categoryRemoved});
				});
			}else{
				logger.info("deleteCategoryClass() category is imported so cannot delete");
				cb(messages.associatedCategoryRemoveFail, responseCode.UNPROCESSABLE);
			}
		}, 1);					
	});
	
};

Category.prototype.createCategoryClass = function(model, cb){
	var self = this;

//	model.isImported = 0;
	self.alreadyExistCheck(model, function(err, status){
		if(err){
				logger.error(err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(status){
			CategoryDao.createCategory(model, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}
				model.id = rs.id;
				self.getCategoryDetail(model, function(err, status, data){
					if(err){
						logger.error(err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}else{
						cb(null, responseCode.CREATED, data);
					}
				});
			});								
		}else{
			logger.error("createCategoryClass() " + err);
			return cb(messages.categoryNameExists, responseCode.UNPROCESSABLE);
		}
	});
	
}

Category.prototype.uniquenessCheckAndImportedCheck = function(model, cb){

	var id = model.id;
	CategoryDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			CategoryCoverter.categoryListEntityToModel(rs, function(err, rs){
				if(rs && (rs.length === 0 || (rs.length === 1 && rs[0].id != id ))){
					return cb(messages.nonExistingCategoryRemoveFail, responseCode.ALREADY_DELETED);
				}else if(rs && rs.length === 1 && rs[0].isImported === 0){
					return cb(null, responseCode.SUCCESS);
				}else if(rs && rs.length === 1 && rs[0].isImported !== 0){
					return cb(messages.importedCategoryUpdateFail, responseCode.IMPORTED);
				}else if(rs && rs.length > 1){
					if((rs[0].id != id && rs[1].id == id && rs[1].isImported !== 0)
							|| rs[0].id == id && rs[0].isImported !== 0){
						return cb(messages.importedCategoryUpdateFail, responseCode.IMPORTED);
					}
					return cb(messages.categoryNameExists, responseCode.DUPLICATE_ENTRY);
				}
			});
		}
	});
};

Category.prototype.alreadyExistCheck = function(model, cb){
	
	CategoryDao.uniquenessCheckAndImportedCheck(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			CategoryCoverter.categoryListEntityToModel(rs, function(err, rs){
				if(rs && rs.length > 0){
					return cb(null, false, rs[0]);
				}else{
					return cb(null, true);
				}				
			});
		}
	});
};

Category.prototype.categoriesExistence = function(model, cb){
	
	CategoryDao.categoriesExistence(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}else{
			cb(null, responseCode.SUCCESS, rs);
		}
	});
};


module.exports = new Category();