"use strict";

var fs = require('file-system');
var lodash = require("lodash");
var zlib = require('zlib');
var path = require("path");

var moduleName = __filename;
var config = require('config');
var constants = config.orionConstants;
var s3 = constants.aws.s3;
var logger = require('helper/Logger.js')(moduleName);
var tsvWriter = require('helper/tsvWriter.js');
var s3Client = require('helper/AwsS3Client.js').s3Client;
var messages = config.messages;
var responseCodes = config.responseCodes;
var applicationEnum = config.applicationEnum;
var sleeveFilesEnum = applicationEnum.sleeveFiles;
var ImportService = require("service/import/ImportService.js");
var importService = new ImportService();

var SleeveService =  function() {};


SleeveService.prototype.sleeveSync = function (input, cb) {
	var self = this;
	var accountArray = [];
	var advisorArray = [];
	var custodianArray = [];
	var holdingsArray = [];
	var realizedGainLossesArray = [];
	var securitiesArray = [];
	var taxLotsArray = [];
	var transactionsArray = [];
	var common = {};
	var date = new Date();
	var awsSleeveBaseFolder = 'sleeveImport/';
	var awsSleevePath = awsSleeveBaseFolder+input.accounts[0].orionFirmId+'/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()+'/';
	var dir = appBasePath+"/"+awsSleevePath;
	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
	(input.accounts).forEach(function(data){
		var orionFirmId = data.orionFirmId;
		var accountId = data.accountId;
		var accountNumber = data.accountNumber;
		var accountName = data.accountName;
		common.accountId = accountId;
		common.accountNumber = accountNumber;
		common.accountName = accountName;
		common.orionFirmId = orionFirmId;

		common.baseUrl = dir + orionFirmId;


		var advisor = data.advisor;
		var custodian = data.custodian;

		var holdings = data.holdings;
		var realizedGainLosses = data.realizedGainLosses;
		var securities = data.securities;
		var taxLots = data.taxLots;
		var transactions = data.transactions;
		var account = lodash.omit(data, [advisor, custodian, holdings ,
			realizedGainLosses ,securities ,taxLots ,transactions]);

		account.custodian = custodian.name;
		account.custodialAccountNumber = custodian.masterAccountNumber;
		account.advisorName = advisor.name;
		account.advisorExternalId = advisor.externalId;
		accountArray.push(account);
		advisorArray.push(advisor);
		custodianArray.push(custodian);
		holdingsArray = lodash.concat(holdingsArray,holdings);
		realizedGainLossesArray = lodash.concat(realizedGainLossesArray,realizedGainLosses);
		securitiesArray = lodash.concat(securitiesArray,securities);
		taxLotsArray = lodash.concat(taxLotsArray,taxLots);
		transactionsArray = lodash.concat(transactionsArray,transactions);

	});
	self.genrateAccountFile(accountArray, common, function(err,result){
		if(err){
			logger.error("Error genrating account file :"+err);
			return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
		}
		self.genrateAdvisorFile(advisorArray, common, function(err,result){
			if(err){
				logger.error("Error genrating advisor file :"+err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}
			self.genrateCustodianFile(custodianArray, common, function(err,result){
				if(err){
					logger.error("Error genrating custodian file :"+err);
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}
				self.genrateHoldingFile(holdingsArray, common, function(err,result){
					if(err){
						logger.error("Error genrating holding file :"+err);
						return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					}
					self.genrateRealizedGainLossFile(realizedGainLossesArray, common, function(err,result){
						if(err){
							logger.error("Error genrating realizedGainLoss file :"+err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						}
						self.genrateSecurityFile(securitiesArray, common, function(err,result){
							if(err){
								logger.error("Error genrating security file :"+err);
								return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
							}
							self.genrateTaxLotFile(taxLotsArray, common, function(err,result){
								if(err){
									logger.error("Error genrating taxLot file :"+err);
									return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
								}
								self.genrateTransactioFile(transactionsArray, common, function(err,result){
									if(err){
										logger.error("Error genrating transaction file :"+err);
										return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
									}
									//trigger etl process
									self.uploadSleeveFiles(awsSleevePath,function(err, status, result){
										if(err){
											logger.error("Error uploading files to S3 "+err);
											return (err, status);
										}
										logger.info("calling import service");
										var input = {inputDir:awsSleevePath};
										importService.sleeveDataImport(input,function(err,code,result){
											if(err){
												logger.error("Error in import process");
	            								return cb(err, code);
											}
											return cb(null, code, result);
										});	
									});			
								});
							});
						});
					});
				});
			});
		});
	});
}
SleeveService.prototype.uploadSleeveFiles = function(key,cb){
	var params = {
		localDir: key,
		deleteRemoved: true, // default false, whether to remove s3 objects 
		s3Params: {
			Bucket: s3.BucketName,
			Prefix: key,
		},
	};
	var start = new Date();
	var uploader = s3Client.uploadDir(params);
	uploader.on('error', function(err) {
	  logger.error("unable to upload:"+ err);
	  return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
	});
	uploader.on('progress', function() {
	  logger.info("progress", uploader.progressAmount, uploader.progressTotal);
	});
	uploader.on('end', function() {
		var end = new Date();
		var diff = end - start;
		logger.debug("done uploading in time "+diff);
		return cb(null, responseCodes.SUCCESS, null);
	});
}
SleeveService.prototype.genrateAccountFile = function (accounts, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.ACCOUNT.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.ACCOUNT.FILENAME));
	accounts.forEach(function(account){
		self.modifyData(account,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});	

}
SleeveService.prototype.genrateAdvisorFile = function (advisors, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.ADVISOR.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.ADVISOR.FILENAME));
	advisors.forEach(function(advisor){
		advisor.orionFirmId = common.orionFirmId;
		advisor.advisorName = advisor.name;
		advisor.advisorNumber = advisor.number;
		self.modifyData(advisor,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});	
}
SleeveService.prototype.genrateCustodianFile = function (custodians, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.CUSTODIAN.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.CUSTODIAN.FILENAME));
	custodians.forEach(function(custodian){
		custodian.orionFirmId = common.orionFirmId;
		self.modifyData(custodian,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});	
}
SleeveService.prototype.genrateHoldingFile = function (holdings, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.HOLDING.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.HOLDING.FILENAME));
	holdings.forEach(function(holding){
		holding.accountId = common.accountId;
		holding.accountNumber = common.accountNumber;
		holding.orionFirmId = common.orionFirmId;
		self.modifyData(holding,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});	
}
SleeveService.prototype.genrateRealizedGainLossFile = function (realizedGainLosses, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.REALIZEDGAINLOSS.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.REALIZEDGAINLOSS.FILENAME));
	realizedGainLosses.forEach(function(realizedGainLoss){
		realizedGainLoss.accountId = common.accountId;
		realizedGainLoss.accountNumber = common.accountNumber;
		realizedGainLoss.orionFirmId = common.orionFirmId;
		self.modifyData(realizedGainLoss,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});	
}
SleeveService.prototype.genrateSecurityFile = function (securities, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.SECURITY.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.SECURITY.FILENAME));
	securities.forEach(function(security){
		security.orionFirmId = common.orionFirmId;
		self.modifyData(security,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});		
}
SleeveService.prototype.genrateTaxLotFile = function (taxLots, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.TAXLOT.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.TAXLOT.FILENAME));
	taxLots.forEach(function(taxLot){
		taxLot.orionFirmId = common.orionFirmId;
		taxLot.accountId = common.accountId;
		taxLot.accountNumber = common.accountNumber;
		self.modifyData(taxLot,function(result){
			writer.write(result);
		});
	});
	writer.end(function() {
		cb(null,true);
	});		
}
SleeveService.prototype.genrateTransactioFile = function (transactions, common, cb){
	var self = this;
	var writer = tsvWriter.getWriter();
	writer.headers = sleeveFilesEnum.TRANSACTION.HEADERS;
	writer.pipe(fs.createWriteStream(common.baseUrl+sleeveFilesEnum.TRANSACTION.FILENAME));
	transactions.forEach(function(transaction){
		transaction.orionFirmId = common.orionFirmId;
		transaction.accountId = common.accountId;
		transaction.accountNumber = common.accountNumber;
		self.modifyData(transaction,function(result){
			writer.write(result);
		});	
	});
	writer.end(function() {
		cb(null,true);
	});	
}
SleeveService.prototype.modifyData = function (data,cb){
	var self = this;
	var updatedData = self.updateDataKeys(data);
	return cb(updatedData);
}

SleeveService.prototype.updateDataKeys = function(object){
	for (var key in object) {
		var temp; 
		if (object.hasOwnProperty(key)) {
			temp = object[key];
			delete object[key];
			object[key.charAt(0).toUpperCase() + key.substring(1)] = temp;
		}
	}
	return object;
}
module.exports = SleeveService;