"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var lodash = require("lodash");

var TeamDao = require('dao/admin/TeamDao.js');
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var AdvisorDao = require('dao/admin/AdvisorDao.js');
var UserDao = require('dao/admin/UserDao.js');
var TeamConverter = require("converter/team/TeamConverter.js");

var messages = config.messages;
var responseCodes = config.responseCodes;
var logger = helper.logger(moduleName);

var teamDao = new TeamDao();
var portfolioDao = new PortfolioDao();
var modelDao = new ModelDao();
var advisorDao = new AdvisorDao();
var userDao = new UserDao();
var teamConverter = new TeamConverter();

var TeamService = function () { };

TeamService.prototype.addTeam = function (data, cb) {
    logger.info("Create team service called  (addTeam())");
    var self = this;
    if (data.name) {
        teamDao.get(data, function (err, fetched) {
            if (err) {
                logger.error("Getting team (addTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if (fetched && fetched.length > 0) {
                logger.error("Team already exist with name(addTeam())" + data.name);
                return cb(messages.teamAlreadyExist, responseCodes.UNPROCESSABLE);
            } else {
                teamDao.add(data, function (err, added) {
                    if (err) {
                        logger.error("Adding team (addTeam())" + err);
                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    data.id = added.insertId;
                    logger.info("Team created successfully  (addTeam())");
                    self.getTeamDetail(data, function (err, code, fetched) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, responseCodes.CREATED, fetched);
                    });
                });
            }
        });
    } else {
        logger.info("Missing Required Parameters for add Team  (addTeam())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }
};
TeamService.prototype.updateTeam = function (data, cb) {
    logger.info("Update team service called (updateTeam())");
    var self = this;
    if (data.name) {
        teamDao.get(data, function (err, fetched) {
            if (err) {
                logger.error("Getting team (addTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            logger.debug("fetched team is"+JSON.stringify(fetched));
            if (fetched && fetched.length > 0 && ((fetched[0].id != data.id && fetched[0].name === data.name)
                || fetched[1] && fetched[1].name === data.name)) {
                logger.error("Team already exist with name(addTeam())" + data.name);
            return cb(messages.teamAlreadyExist, responseCodes.UNPROCESSABLE);
        } else {
            teamDao.update(data, function (err, updated) {
                if (err) {
                    logger.error("Updating team (updateTeam())" + JSON.stringify(err));
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Team updated successfully  (updateTeam())");
                self.changeUserStatusBasedOnTeamStatus(data, function(err,code,statusChanged){
                    if (err) {
                        return cb(err, code);
                    }
                    self.getTeamDetail(data, function (err, code, fetched) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, responseCodes.SUCCESS, fetched);
                    });
                });
            });
        }
    });
    } else {
        logger.info("Missing Required Parameters for update Team  (updateTeam())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }
};
TeamService.prototype.getTeamList = function (data, cb) {
    logger.info("Get team list service called (getTeamList())");
    teamDao.getAll(data, function (err, fetched) {
        if (err) {
            logger.error("getting team list (getTeamList())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        teamConverter.getModelToResponse(fetched, function (err,result) {
            logger.info("Team list returned successfully (getTeamList())");
            return cb(null, responseCodes.SUCCESS, result);
        });
    });
};
TeamService.prototype.getTeamDetail = function (data, cb) {
    logger.info("Get team details service called (getTeamDetail())");
    teamDao.getDetail(data, function (err, fetched) {
        if (err) {
            logger.error("getting team detail (getTeamDetail())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            teamConverter.getModelToResponse(fetched, function (err,result) {
                logger.info("Team detail returned successfully (getTeamDetail())");
                return cb(null, responseCodes.SUCCESS, result[0]);
            });
        } else {
            logger.info("Team not Found (getTeamDetail())" + data.id);
            return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
        }
    });
};
TeamService.prototype.deleteTeam = function (data, cb) {
    logger.info("Delete team service called (deleteTeam())");
    var self = this;
    teamDao.delete(data, function (err, deleted) {
        if (err) {
            logger.info("Deleting team (deleteTeam())");
            return cb(messages.teamUserAssociated, responseCodes.UNPROCESSABLE);
        }
        if (deleted.affectedRows > 0) {
            teamDao.getUserToInactive(data,function (err,userToInactive){
                if(err){
                    logger.error("getting users to inactive (deleteTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.debug("Users to inactive are"+JSON.stringify(userToInactive));
                self.removeAdvisorFromTeam(data,function(err,code,result){
                    if (err) {
                        logger.error("removing advisor from teams (deleteTeam())" + err);
                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    teamDao.removePortfolioFromTeam(data, function (err, advisorRemoved) {
                        if (err) {
                            logger.error("removing portfolio from teams (deleteTeam())" + err);
                            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                        }
                        teamDao.removeModelFromTeam(data, function (err, advisorRemoved) {
                            if (err) {
                                logger.error("removing model from teams (deleteTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                            teamDao.removeUserFromTeam(data, function (err, advisorRemoved) {
                                if (err) {
                                    logger.error("removing user from teams (deleteTeam())" + err);
                                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                }
                                if(userToInactive && userToInactive.length > 0){
                                    data.userToInactive = userToInactive;
                                    teamDao.inactiveUsers(data,function(err,inactiveUsers){
                                        if(err){
                                           logger.error("Inactive user from teams (deleteTeam())" + err);
                                           return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                       }
                                       logger.info("Team deleted successfully (deleteTeam())" + data.id);
                                       return cb(null, responseCodes.SUCCESS, { "message": messages.teamDeleted });
                                   });
                                }else{
                                    logger.info("Team deleted successfully (deleteTeam())" + data.id);
                                    return cb(null, responseCodes.SUCCESS, { "message": messages.teamDeleted });
                                }
                            });
                        });
                    });
                });
            })
            
        } else {
            logger.info("Team not Found (deleteTeam())" + data.id);
            return cb(messages.teamNotFoudOrDeleted, responseCodes.NOT_FOUND);
        }
    });
};
TeamService.prototype.assignUserToTeam = function (data, cb) {
    logger.info("Assign user to team service called (assignUserToTeam())");
    var self = this;
    if (data.id && data.userIds) {
        teamDao.get(data, function (err, fetched) {
            if (err) {
                logger.error("Getting team (assignUserToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if(fetched && fetched.length > 0){
                self.validUsers(data,function(isValid,userIds){
                    if(isValid){
                        self.updateUserToTeam(data,function(err,code,result){
                            if(err){
                               logger.error("Assigning user to team (assignUserToTeam())" + err);
                               return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                           }
                           return cb(err,code,result);
                       });
                    }else{
                        logger.info("User not Found (assignUserToTeam())");
                        return cb(messages.userNotFound+" with Ids = "+userIds, responseCodes.NOT_FOUND);
                    }
                });  
            }else{
                logger.info("Team not Found (assignUserToTeam())" + data.id);
                return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
            }
        });
    } else {
        logger.info("Missing Required Parameters (assignUserToTeam())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }
};
TeamService.prototype.assignPortfolioToTeam = function (data, cb) {
    logger.info("Assign portfolio to team service called (assignPortfolioToTeam())");
    var self = this;
    if (data.id && data.portfolioIds) {
       teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (assignPortfolioToTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if(fetched && fetched.length > 0){
            self.validPortfolios(data,function(isValid,portfolioIds){
                if(isValid){
                    data.source = "Team";
                    self.updatePortfolioToTeam(data,function(err,code,result){
                        if(err){
                           logger.error("Assigning portfolio to team (assignPortfolioToTeam())" + err);
                           return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                       }
                       return cb(err,code,result);
                   });
                }else{
                    logger.info("Portfolio not Found (assignPortfolioToTeam())");
                    return cb(messages.portfolioNotFound+" with Ids = "+portfolioIds, responseCodes.NOT_FOUND);
                }
            });  
        }else{
            logger.info("Team not Found (assignPortfolioToTeam())" + data.id);
            return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
        }
    });
   } else {
    logger.info("Missing Required Parameters (assignPortfolioToTeam())");
    return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
}
};
TeamService.prototype.assignAdvisorToTeam = function (data, cb) {
    logger.info("Assign advisor to team service called (assignAdvisorToTeam())");
    var self = this;
    if (data.id && data.advisorIds) {
        var temp = data.advisorIds;
        teamDao.get(data, function (err, fetched) {
            if (err) {
                logger.error("Getting team (assignAdvisorToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if(fetched && fetched.length > 0){
                self.validAdvisors(data,function(isValid,advisorIds){
                    if(isValid){
                        self.updateAdvisorToTeam(data,function(err,code,result){
                            if(err){
                               logger.error("Assigning advisor to team (assignAdvisorToTeam())" + err);
                               return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                           }
                           //get advisor portfolios and add to team
                           data.advisorIds = temp;
                           teamDao.getAdvisorPortfolios(data,function(err,portfolioResult){
                            if(err){
                                if(data.advisorIds && data.advisorIds.length>0 ){
                                    logger.error("Get advisors portfolios(assignAdvisorToTeam())" + err);
                                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                }
                            }
                            if(portfolioResult && portfolioResult.length>0){
                                var portfolioIds = [];
                                portfolioResult.forEach(function(portfolio){
                                    var portfolioId = portfolio.portfolioId;
                                    portfolioIds.push(portfolioId);
                                });
                                logger.debug("New PortfolioIds"+JSON.stringify(portfolioIds));
                                data.portfolioIds = portfolioIds;
                                data.keepOld = 1;
                                data.source = "Advisor";
                                self.updatePortfolioToTeam(data,function(err,updatePortfolioResult){
                                    if(err){
                                        logger.error("Assing portfolio to team(assignAdvisorToTeam())" + err);
                                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                    }
                                    return cb(err,code,result); 
                                });
                            }else{
                                logger .debug("No portfolio found to add (assignAdvisorToTeam())");
                                return cb(null,responseCodes.SUCCESS,result); 
                            }
                        });
                       });
                    }else{
                        logger.info("Advisor not Found (assignAdvisorToTeam())");
                        return cb(messages.advisorNotFound+" with Ids = "+advisorIds, responseCodes.NOT_FOUND);
                    }
                });  
            }else{
                logger.info("Team not Found (assignAdvisorToTeam())" + data.id);
                return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
            }
        });
    } else {
        logger.info("Missing Required Parameters(assignAdvisorToTeam())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }

};
TeamService.prototype.assignModelToTeam = function (data, cb) {
    logger.info("Assign model to team service called (assignModelToTeam())");
    var self = this;
    if (data.id && data.modelIds) {
        teamDao.get(data, function (err, fetched) {
            if (err) {
                logger.error("Getting team (assignModelToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if(fetched && fetched.length > 0){
                self.validModels(data,function(isValid,modelIds){
                    if(isValid){
                        self.updateModelToTeam(data,function(err,code,result){
                            if(err){
                               logger.error("Assigning model to team (assignModelToTeam())" + err);
                               return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                           }
                           return cb(err,code,result);
                       });
                    }else{
                        logger.info("Model not Found (assignModelToTeam())");
                        return cb(messages.modelNotFound+" with Ids = "+modelIds, responseCodes.NOT_FOUND);
                    }
                });  
            }else{
                logger.info("Team not Found (assignModelToTeam())" + data.id);
                return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
            }
        });
    } else {
        logger.info("Missing Required Parameters (assignModelToTeam())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }
};
TeamService.prototype.getUserToTeam = function (data, cb) {
    logger.info("Get users of team service called (getUserToTeam())");
    teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (getUserToTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            teamDao.getUserToTeam(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting user to team (getUserToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Get user to team successfully (getUserToTeam())");
                  teamConverter.getTeamUserModelToResponse(fetched, function (err,result) {
                    return cb(null, responseCodes.SUCCESS, result);
                });
            });
        } else {
            logger.error("Team does not exist (getUserToTeam())");
            return cb(messages.teamNotFound, responseCodes.UNPROCESSABLE);
        }
    });
};
TeamService.prototype.getPortfolioToTeam = function (data, cb) {
    teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (getPortfolioToTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            teamDao.getPortfolioToTeam(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting portfolio to team (getPortfolioToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Get portfolio to team successfully (getPortfolioToTeam())");
                teamConverter.getTeamPortfolioModelToResponse(fetched, function (err,result) {
                    return cb(null, responseCodes.SUCCESS, result);
                });
            });
        } else {
            logger.error("Team does not exist (getPortfolioToTeam())");
            return cb(messages.teamNotFound, responseCodes.UNPROCESSABLE);
        }
    });
};
TeamService.prototype.getAdvisorToTeam = function (data, cb) {
    logger.info("Get advisors of team service called (getAdvisorToTeam())");
    teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (getAdvisorToTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            teamDao.getAdvisorToTeam(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting advisor to team (getAdvisorToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Get advisor to team successfully (getAdvisorToTeam())");
                 teamConverter.getTeamAdvisorModelToResponse(fetched, function (err,result) {
                return cb(null, responseCodes.SUCCESS, result);
            });
            });
        } else {
            logger.error("Team does not exist (getAdvisorToTeam())");
            return cb(messages.teamNotFound, responseCodes.UNPROCESSABLE);
        }
    });
};
TeamService.prototype.getModelToTeam = function (data, cb) {
    logger.info("Get models of team service called (getModelToTeam())");
    teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (getModelToTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            teamDao.getModelToTeam(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting model to team (getModelToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Get model to team successfully (getModelToTeam())");
                teamConverter.getTeamModelModelToResponse(fetched, function (err,result) {
                return cb(null, responseCodes.SUCCESS, result);
            });
            });
        } else {
            logger.error("Team does not exist (getModelToTeam())");
            return cb(messages.teamNotFound, responseCodes.UNPROCESSABLE);
        }
    });
};

TeamService.prototype.associateTeam = function (data, cb) {
    var self = this;
    self.assignUserToTeam(data, function (err, assigned) {
        if (err) {
            if (data.userIds) {
                logger.error("associating user (associateTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
        }
        self.assignPortfolioToTeam(data, function (err, assigned) {
            if (err) {
                if (data.portfolioIds) {
                    logger.error("associating portfolio (associateTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
            }
            self.assignAdvisorToTeam(data, function (err, assigned) {
                if (err) {
                    if (data.advisorIds) {
                        logger.error("associating advisor (associateTeam())" + err);
                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                }
                self.assignModelToTeam(data, function (err, assigned) {
                    if (err) {
                        if (data.modelIds) {
                            logger.error("associating model (associateTeam())" + err);
                            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                        }
                    }
                    logger.info("All associations to team successfully (associateTeam())");
                    return cb(null);
                });
            });
        });

    });

};
TeamService.prototype.searchTeam = function (err, cb) {
    logger.info("Search team service called (searchTeam())");
    teamDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("Getting team (searchTeam())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Team Search Success (searchTeam())");
         teamConverter.getModelToResponse(fetched, function (err,result) {
            return cb(null, responseCodes.SUCCESS, result);
        });
    });
};
TeamService.prototype.updateAdvisorToTeam = function (data, cb) {
    logger.info("Update advisor to team service called (updateAdvisorToTeam())");
    var self = this;
    var advisorsToAssociate = [];
    var counter = 0;
    var advisors = data.advisorIds;
    if (advisors.length > 0) {
        advisors.forEach(function (advisorId) {
            data.advisorId = advisorId;
            teamDao.updateAdvisorTeam(data, function (err, updated) {
                counter++;
                if (err) {
                    logger.error("Updating advisor to team (updateAdvisorToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                if (updated.affectedRows > 0) {

                } else {
                    advisorsToAssociate.push(advisorId);
                }
                if ((data.advisorIds).length === counter) {
                    var temp = data.advisorIds;
                    data.advisorIds = advisorsToAssociate;
                    teamDao.assignAdvisorToTeam(data, function (err, added) {
                        if (err) {
                            if (advisorsToAssociate && advisorsToAssociate.length > 0) {
                                logger.error("assigning advisors to teams (updateAdvisorToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                        }
                        data.advisorIds = temp;
                        self.removeAdvisorFromTeam(data,function(err,code,result){
                            return cb(err,code,result);
                        });
                    });
                }
            });
        });
    } else {
        self.removeAdvisorFromTeam(data,function(err,code,result){
            return cb(err,code,result);
        });
    }
};
TeamService.prototype.removeAdvisorFromTeam = function (data, cb){
    teamDao.getAdvisorToTeam(data,function(err,tempTeamAdvisors){
        if(err){
            return cb(err);
        }
        teamDao.removeAdvisorFromTeam(data, function (err, advisorRemoved) {
            if (err) {
                logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            var portfolioIdsToRemove = [];
            var removeAdvisorIds = [];
            if(tempTeamAdvisors && tempTeamAdvisors.length > 0){
                tempTeamAdvisors.forEach(function(advisor){
                    var advisorId = advisor.id;
                    removeAdvisorIds.push(advisorId);
                });
            }
            removeAdvisorIds = lodash.difference(removeAdvisorIds,data.advisorIds);
            logger.debug("Adivsors ids we added are"+JSON.stringify(data.advisorIds));
            logger.debug("AdvisorIds we got to remove from team are = "+JSON.stringify(removeAdvisorIds));
            var teamAdvisors = data.advisorIds;
            data.advisorIds = removeAdvisorIds;
            if (data.advisorIds && data.advisorIds.length > 0) {
                teamDao.getAdvisorPortfolios(data,function(err,advisorPortfolios){
                    if (err) {
                        logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    logger.debug("data.advisorIds"+JSON.stringify(data.advisorIds)+" result portfolios are "+advisorPortfolios);
                    if(advisorPortfolios && advisorPortfolios.length>0){
                        var portfolioIds = [];
                        advisorPortfolios.forEach(function(portfolio){
                            var portfolioId = portfolio.portfolioId;
                            portfolioIds.push(portfolioId);
                        });
                        logger.debug("Portfolio for removed advisor are "+ JSON.stringify(portfolioIds));
                        /*teamDao.getAdvisorToTeam(data,function(err,teamAdvisors){
                            if(err){
                                logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }*/
                            var portfolioIdsToRemove = [];
                            if(teamAdvisors && teamAdvisors.length > 0){
                                logger.debug("Other team advisors"+ JSON.stringify(teamAdvisors));
                                data.advisorIds = teamAdvisors;
                                teamDao.getAdvisorPortfolios(data,function(err,newAdvisorPortfolios){
                                    if (err) {
                                        logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                    } 
                                    if(newAdvisorPortfolios && newAdvisorPortfolios.length > 0){
                                        var newPortfolioIds = [];
                                        newAdvisorPortfolios.forEach(function(newPortfolio){
                                            var portfolioId = newPortfolio.portfolioId;
                                            newPortfolioIds.push(portfolioId);
                                        });
                                        logger.debug("Other advisors portfolios"+ JSON.stringify(newPortfolioIds));
                                        portfolioIdsToRemove = lodash.difference(portfolioIds, newPortfolioIds);
                                    }
                                    else{
                                        portfolioIdsToRemove = portfolioIds;
                                    }
                                    logger.debug("Portfolios to remove are"+ JSON.stringify(portfolioIdsToRemove));
                                    data.portfolioIds = portfolioIdsToRemove;
                                    teamDao.removeAdvisorPortfolioFromTeam(data,function(err,removePortfolioResult){
                                        if(err){
                                            logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                                            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                        }
                                        logger.info("advisor association updated successfully (removeAdvisorFromTeam())");
                                        return cb(null, responseCodes.SUCCESS, { "message": messages.advisorAssignToTeamUpdate });
                                    });
                                });
                            }
                            else{
                                portfolioIdsToRemove = portfolioIds;
                                logger.debug("Portfolios to remove are"+ JSON.stringify(portfolioIdsToRemove));
                                data.portfolioIds = portfolioIdsToRemove;
                                teamDao.removeAdvisorPortfolioFromTeam(data,function(err,removePortfolioResult){
                                    if(err){
                                        logger.error("removing advisor from teams (removeAdvisorFromTeam())" + err);
                                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                    }
                                    logger.info("advisor association updated successfully (removeAdvisorFromTeam())");
                                    return cb(null, responseCodes.SUCCESS, { "message": messages.advisorAssignToTeamUpdate });
                                });
                            }
                        //});
                    }
                    else{
                        logger.info("advisor association updated successfully (removeAdvisorFromTeam())");
                        return cb(null, responseCodes.SUCCESS, { "message": messages.advisorAssignToTeamUpdate });
                    } 
                });
            }else{
                logger.info("advisor association updated successfully (removeAdvisorFromTeam())");
                        return cb(null, responseCodes.SUCCESS, { "message": messages.advisorAssignToTeamUpdate });
            }
        });
    });
}
TeamService.prototype.updateUserToTeam = function (data, cb) {
    logger.info("Update user to team service called (updateUserToTeam())");
    var usersToAssociate = [];
    var counter = 0;
    if (data.userIds.length > 0) {
        (data.userIds).forEach(function (userId) {
            data.userId = userId;
            teamDao.updateUserTeam(data, function (err, updated) {
                counter++;
                if (err) {
                    logger.error("Updating user to team (updateUserToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                if (updated.affectedRows > 0) {

                } else {
                    usersToAssociate.push(userId);
                }
                if ((data.userIds).length === counter) {
                    var temp = data.userIds;
                    data.userIds = usersToAssociate;
                    teamDao.assignUserToTeam(data, function (err, added) {
                        if (err) {
                            if (usersToAssociate && usersToAssociate.length > 0) {
                                logger.error("assigning users to teams (updateUserToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                        }
                        data.userIds = temp;
                        teamDao.removeUserFromTeam(data, function (err, userRemoved) {
                            if (err) {
                                logger.error("removing user from teams (updateUserToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                            logger.info("user association updated successfully (updateUserToTeam())");
                            return cb(null, responseCodes.SUCCESS, { "message": messages.userAssignToTeamUpdate });
                        });
                    });
                }
            });
        });
    } else {
        teamDao.removeUserFromTeam(data, function (err, userRemoved) {
            if (err) {
                logger.error("removing user from teams (updateUserToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            logger.info("user association updated successfully (updateUserToTeam())");
            return cb(null, responseCodes.SUCCESS, { "message": messages.userAssignToTeamUpdate });
        });
    }
};
TeamService.prototype.updateModelToTeam = function (data, cb) {
    logger.info("Update model to team service called (updateModelToTeam())");
    if (data.modelIds.length > 0) {
        var modelsToAssociate = [];
        var counter = 0;
        (data.modelIds).forEach(function (modelId) {
            data.modelId = modelId;
            teamDao.updateModelTeam(data, function (err, updated) {
                counter++;
                if (err) {
                    logger.error("Updating model to team (updateModelToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                if (updated.affectedRows > 0) {

                } else {
                    modelsToAssociate.push(modelId);
                }
                if ((data.modelIds).length === counter) {
                    var temp = data.modelIds;
                    data.modelIds = modelsToAssociate;
                    teamDao.assignModelToTeam(data, function (err, added) {
                        if (err) {
                            if (modelsToAssociate && modelsToAssociate.length > 0) {
                                logger.error("assigning models to teams (updateModelToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                        }
                        data.modelIds = temp;
                        teamDao.removeModelFromTeam(data, function (err, modelRemoved) {
                            if (err) {
                                logger.error("removing models from teams (updateModelToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                            logger.info("models association updated successfully (updateModelToTeam())");
                            return cb(null, responseCodes.SUCCESS, { "message": messages.modelAssignToTeamUpdate });
                        });
                    });
                }
            });
        });
    } else {
        teamDao.removeModelFromTeam(data, function (err, modelRemoved) {
            if (err) {
                logger.error("removing models from teams (updateModelToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            logger.info("models association updated successfully (updateModelToTeam())");
            return cb(null, responseCodes.SUCCESS, { "message": messages.modelAssignToTeamUpdate });
        });
    }
};
TeamService.prototype.updatePortfolioToTeam = function (data, cb) {
    logger.info("Update portfolio to team service called (updatePortfolioToTeam())"+data.source);
    if (data.portfolioIds.length > 0) {
        var portfoliosToAssociate = [];
        var counter = 0;
        (data.portfolioIds).forEach(function (portfolioId) {
            data.portfolioId = portfolioId;
            teamDao.updatePortfolioTeam(data, function (err, updated) {
                counter++;
                if (err) {
                    logger.error("Updating portfolio to team (updatePortfolioToTeam())" + err);
                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                }
                if (updated.affectedRows > 0) {

                } else {
                    portfoliosToAssociate.push(portfolioId);
                }
                if ((data.portfolioIds).length === counter) {
                    var temp = data.portfolioIds;
                    data.portfolioIds = portfoliosToAssociate;
                    teamDao.assignPortfolioToTeam(data, function (err, added) {
                        if (err) {
                            if (portfoliosToAssociate && portfoliosToAssociate.length > 0) {
                                logger.error("assigning portfolios to teams (updatePortfolioToTeam())" + err);
                                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                        }
                        data.portfolioIds = temp;
                        if(data.keepOld && data.keepOld === 1){
                            logger.info("portfolio association updated successfully (updatePortfolioToTeam())");
                            return cb(null, responseCodes.SUCCESS, { "message": messages.portfolioAssignToTeamUpdate });
                        }else{
                            teamDao.removePortfolioFromTeam(data, function (err, portfolioRemoved) {
                                if (err) {
                                    logger.error("removing portfolio from teams (updatePortfolioToTeam())" + err);
                                    return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                                }
                                logger.info("portfolio association updated successfully (updatePortfolioToTeam())");
                                return cb(null, responseCodes.SUCCESS, { "message": messages.portfolioAssignToTeamUpdate });
                            });
                        }
                    });
                }
            });
        });
    } else {
        teamDao.removePortfolioFromTeam(data, function (err, portfolioRemoved) {
            if (err) {
                logger.error("removing portfolio from teams (updatePortfolioToTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            logger.info("portfolio association updated successfully (updatePortfolioToTeam())");
            return cb(null, responseCodes.SUCCESS, { "message": messages.portfolioAssignToTeamUpdate });
        });
    }
};

TeamService.prototype.reassignTeam = function (data, cb) {
    logger.info("Reassign team service called (reassignTeam())");
    if (data.oldId !== data.newId) {
        data.id = data.newId;
        teamDao.get(data, function (err, team) {
            if (err) {
                logger.error("Getting team (reassignTeam())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if (team && team.length > 0) {
                teamDao.reassignTeam(data, function (err, fetched) {
                    if (err) {
                        logger.error("Reassign team (reassignTeam())" + err);
                        return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    if (fetched.affectedRows > 0) {
                        logger.info("Team reassigned successfully (reassignTeam()) \n");
                        return cb(null, responseCodes.SUCCESS, { "message": messages.teamReassigned });
                    } else {
                        logger.info("No Team associate with team (reassignTeam()) \n");
                        return cb(messages.noUserAssociatedWithTeam + " id = " + data.oldId, responseCodes.NOT_FOUND);
                    }
                });
            } else {
                logger.info("Team not Found (reassignTeam())" + data.newId);
                return cb(messages.teamNotFound, responseCodes.NOT_FOUND);
            }
        });
    } else {
        logger.info("User send same oldId and newId (reassignTeam())");
        return cb(messages.oldAndNewSameId, responseCodes.NOT_FOUND);
    }
};

TeamService.prototype.validUsers = function(data,cb){
    var isValid = true;
    var userIds = data.userIds;
    var usersNotFound = [];
    var counter = 0;
    var tempData  = {};
    tempData.user = data.user;
    tempData.reqId = data.reqId;
    if(userIds && userIds.length > 0 ){
        userIds.forEach(function(id){
         tempData.id = id
         userDao.get(tempData,function(err,fetched){
           counter++;
           if(err){
            logger.error("Fetching user (validUsers())" + err);
        }
        if(fetched && fetched.length > 0){

        }else{
            isValid = false;
            logger.info("User not Found (validUsers())" + id);
            usersNotFound.push(id)
        }
        if(counter === userIds.length){
            return cb(isValid,usersNotFound);
        }
    });

     });
    }else{
        return cb(isValid,usersNotFound);
    }
};
TeamService.prototype.validModels = function(data,cb){
    var isValid = true;
    var modelIds = data.modelIds;
    var modelNotFound = [];
    var counter = 0;
    var tempData  = {};
    tempData.user = data.user;
    tempData.reqId = data.reqId;
    if(modelIds && modelIds.length > 0 ){
        modelIds.forEach(function(id){
         tempData.id = id
         modelDao.get(tempData,function(err,fetched){
           counter++;
           if(err){
            logger.error("Fetching model (validModels())" + err);
        }
        if(fetched && fetched.length > 0){

        }else{
            isValid = false;
            logger.info("Model not Found (validModels())" + id);
            modelNotFound.push(id)
        }
        if(counter === modelIds.length){
            return cb(isValid,modelNotFound);
        }
    });

     });
    }else{
        return cb(isValid,modelNotFound);
    }
};
TeamService.prototype.validAdvisors = function(data,cb){
    var isValid = true;
    var advisorIds = data.advisorIds;
    var advisorNotFound = [];
    var counter = 0;
    var tempData  = {};
    tempData.user = data.user;
    tempData.reqId = data.reqId;
    if(advisorIds && advisorIds.length > 0 ){
        advisorIds.forEach(function(id){
            tempData.id = id;
            advisorDao.get(tempData,function(err,fetched){
               counter++;
               if(err){
                logger.error("Fetching advisor (validAdvisors())" + err);
            }
            if(fetched && fetched.length > 0){

            }else{
                isValid = false;
                logger.info("Advisor not Found (validAdvisors())" + id);
                advisorNotFound.push(id)
            }
            if(counter === advisorIds.length){
                return cb(isValid,advisorNotFound);
            }
        });
        });
    }else{
        return cb(isValid,advisorNotFound);
    }
};
TeamService.prototype.validPortfolios = function(data,cb){
    var isValid = true;
    var portfolioIds = data.portfolioIds;
    var portfolioNotFound = [];
    var counter = 0;
    var tempData  = {};
    tempData.user = data.user;
    tempData.reqId = data.reqId;
    if(portfolioIds && portfolioIds.length > 0 ){
        portfolioIds.forEach(function(id){
           tempData.id = id
           portfolioDao.get(tempData,function(err,fetched){
               counter++;
               if(err){
                logger.error("Fetching portfolio (validPortfolios())" + err);
            }
            if(fetched && fetched.length > 0){

            }else{
                isValid = false;
                logger.info("Portfolio not Found (validPortfolios())" + id);
                portfolioNotFound.push(id)
            }
            if(counter === portfolioIds.length){
                return cb(isValid,portfolioNotFound);
            }
        });
       });
    }else{
        return cb(isValid,portfolioNotFound);
    }
};
TeamService.prototype.getTeamSummary = function(data,cb){
    teamDao.getTeamSummary(data,function(err,result){
        if(err){
            logger.error("error fetching summary getTeamSummary())"+err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("summary fetched successfully (getTeamSummary())");
        return cb(null,responseCodes.SUCCESS,result);
    });
};
TeamService.prototype.changeUserStatusBasedOnTeamStatus = function(data,cb){
    if(data.status === 0 ){
        teamDao.updateUserStatus(data,function (err,userToInactive){
            if(err){
                logger.error("getting users to inactive (changeUserStatusBasedOnTeamStatus())" + err);
                return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
            }
            logger.info("User status change successfully for team Id(changeUserStatusBasedOnTeamStatus())" + data.id);
            return cb(null, responseCodes.SUCCESS, true);

        });
    }else{
        logger.info("User status will not change bacause it is not valid(changeUserStatusBasedOnTeamStatus())" + data.id);
        return cb(null, responseCodes.SUCCESS, true);
    }
}
module.exports = TeamService;
