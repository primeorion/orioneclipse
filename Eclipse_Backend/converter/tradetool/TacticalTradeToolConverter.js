"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var util = require('util');
var UtilService = require("service/util/UtilService");

var SecurityListResponse = require("model/tradetool/tacticalTradeTool/SecurityListResponse.js");
var AccountListResponse = require("model/tradetool/tacticalTradeTool/AccountListResponse.js");
var TaxlotListResponse = require("model/tradetool/tacticalTradeTool/TaxlotListResponse.js");

var AccountModelListResponse = require("model/tradetool/tacticalTradeTool/AccountModelListResponse.js");
var LevelOneDataResponse = require("model/tradetool/tacticalTradeTool/LevelOneDataResponse.js");
var LevelTwoDataResponse = require("model/tradetool/tacticalTradeTool/LevelTwoDataResponse.js");
var LevelThreeDataResponse = require("model/tradetool/tacticalTradeTool/LevelThreeDataResponse.js");
var LevelFourDataResponse = require("model/tradetool/tacticalTradeTool/LevelFourDataResponse.js");
var FinalLevelData = require("model/tradetool/tacticalTradeTool/FinalLevelData.js");



var logger = helper.logger(moduleName);

var applicationEnum = config.applicationEnum;

var utilService = new UtilService();

var TacticalTradeToolConverter = function () { }



TacticalTradeToolConverter.prototype.getSecurityListResponse = function (data, cb) {
    var securityList = [];
    var dataValue = data[0] ? data[0] : [];
    if (data) {
        logger.debug("Converting data to security List  securityListResponse()");
        dataValue.forEach(function (data) {
            var securityListResponse = new SecurityListResponse();

            securityListResponse.id = data.id ? data.id : 0;
            securityListResponse.securityName = data.securityName ? data.securityName : null;

            securityListResponse.tradeOrderAction = data.tradeOrderAction ? data.tradeOrderAction : null;
            securityListResponse.tradeOrderShares = data.tradeOrderShares ? data.tradeOrderShares : 0;
            securityListResponse.tradeOrderRedemptionFee = data.tradeOrderRedemptionFee ? data.tradeOrderRedemptionFee : 0;
            securityListResponse.tradeCost = data.tradeCost ? data.tradeCost : 0;
            securityListResponse.tradeOrderAmount = data.tradeOrderAmount ? data.tradeOrderAmount : 0;
            securityListResponse.tradeOrderPrice = data.tradeOrderPrice ? data.tradeOrderPrice : 0;
            securityListResponse.tradeOrderHoldUntil = data.tradeOrderHoldUntil ? data.tradeOrderHoldUntil : null;


            securityListResponse.postTradeShares = data.postTradeShares ? data.postTradeShares : 0;
            securityListResponse.postTradeAmount = data.postTradeAmount ? data.postTradeAmount : 0;
            securityListResponse.postTradePer = data.postTradePer ? data.postTradePer : 0;

            securityListResponse.modelTargetShares = data.modelTargetShares ? data.modelTargetShares : 0;
            securityListResponse.modelTargetAmount = data.modelTargetamount ? data.postTrademodelTargetamountPer : 0;
            securityListResponse.modelTargetPer = data.modelTargetPer ? data.modelTargetPer : 0;

            securityListResponse.currentShares = data.currentShares ? data.currentShares : 0;
            securityListResponse.currentAmount = data.currentAmount ? data.currentAmount : 0;
            securityListResponse.currentPer = data.currentPer ? data.currentPer : 0;;

            securityListResponse.gainLossCostShortTerm = data.gainLossCostShortTerm ? data.gainLossCostShortTerm : 0;
            securityListResponse.gainLossCostLongTerm = data.gainLossCostLongTerm ? data.gainLossCostLongTerm : 0;
            securityListResponse.gainAmount = data.gainAmount ? data.gainAmount : 0;
            securityListResponse.gainPer = data.gainPer ? data.gainPer : 0;
            securityListResponse.tradeGain = data.tradeGain ? data.tradeGain : 0;

            securityListResponse.commentsTradeReason = data.commentsTradeReason ? data.commentsTradeReason : null;
            securityListResponse.commentsMessage = data.commentsMessage ? data.commentsMessage : null;
            securityListResponse.isSMA = data.sma ? data.isSMA : 0;
            securityListResponse.exclude = data.exclude ? data.exclude : 1;


            securityList.push(securityListResponse);
        });
        return cb(null, securityList);
    }
    else {
        return cb("Error in Getting Data from DB", securityList);
    }
};



TacticalTradeToolConverter.prototype.getAccountListBySecurityIdResponse = function (data, cb) {
    var accountList = [];
    if (data) {
        logger.debug("Converting data to account List  getAccountListBySecurityIdResponse()");

        var dataValue = data[0] ? data[0] : [];

        dataValue.forEach(function (data) {
            var accountListResponse = new AccountListResponse();

            accountListResponse.id = data.id;
            accountListResponse.accountName = data.accountName ? data.accountName : null;

            accountListResponse.custodian = data.custodian ? data.custodian : null;
            accountListResponse.type = data.accountType ? data.accountType : null;
            accountListResponse.info = data.accountType ? data.info : null;
            accountListResponse.currentShares = data.currentShares ? data.currentShares : 0;
            accountListResponse.currentAmount = data.currentAmount ? data.currentAmount : 0;
            accountListResponse.costShortTerm = data.costShortTerm ? data.costShortTerm : 0;
            accountListResponse.costLongTerm = data.costLongTerm ? data.costLongTerm : 0;
            accountListResponse.gainAmount = data.gainAmount ? data.gainAmount : 0;
            accountListResponse.gainPer = data.gainPer ? data.gainPer : 0;
            accountListResponse.tradeGain = data.tradeGain ? data.tradeGain : 0;
            accountListResponse.alternative = data.alternative ? data.alternative : null;
            accountListResponse.isSMA = data.sma ? data.sma : 1;
            accountListResponse.exclude = data.exclude ? data.exclude : 1;
            accountList.push(accountListResponse)
        });
        return cb(null, accountList);
    }
    else {
        return cb("Error in Getting Data from DB", accountList);
    }
};

TacticalTradeToolConverter.prototype.getTaxlotListResponse = function (data, cb) {
    var taxList = [];
    if (data) {
        logger.debug("Converting data to taxlot List  getTaxlotListResponse()");

        var dataValue = data[0] ? data[0] : [];
        dataValue.forEach(function (data) {
            var taxlotListResponse = new TaxlotListResponse();

            taxlotListResponse.id = data.id;
            taxlotListResponse.acquiredDate = data.acquiredDate;
            taxlotListResponse.taxlotShares = data.taxlotShares ? data.taxlotShares : 0;
            taxlotListResponse.taxlotPrice = data.taxlotValue ? data.taxlotValue : 0;
            taxlotListResponse.costShortTerm = data.costShortTerm ? data.costShortTerm : 0;
            taxlotListResponse.costLongTerm = data.costLongTerm ? data.costLongTerm : 0;
            taxlotListResponse.gainAmount = data.gainAmount ? data.gainAmount : 0;
            taxlotListResponse.gainPer = data.gainPer ? data.gainPer : 0;
            taxlotListResponse.tradeGain = data.tradeGain ? data.tradeGain : 0;
            taxlotListResponse.reedemptionFee = data.reedemptionFee ? data.reedemptionFee : 0;
            taxlotListResponse.tradeCost = data.tradeCost ? data.tradeCost : 0;
            taxList.push(taxlotListResponse)
        });

        return cb(null, taxList);
    }
    else {
        return cb("Error in Getting Data from DB", taxList);
    }
};



TacticalTradeToolConverter.prototype.getLevelDataListResponse = function (data, cb) {
    var sleeve = data[4][0] ? data[4][0] : [];
    var accountModelListResponse = {};
    //var accountModelListResponse = new AccountModelListResponse();
    var finalLevelData = new FinalLevelData();



    finalLevelData.portfolioInfo = {};
    finalLevelData.portfolioInfo.id = 1;
    finalLevelData.portfolioInfo.portfolioName = "test Portfolio";
    finalLevelData.portfolioInfo.AUM = 5000;
    finalLevelData.portfolioInfo.netCash = 6000;
    finalLevelData.portfolioInfo.targetAmount = 5000;
    finalLevelData.portfolioInfo.targetPer = 50;
    finalLevelData.portfolioInfo.currentAmount = 5000;
    finalLevelData.portfolioInfo.currentPer = 30;


    finalLevelData.model = [];


    if (data.length > 1) {
        var levelone = data[0] ? data[0] : [];

        logger.debug("Converting data to portfolio level data in getLevelDataListResponse()");

        accountModelListResponse.isSleeve = 1;

        accountModelListResponse.generalInfo = {};


        accountModelListResponse.generalInfo.sleeveInfo = {};

        // sleeveInfoDetail.forEach(function (sleeve) {
        //     var accountModelListResponse = new AccountModelListResponse();
        accountModelListResponse.generalInfo.sleeveInfo.id = sleeve.id ? sleeve.id : 0;
        accountModelListResponse.generalInfo.sleeveInfo.sleeveAUM = sleeve.sleeveAUM ? sleeve.sleeveAUM : 0;
        accountModelListResponse.generalInfo.sleeveInfo.netCash = sleeve.netCash ? sleeve.netCash : 0;
        accountModelListResponse.generalInfo.sleeveInfo.cashTarget = sleeve.cashTarget ? sleeve.cashTarget : 0;
        accountModelListResponse.generalInfo.sleeveInfo.cashTargetPer = sleeve.cashTargetPer ? sleeve.cashTargetPer : 0;
        accountModelListResponse.generalInfo.sleeveInfo.cashCurrentPer = sleeve.cashCurrentPer ? sleeve.cashCurrentPer : 0;
        accountModelListResponse.generalInfo.sleeveInfo.cashCurrent = sleeve.cashCurrent ? sleeve.cashCurrent : 0;



        accountModelListResponse.generalInfo.accountInfo = {};
        accountModelListResponse.generalInfo.accountInfo.id = 1;
        accountModelListResponse.generalInfo.accountInfo.accountName = "Kane";
        accountModelListResponse.generalInfo.accountInfo.custodian = "Test";
        accountModelListResponse.generalInfo.accountInfo.type = "ITA";
        accountModelListResponse.generalInfo.accountInfo.currentShares = 100;
        accountModelListResponse.generalInfo.accountInfo.currentAmount = 1000;


        accountModelListResponse.generalInfo.accountInfo.costShortTerm = 5000;
        accountModelListResponse.generalInfo.accountInfo.costLongTerm = 10000;
        accountModelListResponse.generalInfo.accountInfo.gainAmount = 8000;
        accountModelListResponse.generalInfo.accountInfo.gainPer = 10;
        accountModelListResponse.generalInfo.accountInfo.tradeGain = 1000;
        accountModelListResponse.generalInfo.accountInfo.alternative = 1;


        accountModelListResponse.level1 = [];

        var levelone = data[0] ? data[0] : [];
        var levelTwo = data[1] ? data[1] : [];
        var levelThree = data[2] ? data[2] : [];
        var levelFour = data[3] ? data[3] : [];


        levelone.forEach(function (leveloneData) {
            var levelOneDataResponse = new LevelOneDataResponse();

            levelOneDataResponse.id = leveloneData.id ? leveloneData.id : 0;
            levelOneDataResponse.levelName = leveloneData.levelName ? leveloneData.levelName : null;
            levelOneDataResponse.targetAmount = leveloneData.targetAmount ? leveloneData.targetAmount : 0;
            levelOneDataResponse.targetPercentage = leveloneData.targetPercentage ? leveloneData.targetPercentage : 0;
            levelOneDataResponse.currentAmount = leveloneData.currentAmount ? leveloneData.currentAmount : 0;
            levelOneDataResponse.currentPercentage = leveloneData.currentPercentage ? leveloneData.currentPercentage : 0;


            levelOneDataResponse.level2 = [];

            levelTwo.forEach(function (leveltwoData) {
                var levelTwoDataResponse = new LevelTwoDataResponse();

                levelTwoDataResponse.id = leveltwoData.id ? leveltwoData.id : 0;
                levelTwoDataResponse.levelName = leveltwoData.levelName ? leveltwoData.levelName : null;
                levelTwoDataResponse.targetAmount = leveltwoData.targetAmount ? leveltwoData.targetAmount : 0;
                levelTwoDataResponse.targetPercentage = leveltwoData.targetPercentage ? leveltwoData.targetPercentage : 0;
                levelTwoDataResponse.currentAmount = leveltwoData.currentAmount ? leveltwoData.currentAmount : 0;
                levelTwoDataResponse.currentPercentage = leveltwoData.currentPercentage ? leveltwoData.currentPercentage : 0;



                levelTwoDataResponse.level3 = [];

                levelThree.forEach(function (levelThreeData) {
                    var levelThreeDataResponse = new LevelThreeDataResponse();

                    levelThreeDataResponse.id = levelThreeData.id ? levelThreeData.id : 0;
                    levelThreeDataResponse.levelName = levelThreeData.levelName ? levelThreeData.levelName : null;
                    levelThreeDataResponse.targetAmount = levelThreeData.targetAmount ? levelThreeData.targetAmount : 0;
                    levelThreeDataResponse.targetPercentage = levelThreeData.targetPercentage ? levelThreeData.targetPercentage : 0;
                    levelThreeDataResponse.currentAmount = levelThreeData.currentAmount ? levelThreeData.currentAmount : 0;
                    levelThreeDataResponse.currentPercentage = levelThreeData.currentPercentage ? levelThreeData.currentPercentage : 0;


                    levelThreeDataResponse.level4 = [];

                    levelFour.forEach(function (levelFourData) {
                        var levelFourDataResponse = new LevelFourDataResponse();

                        levelFourDataResponse.id = levelFourData.id ? levelFourData.id : 0;
                        levelFourDataResponse.levelName = levelFourData.levelName ? levelFourData.levelName : null;
                        levelFourDataResponse.targetAmount = levelFourData.targetAmount ? levelFourData.targetAmount : 0;
                        levelFourDataResponse.targetPercentage = levelFourData.targetPercentage ? levelFourData.targetPercentage : 0;
                        levelFourDataResponse.currentAmount = levelFourData.currentAmount ? levelFourData.currentAmount : 0;
                        levelFourDataResponse.currentPercentage = levelFourData.currentPercentage ? levelFourData.currentPercentage : 0;

                        levelThreeDataResponse.level4.push(levelFourDataResponse);

                    });

                    levelTwoDataResponse.level3.push(levelThreeDataResponse);
                });


                levelOneDataResponse.level2.push(levelTwoDataResponse);
            });

            accountModelListResponse.level1.push(levelOneDataResponse);
        });

        finalLevelData.model.push(accountModelListResponse);
        //  finalLevelData.model.push(accountModelListResponse);
        //});

        return cb(null, finalLevelData);
    }
    else {
        return cb("Error in Getting Data from DB", finalLevelData);
    }

};



TacticalTradeToolConverter.prototype.getUnAssignSecurityListByPortIdResponse = function (data, cb) {
    var securityList = [];
    var dataValue = data[0] ? data[0] : [];
    if (data) {
        logger.debug("Converting data to Un assign security List  securityListResponse()");
        dataValue.forEach(function (data) {
            var securityListResponse = new SecurityListResponse();

            securityListResponse.id = data.id;
            securityListResponse.securityName = data.securityName ? data.securityName : null;

            securityListResponse.tradeOrderAction = data.tradeOrderAction ? data.tradeOrderAction : null;
            securityListResponse.tradeOrderShares = data.tradeOrderShares ? data.tradeOrderShares : 0;
            securityListResponse.tradeOrderRedemptionFee = data.tradeOrderRedemptionFee ? data.tradeOrderRedemptionFee : 0;
            securityListResponse.tradeCost = data.tradeCost ? data.tradeCost : 0;
            securityListResponse.tradeOrderAmount = data.tradeOrderAmount ? data.tradeOrderAmount : 0;

            securityListResponse.tradeOrderPrice = data.tradeOrderPrice ? data.tradeOrderPrice : 0;
            securityListResponse.tradeOrderHoldUntil = data.tradeOrderHoldUntil ? data.tradeOrderHoldUntil : null;


            securityListResponse.postTradeShares = data.postTradeShares ? data.postTradeShares : 0;
            securityListResponse.postTradeAmount = data.postTradeAmount ? data.postTradeAmount : 0;
            securityListResponse.postTradePer = data.postTradePer ? data.postTradePer : 0;

            securityListResponse.modelTargetShares = data.modelTargetShares ? data.modelTargetShares : 0;
            securityListResponse.modelTargetAmount = data.modelTargetamount ? data.modelTargetAmount : 0;
            securityListResponse.modelTargetPer = data.modelTargetPer ? data.modelTargetPer : 0;

            securityListResponse.currentShares = data.currentShares ? data.currentShares : 0;
            securityListResponse.currentAmount = data.currentAmount ? data.currentAmount : 0;
            securityListResponse.currentPer = data.currentPer ? data.currentPer : 0;

            securityListResponse.gainLossCostShortTerm = data.gainLossCostShortTerm ? data.gainLossCostShortTerm : 0;
            securityListResponse.gainLossCostLongTerm = data.gainLossCostLongTerm ? data.gainLossCostLongTerm : 0;
            securityListResponse.gainAmount = data.gainAmount ? data.gainAmount : 0;
            securityListResponse.gainPer = data.gainPer ? data.gainPer : 0;
            securityListResponse.tradeGain = data.tradeGain ? data.tradeGain : 0;

            securityListResponse.commentsTradeReason = data.commentsTradeReason;
            securityListResponse.commentsMessage = data.commentsMessage;
            securityListResponse.isSMA = data.sma ? data.sma : 1;
            securityListResponse.exclude = data.exclude ? data.exclude : 1;
            securityList.push(securityListResponse);
        });
        return cb(null, securityList);
    }
    else {
        return cb("Error in Getting Data from DB", securityList);
    }
};

module.exports = TacticalTradeToolConverter;