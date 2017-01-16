/*
SQLyog Community v11.25 (64 bit)
MySQL - 5.6.10 : Database - dev_orionEclipseFirm_999
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`dev_orionEclipseFirm_999` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `dev_orionEclipseFirm_999`;

/*Table structure for table `account` */

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `orionConnectExternalId` int(11) NOT NULL,
  `orionConnectFirmId` int(10) DEFAULT NULL,
  `accountId` varchar(100) DEFAULT NULL,
  `accountNumber` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `name` varchar(500) CHARACTER SET latin1 DEFAULT NULL,
  `portfolioId` int(11) DEFAULT NULL,
  `householdId` int(11) DEFAULT NULL,
  `ytdRealizedStgl` decimal(10,0) DEFAULT NULL,
  `ytdRealizedLtgl` decimal(10,0) DEFAULT NULL,
  `ssn` varchar(225) CHARACTER SET latin1 DEFAULT NULL,
  `sweepSymbol` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `custodianId` int(11) DEFAULT NULL,
  `custodialAccountNumber` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `sleeveType` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `householdName` varchar(500) CHARACTER SET latin1 DEFAULT NULL,
  `accountTypeId` int(11) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `advisorId` int(11) DEFAULT NULL,
  `sweepSecurityId` int(11) DEFAULT NULL,
  `systematicAmount` varchar(255) DEFAULT NULL,
  `systematicDate` datetime DEFAULT NULL,
  `sma` tinyint(1) DEFAULT NULL,
  `smaTradeable` varchar(255) DEFAULT NULL,
  `billingAccount` varchar(255) DEFAULT NULL,
  `sleeveTarget` decimal(5,2) DEFAULT NULL,
  `sleeveContributionPercent` decimal(5,2) DEFAULT NULL,
  `sleeveDistributionPercent` decimal(5,2) DEFAULT NULL,
  `sleeveToleranceLower` decimal(5,2) DEFAULT NULL,
  `sleeveToleranceUpper` decimal(5,2) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  `disabled` tinyint(1) DEFAULT NULL,
  `disabledReason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`orionConnectExternalId`),
  UNIQUE KEY `UNIQUE` (`orionConnectExternalId`),
  KEY `accountTypeId` (`accountTypeId`),
  KEY `custodianId` (`custodianId`),
  KEY `portfolioId` (`portfolioId`),
  KEY `FK_account_user_createdBy` (`createdBy`),
  KEY `FK_account_user_editedBy` (`editedBy`),
  KEY `FK_account_advisor_idx` (`advisorId`),
  CONSTRAINT `FK_account_advisor` FOREIGN KEY (`advisorId`) REFERENCES `advisor` (`externalId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_account_accountType` FOREIGN KEY (`accountTypeId`) REFERENCES `accountType` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_account_custodian` FOREIGN KEY (`custodianId`) REFERENCES `custodian_old` (`externalId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_account_portfolio_portfolioId` FOREIGN KEY (`portfolioId`) REFERENCES `portfolio` (`id`),
  CONSTRAINT `FK_account_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_account_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `accountExtension` */

DROP TABLE IF EXISTS `accountExtension`;

CREATE TABLE `accountExtension` (
  `accountId` int(11) NOT NULL,
  `portfolioId` int(11) DEFAULT NULL,
  `eclipseCreatedDate` datetime NOT NULL,
  `howPortfolioAssigned` int(11) NOT NULL,
  `tradingNotes` varchar(500) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  KEY `portfolioId` (`portfolioId`),
  KEY `FK_accountExtension_user_createdBy` (`createdBy`),
  KEY `FK_accountExtension_user_editedBy` (`editedBy`),
  KEY `FK_accountExtension_account_accountId` (`accountId`),
  CONSTRAINT `FK_accountExtension_portfolio_portfolioId` FOREIGN KEY (`portfolioId`) REFERENCES `portfolio` (`id`),
  CONSTRAINT `FK_accountExtension_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `FK_accountExtension_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_accountExtension_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `accountSMAAllocation` */

DROP TABLE IF EXISTS `accountSMAAllocation`;

CREATE TABLE `accountSMAAllocation` (
  `accountId` int(11) NOT NULL,
  `modelId` int(11) NOT NULL,
  `modelLevel` int(11) NOT NULL,
  `weightPercent` decimal(5,2) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  KEY `modelId` (`modelId`),
  KEY `FK_accountSMAAllocation_user_createdBy` (`createdBy`),
  KEY `FK_accountSMAAllocation_user_editedBy` (`editedBy`),
  KEY `FK_accountSMAAllocation_account_accountId` (`accountId`),
  CONSTRAINT `FK_accountSMAAllocation_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `accountSMAAllocation_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`),
  CONSTRAINT `FK_accountSMAAllocation_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_accountSMAAllocation_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `accountType` */

DROP TABLE IF EXISTS `accountType`;

CREATE TABLE `accountType` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `taxable` int(11) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_type` (`name`),
  KEY `FK_accountType_user_createdBy` (`createdBy`),
  KEY `FK_accountType_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_accountType_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_accountType_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

/*Table structure for table `advisor` */

DROP TABLE IF EXISTS `advisor`;

CREATE TABLE `advisor` (
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `advisorNumber` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brokerDealer` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  UNIQUE KEY `externalId` (`externalId`),
  KEY `FK_advisor_user_createdBy` (`createdBy`),
  KEY `FK_advisor_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_advisor_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_advisor_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `assetCategory` */

DROP TABLE IF EXISTS `assetCategory`;

CREATE TABLE `assetCategory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `orionEclipseName` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_assetCategory_user_createdBy` (`createdBy`),
  KEY `FK_assetCategory_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_assetCategory_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetCategory_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=latin1;

/*Table structure for table `assetClass` */

DROP TABLE IF EXISTS `assetClass`;

CREATE TABLE `assetClass` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `assetCategoryId` int(11) DEFAULT NULL,
  `orionEclipseName` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_AssetCategoryId` (`assetCategoryId`),
  KEY `FK_assetClass_user_createdBy` (`createdBy`),
  KEY `FK_assetClass_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_assetClass_assetCategory` FOREIGN KEY (`assetCategoryId`) REFERENCES `assetCategory` (`id`),
  CONSTRAINT `FK_assetClass_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetClass_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=432 DEFAULT CHARSET=latin1;

/*Table structure for table `assetSubClass` */

DROP TABLE IF EXISTS `assetSubClass`;

CREATE TABLE `assetSubClass` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `assetClassId` int(11) DEFAULT NULL,
  `orionEclipseName` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `AssetClassId` (`assetClassId`),
  KEY `FK_assetSubClass_user_createdBy` (`createdBy`),
  KEY `FK_assetSubClass_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_assetSubClass_assetClass` FOREIGN KEY (`assetClassId`) REFERENCES `assetClass` (`id`),
  CONSTRAINT `FK_assetSubClass_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetSubClass_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2474 DEFAULT CHARSET=latin1;

/*Table structure for table `assetWeighting` */

DROP TABLE IF EXISTS `assetWeighting`;

CREATE TABLE `assetWeighting` (
  `securityId` int(11) NOT NULL,
  `relatedType` varchar(25) NOT NULL,
  `relatedTypeId` int(11) NOT NULL,
  `weightingPercentage` decimal(10,0) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `createdDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  PRIMARY KEY (`securityId`,`relatedType`,`relatedTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `communityStrategistModel` */

DROP TABLE IF EXISTS `communityStrategistModel`;

CREATE TABLE `communityStrategistModel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `communityStrategistPreferenceId` int(11) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_communityStrategistModel_model_id` (`modelId`),
  KEY `FK_communityStrategistModel_communityStrategistPreference_id` (`communityStrategistPreferenceId`),
  CONSTRAINT `FK_communityStrategistModel_communityStrategistPreference_id` FOREIGN KEY (`communityStrategistPreferenceId`) REFERENCES `communityStrategistPreferenceValue` (`id`),
  CONSTRAINT `FK_communityStrategistModel_model_id` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `communityStrategistPreferenceValue` */

DROP TABLE IF EXISTS `communityStrategistPreferenceValue`;

CREATE TABLE `communityStrategistPreferenceValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceValueId` int(11) NOT NULL,
  `strategistId` int(11) DEFAULT NULL,
  `modelAccessLevel` int(11) NOT NULL COMMENT '1 or 2 (1=All, 2=SelectedOnly)',
  PRIMARY KEY (`id`),
  KEY `FK_communityPreference_preferenceValue_id` (`preferenceValueId`),
  KEY `FK_communityPreference_modelAccessLevel_id` (`modelAccessLevel`),
  CONSTRAINT `FK_communityPreference_preferenceValue_id` FOREIGN KEY (`preferenceValueId`) REFERENCES `preferenceValue` (`id`),
  CONSTRAINT `FK_communityPreference_modelAccessLevel_id` FOREIGN KEY (`modelAccessLevel`) REFERENCES `modelAccessLevel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `component` */

DROP TABLE IF EXISTS `component`;

CREATE TABLE `component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

/*Table structure for table `custodian` */

DROP TABLE IF EXISTS `custodian`;

CREATE TABLE `custodian` (
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `tradeExecutionTypeId` int(11) DEFAULT NULL,
  `masterAccountNumber` varchar(255) DEFAULT NULL,
  UNIQUE KEY `unique_custodian` (`externalId`),
  KEY `FK_custodian_user_createdBy` (`createdBy`),
  KEY `FK_custodian_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_custodian_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_custodian_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `custodianSecuritySymbol` */

DROP TABLE IF EXISTS `custodianSecuritySymbol`;

CREATE TABLE `custodianSecuritySymbol` (
  `custodianId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `securitySymbol` varchar(100) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`custodianId`,`securityId`),
  UNIQUE KEY `PRIMARY1` (`securityId`,`custodianId`),
  CONSTRAINT `FK_custodianSecuritySymbol_custodian` FOREIGN KEY (`custodianId`) REFERENCES `custodian_old` (`externalId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `custodianTradeExecutionTypeForSecurity` */

DROP TABLE IF EXISTS `custodianTradeExecutionTypeForSecurity`;

CREATE TABLE `custodianTradeExecutionTypeForSecurity` (
  `custodianId` int(11) NOT NULL,
  `tradeExecutionTypeId` int(11) NOT NULL,
  `securityTypeId` int(11) NOT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`custodianId`,`securityTypeId`),
  KEY `FK_custodianTETForSecurity_user_createdBy` (`createdBy`),
  KEY `FK_custodianTETForSecurity_user_editedBy` (`editedBy`),
  KEY `FK_custodianTETForSecurity_tET_custodianId` (`custodianId`),
  KEY `FK_custodianTETForSecurity_tET_tradeExecutionTypeId` (`tradeExecutionTypeId`),
  KEY `FK_custodianTETForSecurity_securityType_securityTypeId` (`securityTypeId`),
  CONSTRAINT `FK_custodianTETForSecurity_custodian_externalId` FOREIGN KEY (`custodianId`) REFERENCES `custodian` (`externalId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_custodianTETForSecurity_securityType_securityTypeId` FOREIGN KEY (`securityTypeId`) REFERENCES `securityType` (`id`),
  CONSTRAINT `FK_custodianTETForSecurity_tET_tradeExecutionTypeId` FOREIGN KEY (`tradeExecutionTypeId`) REFERENCES `tradeExecutionType` (`id`),
  CONSTRAINT `FK_custodianTETForSecurity_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_custodianTETForSecurity_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `custodian_old` */

DROP TABLE IF EXISTS `custodian_old`;

CREATE TABLE `custodian_old` (
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `tradeExecutionTypeId` int(11) DEFAULT NULL,
  `masterAccountNumber` varchar(255) DEFAULT NULL,
  UNIQUE KEY `unique_custodian` (`externalId`),
  KEY `FK_custodian_user_createdBy` (`createdBy`),
  KEY `FK_custodian_user_editedBy` (`editedBy`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `entityIdSequence` */

DROP TABLE IF EXISTS `entityIdSequence`;

CREATE TABLE `entityIdSequence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entityName` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `seqId` varchar(500) CHARACTER SET latin1 NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

/*Table structure for table `gridView` */

DROP TABLE IF EXISTS `gridView`;

CREATE TABLE `gridView` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gridType` int(11) NOT NULL,
  `public` tinyint(1) NOT NULL DEFAULT '0',
  `columnDefinition` varchar(255) NOT NULL,
  `ownerUserId` int(11) NOT NULL,
  `showOnDashboard` tinyint(1) NOT NULL DEFAULT '0',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `sqlWhereClause` varchar(255) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerUserId` (`ownerUserId`),
  KEY `FK_gridView_user_createdBy` (`createdBy`),
  KEY `FK_gridView_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_gridView_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_gridView_user` FOREIGN KEY (`ownerUserId`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_gridView_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `locationOptimizationPreferences` */

DROP TABLE IF EXISTS `locationOptimizationPreferences`;

CREATE TABLE `locationOptimizationPreferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Table structure for table `locationOptimizationPreferencesValue` */

DROP TABLE IF EXISTS `locationOptimizationPreferencesValue`;

CREATE TABLE `locationOptimizationPreferencesValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceValueId` int(11) NOT NULL,
  `subClassId` int(11) NOT NULL,
  `locationOptimizationPreferencesId` int(11) NOT NULL,
  `value` int(11) NOT NULL COMMENT 'T/TD/TE values 1=1, 2=2, 3=3,4=Never',
  `isDeleted` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_lopv_preferenceValue_id` (`preferenceValueId`),
  KEY `FK_lopv_assetSubClass_id` (`subClassId`),
  KEY `FK_lopv_locationOptimizationPreferences_id` (`locationOptimizationPreferencesId`),
  KEY `FK_lopv_locationOptimizationPreferencesOption_id` (`value`),
  CONSTRAINT `FK_lopv_assetSubClass_id` FOREIGN KEY (`subClassId`) REFERENCES `assetSubClass` (`id`),
  CONSTRAINT `FK_lopv_locationOptimizationPreferences_id` FOREIGN KEY (`locationOptimizationPreferencesId`) REFERENCES `locationOptimizationPreferences` (`id`),
  CONSTRAINT `FK_lopv_preferenceValue_id` FOREIGN KEY (`preferenceValueId`) REFERENCES `preferenceValue` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

/*Table structure for table `model` */

DROP TABLE IF EXISTS `model`;

CREATE TABLE `model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `communityModelled` int(11) DEFAULT NULL,
  `discription` varchar(255) DEFAULT NULL,
  `ownerUserId` int(11) NOT NULL,
  `scope` varchar(15) DEFAULT NULL,
  `dynamicModel` tinyint(1) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `isSubsitutedForPortfolio` bit(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_createdBy` (`createdBy`),
  KEY `IDX_editedBy` (`editedBy`),
  KEY `IDX_ownerUserId` (`ownerUserId`),
  CONSTRAINT `FK_model_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_model_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_model_user_ownerUserId` FOREIGN KEY (`ownerUserId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=latin1;

/*Table structure for table `modelDetails` */

DROP TABLE IF EXISTS `modelDetails`;

CREATE TABLE `modelDetails` (
  `modelId` int(11) NOT NULL,
  `modelElementId` int(11) NOT NULL,
  `leftValue` int(11) NOT NULL,
  `rightValue` int(11) NOT NULL,
  `ranking` int(11) DEFAULT NULL,
  KEY `modelId` (`modelId`),
  KEY `modelElementId` (`modelElementId`),
  CONSTRAINT `FK_modelDetails_model` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`),
  CONSTRAINT `FK_modelDetails_modelElements` FOREIGN KEY (`modelElementId`) REFERENCES `modelElements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `modelElements` */

DROP TABLE IF EXISTS `modelElements`;

CREATE TABLE `modelElements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `targetPercent` decimal(5,2) NOT NULL,
  `toleranceLower` decimal(5,2) NOT NULL,
  `toleranceUpper` decimal(5,2) NOT NULL,
  `toleranceBand` decimal(5,2) DEFAULT NULL,
  `relatedType` varchar(25) DEFAULT NULL,
  `relatedTypeId` int(11) DEFAULT NULL,
  `validateTickerSet` tinyint(1) NOT NULL DEFAULT '1',
  `rebalancePriority` int(11) NOT NULL DEFAULT '0',
  `tags` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`),
  KEY `createdBy` (`createdBy`),
  KEY `editedBy` (`editedBy`),
  CONSTRAINT `modelElements_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `modelElements_ibfk_2` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Table structure for table `portfolio` */

DROP TABLE IF EXISTS `portfolio`;

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(8000) DEFAULT NULL,
  `modelId` int(11) NOT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `isDisabled` tinyint(1) NOT NULL,
  `disabledReason` varchar(500) DEFAULT NULL,
  `isSleevePortfolio` tinyint(1) NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_modelIDX_modelIdId` (`modelId`),
  KEY `FK_portfolio_user_createdBy` (`createdBy`),
  KEY `FK_portfolio_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_portfolio_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_portfolio_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `portfolioAnalytics` */

DROP TABLE IF EXISTS `portfolioAnalytics`;

CREATE TABLE `portfolioAnalytics` (
  `Id` int(11) NOT NULL,
  `dateOfAnalytics` datetime DEFAULT NULL,
  `portfolioId` int(11) DEFAULT NULL,
  `outOfTolerance` bit(1) DEFAULT NULL,
  `outOfToleranceNoTrades` bit(1) DEFAULT NULL,
  `cashNeed` decimal(10,0) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  `autoRebalanceDate` datetime DEFAULT NULL,
  `cashPercent` decimal(10,0) DEFAULT NULL,
  `deviationPercent` decimal(10,0) DEFAULT NULL,
  `cashTargetPercent` decimal(10,0) DEFAULT NULL,
  `cashReserve` decimal(10,0) DEFAULT NULL,
  `cashValue` decimal(10,0) DEFAULT NULL,
  `hasTaxLossHarvest` bit(1) DEFAULT NULL,
  `hasPendings` bit(1) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `portfolioType` */

DROP TABLE IF EXISTS `portfolioType`;

CREATE TABLE `portfolioType` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `portfolioType` varchar(50) DEFAULT 'NULL',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

/*Table structure for table `position` */

DROP TABLE IF EXISTS `position`;

CREATE TABLE `position` (
  `accountId` int(11) DEFAULT NULL,
  `securityId` int(11) NOT NULL,
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) NOT NULL,
  `price` decimal(22,7) NOT NULL,
  `priceDate` datetime NOT NULL,
  `marketValue` decimal(22,2) NOT NULL,
  `quantity` decimal(22,7) NOT NULL,
  `positionYtdRealizedStgl` decimal(22,7) NOT NULL,
  `positionYtdRealizedLtgl` decimal(22,7) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  UNIQUE KEY `IDXU_externalId` (`externalId`),
  KEY `FK_position_user_createdBy` (`createdBy`),
  KEY `FK_position_user_editedBy` (`editedBy`),
  KEY `FK_position_account_accountId` (`accountId`),
  KEY `FK_position_security_securityId` (`securityId`),
  CONSTRAINT `FK_position_security_securityId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_position_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `FK_position_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_position_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `preference` */

DROP TABLE IF EXISTS `preference`;

CREATE TABLE `preference` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `displayName` varchar(100) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `dataType` varchar(50) DEFAULT NULL,
  `defaultValue` varchar(255) DEFAULT NULL,
  `symbol` varchar(50) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `displayOrder` int(11) DEFAULT '0',
  `allowedRecordTypes` int(11) DEFAULT NULL,
  `requiresApproval` tinyint(1) DEFAULT '0',
  `waterMark` varchar(150) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` varchar(100) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_preference_preferenceCategory12` (`categoryId`),
  CONSTRAINT `FK_preference_preferenceCategory12` FOREIGN KEY (`categoryId`) REFERENCES `preferencecategory` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceCategory` */

DROP TABLE IF EXISTS `preferenceCategory`;

CREATE TABLE `preferenceCategory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `displayOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceComponent` */

DROP TABLE IF EXISTS `preferenceComponent`;

CREATE TABLE `preferenceComponent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceId` int(11) NOT NULL,
  `componentId` int(11) NOT NULL,
  `customComponent` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__preference1` (`preferenceId`),
  KEY `FK__component1` (`componentId`),
  CONSTRAINT `FK__component1` FOREIGN KEY (`componentId`) REFERENCES `component` (`id`) ON DELETE NO ACTION,
  CONSTRAINT `FK__preference1` FOREIGN KEY (`preferenceId`) REFERENCES `preference` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceDefaultValue` */

DROP TABLE IF EXISTS `preferenceDefaultValue`;

CREATE TABLE `preferenceDefaultValue` (
  `id` int(11) NOT NULL,
  `preferenceId` int(11) NOT NULL,
  `relatedType` varchar(50) NOT NULL,
  `relatedTypeId` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `optionId` int(11) DEFAULT NULL,
  `allowedRecordTypes` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` date NOT NULL,
  `editedBy` int(10) NOT NULL,
  KEY `FK_preferenceDefaultValue_user_createdBy` (`createdBy`),
  KEY `FK_preferenceDefaultValue_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_preferenceDefaultValue_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_preferenceDefaultValue_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceLevel` */

DROP TABLE IF EXISTS `preferenceLevel`;

CREATE TABLE `preferenceLevel` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `bitValue` int(11) NOT NULL,
  `shortName` varchar(45) DEFAULT NULL,
  `allowedRoleType` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceOption` */

DROP TABLE IF EXISTS `preferenceOption`;

CREATE TABLE `preferenceOption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceId` int(11) DEFAULT NULL,
  `optionName` varchar(500) DEFAULT NULL,
  `optionValue` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdDate` datetime DEFAULT NULL,
  `createdBy` varchar(100) DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `preferenceId` (`preferenceId`),
  CONSTRAINT `preferenceOption_ibfk_1` FOREIGN KEY (`preferenceId`) REFERENCES `preference` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceOptionValue` */

DROP TABLE IF EXISTS `preferenceOptionValue`;

CREATE TABLE `preferenceOptionValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceValueId` int(11) NOT NULL,
  `preferenceOptionId` int(11) NOT NULL,
  `prefOrder` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `preferenceValueKey` (`preferenceValueId`),
  KEY `prefernceOptionKey` (`preferenceOptionId`),
  CONSTRAINT `FK_preferenceOption_preferenceValue` FOREIGN KEY (`preferenceValueId`) REFERENCES `preferenceValue` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceTradeValue` */

DROP TABLE IF EXISTS `preferenceTradeValue`;

CREATE TABLE `preferenceTradeValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceId` int(11) NOT NULL DEFAULT '0',
  `preferenceType` varchar(100) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK__preference` (`preferenceId`),
  CONSTRAINT `FK__preference` FOREIGN KEY (`preferenceId`) REFERENCES `preference` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=latin1;

/*Table structure for table `preferenceValue` */

DROP TABLE IF EXISTS `preferenceValue`;

CREATE TABLE `preferenceValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceId` int(11) NOT NULL,
  `relatedType` varchar(50) NOT NULL,
  `relatedTypeId` int(11) NOT NULL,
  `value` varchar(255) DEFAULT 'NULL',
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `preferenceId` (`preferenceId`),
  KEY `FK_preferenceValue_user_createdBy` (`createdBy`),
  KEY `FK_preferenceValue_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_preferenceValue_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_preferenceValue_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=latin1;

/*Table structure for table `privilege` */

DROP TABLE IF EXISTS `privilege`;

CREATE TABLE `privilege` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` int(11) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_privilege_user_createdBy` (`createdBy`),
  KEY `FK_privilege_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_privilege_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_privilege_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;

/*Table structure for table `rawSecurityLevel` */

DROP TABLE IF EXISTS `rawSecurityLevel`;

CREATE TABLE `rawSecurityLevel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Pref` varchar(100) NOT NULL,
  `Level` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=latin1;

/*Table structure for table `rawSecuritySettings` */

DROP TABLE IF EXISTS `rawSecuritySettings`;

CREATE TABLE `rawSecuritySettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `allowedLevel` int(11) NOT NULL,
  `Type` varchar(100) NOT NULL,
  `component` varchar(100) NOT NULL,
  `group` varchar(100) NOT NULL,
  `allowedNameTemp` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=latin1;

/*Table structure for table `rawSecuritySettingsMain` */

DROP TABLE IF EXISTS `rawSecuritySettingsMain`;

CREATE TABLE `rawSecuritySettingsMain` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Pref` varchar(100) NOT NULL,
  `Level` varchar(100) NOT NULL,
  `Type` varchar(100) NOT NULL,
  `Control` varchar(100) NOT NULL,
  `Groupp` varchar(100) NOT NULL,
  `Grouping` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;

/*Table structure for table `realizedGainLoss` */

DROP TABLE IF EXISTS `realizedGainLoss`;

CREATE TABLE `realizedGainLoss` (
  `id` int(11) NOT NULL,
  `accountId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `grossProceeds` decimal(22,2) DEFAULT NULL,
  `netProceeds` decimal(22,2) DEFAULT NULL,
  `costAmount` decimal(22,2) DEFAULT NULL,
  `dateAcquired` datetime DEFAULT NULL,
  `sellDate` datetime DEFAULT NULL,
  `quantity` decimal(22,7) DEFAULT NULL,
  `longTerm` tinyint(1) DEFAULT NULL,
  `sellMethod` varchar(25) DEFAULT NULL,
  `totalGains` decimal(22,2) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_realizedGainLoss_user_createdBy` (`createdBy`),
  KEY `FK_realizedGainLoss_user_editedBy` (`editedBy`),
  KEY `FK_realizedGainLoss_account_accountId` (`accountId`),
  KEY `FK_realizedGainLoss_security_securityId` (`securityId`),
  CONSTRAINT `FK_realizedGainLoss_security_securityId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_realizedGainLoss_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `FK_realizedGainLoss_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_realizedGainLoss_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `roleTypeId` int(11) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `expireDate` date DEFAULT '2050-12-31',
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_role_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_role_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=811 DEFAULT CHARSET=utf8;

/*Table structure for table `rolePrivilege` */

DROP TABLE IF EXISTS `rolePrivilege`;

CREATE TABLE `rolePrivilege` (
  `roleId` int(11) NOT NULL,
  `privilegeId` int(11) NOT NULL,
  `canAdd` tinyint(1) NOT NULL,
  `canUpdate` tinyint(1) NOT NULL,
  `canDelete` tinyint(1) NOT NULL,
  `canRead` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  PRIMARY KEY (`roleId`,`privilegeId`),
  KEY `IDX_roleId` (`roleId`),
  KEY `IDX_privilegeId` (`privilegeId`),
  KEY `FK_rolePrivilege_user_editedBy` (`editedBy`),
  KEY `FK_rolePrivilege_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_rolePrivilege_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`),
  CONSTRAINT `FK_rolePrivilege_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_rolePrivilege_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `roleType` */

DROP TABLE IF EXISTS `roleType`;

CREATE TABLE `roleType` (
  `id` int(11) NOT NULL,
  `roleType` varchar(50) DEFAULT NULL,
  `bitValue` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `security` */

DROP TABLE IF EXISTS `security`;

CREATE TABLE `security` (
  `orionFirmId` int(11) DEFAULT NULL,
  `orionConnectExternalId` int(11) NOT NULL,
  `symbol` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `orionEclipseName` varchar(255) DEFAULT NULL,
  `custodialCash` tinyint(1) DEFAULT '0',
  `assetCategoryId` int(11) DEFAULT NULL,
  `assetClassId` int(11) DEFAULT NULL,
  `assetSubClassId` int(11) DEFAULT NULL,
  `securityTypeId` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '2',
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`orionConnectExternalId`),
  KEY `assetCategoryId` (`assetCategoryId`),
  KEY `FK_security_user_createdBy` (`createdBy`),
  KEY `FK_security_user_editedBy` (`editedBy`),
  KEY `securityTypeId` (`securityTypeId`),
  CONSTRAINT `FK_security_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_security_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `security_ibfk_1` FOREIGN KEY (`assetCategoryId`) REFERENCES `assetCategory` (`id`),
  CONSTRAINT `security_ibfk_2` FOREIGN KEY (`securityTypeId`) REFERENCES `securityType` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `securityEquivalenceInSecuritySet` */

DROP TABLE IF EXISTS `securityEquivalenceInSecuritySet`;

CREATE TABLE `securityEquivalenceInSecuritySet` (
  `securitySetId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `equivalentSecurityId` int(11) NOT NULL AUTO_INCREMENT,
  `taxableSecurityId` int(11) NOT NULL,
  `taxDeferredSecurityId` int(11) NOT NULL,
  `taxExemptSecurityId` int(11) NOT NULL,
  `minTradeAmount` decimal(10,0) DEFAULT NULL,
  `minInitialBuyDollar` decimal(10,0) DEFAULT NULL,
  `buyPriority` tinyint(1) DEFAULT NULL,
  `sellPriority` tinyint(1) DEFAULT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`securitySetId`,`securityId`,`equivalentSecurityId`),
  KEY `equivalentSecurityId` (`equivalentSecurityId`),
  KEY `FK_securityEQ_security_idx` (`securityId`),
  CONSTRAINT `FK_securityEQ_securitySet` FOREIGN KEY (`securitySetId`) REFERENCES `securitySet` (`Id`),
  CONSTRAINT `FK_securityEQ_security` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15728 DEFAULT CHARSET=latin1;

/*Table structure for table `securityPrice` */

DROP TABLE IF EXISTS `securityPrice`;

CREATE TABLE `securityPrice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securityId` int(11) DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `priceType` varchar(50) DEFAULT NULL,
  `priceDateTime` datetime DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createddate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editeddate` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `securityId` (`securityId`),
  KEY `FK_securityPrice_user_createdBy` (`createdBy`),
  KEY `FK_securityPrice_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_securityPrice_security_securityId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_securityPrice_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_securityPrice_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=349986 DEFAULT CHARSET=latin1;

/*Table structure for table `securitySet` */

DROP TABLE IF EXISTS `securitySet`;

CREATE TABLE `securitySet` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `isDynamic` tinyint(1) DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

/*Table structure for table `securitySetDetail` */

DROP TABLE IF EXISTS `securitySetDetail`;

CREATE TABLE `securitySetDetail` (
  `securitySetId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  `targetAllowPercentage` decimal(10,0) DEFAULT NULL,
  `lowerPercentage` decimal(10,0) DEFAULT NULL,
  `upperPercentage` decimal(10,0) DEFAULT NULL,
  `minTradeAmount` decimal(10,0) DEFAULT NULL,
  `minInitialBuyDollar` decimal(10,0) DEFAULT NULL,
  `buyPriority` tinyint(1) DEFAULT NULL,
  `sellPriority` tinyint(1) DEFAULT NULL,
  `taxableSecurityId` int(11) DEFAULT NULL,
  `taxDeferredSecurityId` int(11) DEFAULT NULL,
  `taxExemptSecurityId` int(11) DEFAULT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`securitySetId`,`securityId`),
  KEY `FK_securitySetDetail_security_idx` (`securityId`),
  CONSTRAINT `FK_securitySetDetail_securitySet` FOREIGN KEY (`securitySetId`) REFERENCES `securitySet` (`Id`),
  CONSTRAINT `FK_securitySetDetail_security` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `securitySettingPreferenceOptions` */

DROP TABLE IF EXISTS `securitySettingPreferenceOptions`;

CREATE TABLE `securitySettingPreferenceOptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securitySettingPreferenceId` int(11) NOT NULL,
  `value` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sspo_securitySettingPreferences_id` (`securitySettingPreferenceId`),
  CONSTRAINT `FK_sspo_securitySettingPreferences_id` FOREIGN KEY (`securitySettingPreferenceId`) REFERENCES `securitySettingPreferences` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

/*Table structure for table `securitySettingPreferenceValue` */

DROP TABLE IF EXISTS `securitySettingPreferenceValue`;

CREATE TABLE `securitySettingPreferenceValue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preferenceValueId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `securitySettingPreferenceId` int(11) NOT NULL,
  `securitySettingPreferenceOptionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sspv_preferenceValue_id` (`preferenceValueId`),
  KEY `FK_sspv_security_orionConnectExternalId` (`securityId`),
  KEY `FK_sspv_securitySettingPreferences_id` (`securitySettingPreferenceId`),
  KEY `FK_sspv_securitySettingPreferenceOptions_id` (`securitySettingPreferenceOptionId`),
  CONSTRAINT `FK_sspv_preferenceValue_id` FOREIGN KEY (`preferenceValueId`) REFERENCES `preferenceValue` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_sspv_security_orionConnectExternalId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_sspv_securitySettingPreferences_id` FOREIGN KEY (`securitySettingPreferenceId`) REFERENCES `securitySettingPreferences` (`id`),
  CONSTRAINT `FK_sspv_securitySettingPreferenceOptions_id` FOREIGN KEY (`securitySettingPreferenceOptionId`) REFERENCES `securitySettingPreferenceOptions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Table structure for table `securitySettingPreferences` */

DROP TABLE IF EXISTS `securitySettingPreferences`;

CREATE TABLE `securitySettingPreferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

/*Table structure for table `securityTLHInSecuritySet` */

DROP TABLE IF EXISTS `securityTLHInSecuritySet`;

CREATE TABLE `securityTLHInSecuritySet` (
  `securitySetId` int(11) NOT NULL,
  `securityId` int(11) NOT NULL,
  `tlhSecurityId` int(11) NOT NULL,
  `priority` int(11) DEFAULT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`securitySetId`,`securityId`,`tlhSecurityId`),
  KEY `FK_securityTLH_security_idx` (`securityId`),
  CONSTRAINT `FK_securityTLH_securitySet` FOREIGN KEY (`securitySetId`) REFERENCES `securitySet` (`Id`),
  CONSTRAINT `FK_securityTLH_security` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `securityType` */

DROP TABLE IF EXISTS `securityType`;

CREATE TABLE `securityType` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_securityType_user_createdBy` (`createdBy`),
  KEY `FK_securityType_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_securityType_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_securityType_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `taxLot_2016_06_10` */

DROP TABLE IF EXISTS `taxLot_2016_06_10`;

CREATE TABLE `taxLot_2016_06_10` (
  `id` int(10) NOT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `securityId` int(10) NOT NULL,
  `orionFirmId` int(10) DEFAULT NULL,
  `externalId` int(10) DEFAULT NULL,
  `dateAcquired` datetime DEFAULT NULL,
  `quantity` float(22,7) DEFAULT NULL,
  `costAmount` float(22,2) DEFAULT NULL,
  `costPerShare` float(22,7) DEFAULT NULL,
  `price` float(22,7) DEFAULT NULL,
  `marketValue` float(22,7) DEFAULT NULL,
  `priceDate` datetime DEFAULT NULL,
  `isDeleted` bit(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `taxlot` */

DROP TABLE IF EXISTS `taxlot`;

CREATE TABLE `taxlot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` int(11) DEFAULT NULL,
  `securityId` int(11) DEFAULT NULL,
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `dateAcquired` datetime DEFAULT NULL,
  `quantity` decimal(22,7) DEFAULT NULL,
  `costAmount` decimal(22,2) DEFAULT NULL,
  `costPerShare` decimal(22,7) DEFAULT NULL,
  `price` decimal(22,7) DEFAULT NULL,
  `marketValue` decimal(22,7) DEFAULT NULL,
  `priceDate` datetime DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_taxLot_user_createdBy` (`createdBy`),
  KEY `FK_taxLot_user_editedBy` (`editedBy`),
  KEY `FK_taxLot_account_accountId` (`accountId`),
  KEY `FK_taxLot_security_securityId` (`securityId`),
  CONSTRAINT `FK_taxLot_security_securityId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_taxLot_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `FK_taxLot_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_taxLot_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `team` */

DROP TABLE IF EXISTS `team`;

CREATE TABLE `team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `portfolioAccess` int(11) NOT NULL,
  `modelAccess` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_team_user_createdBy` (`createdBy`),
  KEY `FK_team_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_team_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_team_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=472 DEFAULT CHARSET=utf8;

/*Table structure for table `teamAdvisorAccess` */

DROP TABLE IF EXISTS `teamAdvisorAccess`;

CREATE TABLE `teamAdvisorAccess` (
  `teamId` int(11) NOT NULL,
  `advisorId` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`teamId`,`advisorId`),
  UNIQUE KEY `idx_name` (`teamId`,`advisorId`),
  KEY `FK_teamAdvisorAccess_user_createdBy` (`createdBy`),
  KEY `FK_teamAdvisorAccess_user_editedBy` (`editedBy`),
  KEY `FK_teamAdvisorAccess_team_teamId` (`teamId`),
  KEY `fk_teamAdvisorAccess_1_idx` (`advisorId`),
  CONSTRAINT `teamAdvisorAccess_ibfk_1` FOREIGN KEY (`advisorId`) REFERENCES `advisor` (`externalId`),
  CONSTRAINT `fk_teamAdvisorAccess_1` FOREIGN KEY (`advisorId`) REFERENCES `advisor` (`externalId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_teamAdvisorAccess_team_teamId` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`),
  CONSTRAINT `FK_teamAdvisorAccess_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_teamAdvisorAccess_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `teamModelAccess` */

DROP TABLE IF EXISTS `teamModelAccess`;

CREATE TABLE `teamModelAccess` (
  `teamId` int(11) NOT NULL,
  `modelId` int(11) NOT NULL,
  `access` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`teamId`,`modelId`),
  UNIQUE KEY `idx_name` (`teamId`,`modelId`),
  KEY `TeamId` (`teamId`),
  KEY `ModelId` (`modelId`),
  KEY `FK_teamModelAccess_user_createdBy` (`createdBy`),
  KEY `FK_teamModelAccess_user_editedBy` (`editedBy`),
  CONSTRAINT `teamModelAccess_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`),
  CONSTRAINT `fk_teamModelAccess_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_teamModelAccess_team_teamId` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`),
  CONSTRAINT `FK_teamModelAccess_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_teamModelAccess_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `teamPortfolioAccess` */

DROP TABLE IF EXISTS `teamPortfolioAccess`;

CREATE TABLE `teamPortfolioAccess` (
  `teamId` int(11) NOT NULL,
  `portfolioId` int(11) NOT NULL,
  `access` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  `isPrimary` tinyint(1) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`teamId`,`portfolioId`),
  UNIQUE KEY `idx_name` (`teamId`,`portfolioId`),
  KEY `TeamId` (`teamId`),
  KEY `portfolioId` (`portfolioId`),
  KEY `FK_teamPortfolioAccess_user_createdBy` (`createdBy`),
  KEY `FK_teamPortfolioAccess_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_teamPortfolioAccess_portfolio_portfolioId` FOREIGN KEY (`portfolioId`) REFERENCES `portfolio` (`id`),
  CONSTRAINT `FK_teamPortfolioAccess_team_teamId` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`),
  CONSTRAINT `FK_teamPortfolioAccess_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_teamPortfolioAccess_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `tradeExecutionType` */

DROP TABLE IF EXISTS `tradeExecutionType`;

CREATE TABLE `tradeExecutionType` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tradeExecutionType_user_createdBy` (`createdBy`),
  KEY `FK_tradeExecutionType_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_tradeExecutionType_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_tradeExecutionType_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `transaction` */

DROP TABLE IF EXISTS `transaction`;

CREATE TABLE `transaction` (
  `accountId` int(11) DEFAULT NULL,
  `securityId` int(11) DEFAULT NULL,
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `tradeDate` datetime DEFAULT NULL,
  `quantity` decimal(22,7) DEFAULT NULL,
  `amount` decimal(22,7) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `tradeCost` decimal(22,2) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  KEY `FK_transaction_user_createdBy` (`createdBy`),
  KEY `FK_transaction_user_editedBy` (`editedBy`),
  KEY `FK_transaction_account_accountId` (`accountId`),
  KEY `FK_transaction_security_securityId` (`securityId`),
  CONSTRAINT `FK_transaction_security_securityId` FOREIGN KEY (`securityId`) REFERENCES `security` (`orionConnectExternalId`),
  CONSTRAINT `FK_transaction_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
  CONSTRAINT `FK_transaction_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_transaction_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `transaction_2016_06_10` */

DROP TABLE IF EXISTS `transaction_2016_06_10`;

CREATE TABLE `transaction_2016_06_10` (
  `id` int(10) NOT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `securityId` int(10) DEFAULT NULL,
  `orionFirmId` int(10) DEFAULT NULL,
  `externalId` int(10) DEFAULT NULL,
  `tradeDate` datetime DEFAULT NULL,
  `quantity` float(22,7) DEFAULT NULL,
  `amount` float(22,7) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `tradeCost` float(22,2) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `isDeleted` bit(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `userId` int(11) NOT NULL DEFAULT '0',
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `roleId` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) DEFAULT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `expireDate` date DEFAULT '2050-12-31',
  `userLoginId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  KEY `IDX_roleId` (`roleId`),
  KEY `FK_user_user_createdBy` (`createdBy`),
  KEY `FK_user_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_user_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `userGridView` */

DROP TABLE IF EXISTS `userGridView`;

CREATE TABLE `userGridView` (
  `id` int(11) NOT NULL,
  `viewName` varchar(45) DEFAULT NULL,
  `viewTypeId` int(11) DEFAULT NULL,
  `isCurrent` bit(1) DEFAULT NULL,
  `isPublic` bit(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `userGridViewDetails` */

DROP TABLE IF EXISTS `userGridViewDetails`;

CREATE TABLE `userGridViewDetails` (
  `userViewId` int(11) NOT NULL,
  `guiColumnName` varchar(1000) DEFAULT NULL,
  `dbTableName` varchar(500) DEFAULT NULL,
  `dbColumnName` varchar(500) DEFAULT NULL,
  `inSelectClause` bit(1) DEFAULT NULL,
  `whereClause` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`userViewId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `userGridViewType` */

DROP TABLE IF EXISTS `userGridViewType`;

CREATE TABLE `userGridViewType` (
  `id` int(11) NOT NULL,
  `typeName` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `userTeam` */

DROP TABLE IF EXISTS `userTeam`;

CREATE TABLE `userTeam` (
  `userId` int(11) NOT NULL,
  `teamId` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  `isPrimary` bit(1) DEFAULT NULL,
  PRIMARY KEY (`userId`,`teamId`),
  UNIQUE KEY `idx_name` (`userId`,`teamId`),
  KEY `userId` (`userId`),
  KEY `teamId` (`teamId`),
  KEY `FK_userTeam_user_createdBy` (`createdBy`),
  KEY `FK_userTeam_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_userTeam_team_teamId` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`),
  CONSTRAINT `FK_userTeam_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_userTeam_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_userTeam_user_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/* Trigger structure for table `custodian` */

DELIMITER $$

/*!50003 DROP TRIGGER*//*!50032 IF EXISTS */ /*!50003 `trg_checkTradeExecutionTypeId` */$$

/*!50003 CREATE */ /*!50017 DEFINER = 'oEA'@'%' */ /*!50003 TRIGGER `trg_checkTradeExecutionTypeId` BEFORE INSERT ON `custodian` FOR EACH ROW begin
    if new.tradeExecutionTypeId NOT IN (SELECT id FROM tradeExecutionType) AND new.tradeExecutionTypeId <> -1 then
    SIGNAL SQLSTATE '45000';
    end if;
    end */$$


DELIMITER ;

/* Trigger structure for table `custodian` */

DELIMITER $$

/*!50003 DROP TRIGGER*//*!50032 IF EXISTS */ /*!50003 `trgBU_checkTradeExecutionTypeId` */$$

/*!50003 CREATE */ /*!50017 DEFINER = 'oEA'@'%' */ /*!50003 TRIGGER `trgBU_checkTradeExecutionTypeId` BEFORE UPDATE ON `custodian` FOR EACH ROW begin
    if new.tradeExecutionTypeId NOT IN (SELECT id FROM tradeExecutionType) AND new.tradeExecutionTypeId <> -1 then
    SIGNAL SQLSTATE '45000';
    end if;
    end */$$


DELIMITER ;

/* Function  structure for function  `getSecuritySymbol` */

/*!50003 DROP FUNCTION IF EXISTS `getSecuritySymbol` */;
DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` FUNCTION `getSecuritySymbol`(Security_id INT) RETURNS varchar(50) CHARSET latin1
BEGIN
DECLARE SYMBOL_FOUND VARCHAR(50) ;
 SELECT symbol INTO SYMBOL_FOUND FROM security WHERE orionConnectExternalId = Security_id;
  RETURN SYMBOL_FOUND ;
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummary` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummary` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getDashboardSummary`(var_user_id INT)
BEGIN
CALL getDashboardSummaryUsers(var_user_id);
CALL getDashboardSummaryTeams(var_user_id);
CALL getDashboardSummaryRoles(var_user_id);
call getDashboardSummaryCustodians (var_user_id);
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummaryCustodians` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummaryCustodians` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getDashboardSummaryCustodians`(var_user_id INT)
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryCustodians (1)
##----- SP to fetch Dashboard Summary for Custodians for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Custodians for a firm-----#
DECLARE var_roleType VARCHAR(20);
SELECT rt.roleType INTO var_roleType
FROM `user` ur
INNER JOIN `role` r ON ur.roleId = r.id
INNER JOIN roleType rt ON r.roleType = rt.id
WHERE ur.userId = var_user_id;
IF (var_roleType = 'FIRM ADMIN') THEN
SELECT totalCustodians,
       IFNULL(activeCustodians,0) as activeCustodians
FROM
  (SELECT COUNT(DISTINCT c.externalId) AS totalCustodians,
     (SELECT COUNT(DISTINCT c.externalId)  FROM `custodian` c INNER JOIN `account` a ON a.custodianId = c.externalId WHERE a.isDeleted =0 AND c.isDeleted = 0 ) AS activeCustodians
   FROM `custodian` c WHERE  c.isDeleted = 0  )a ;
ELSEIF (var_roleType = 'TEAM ADMIN') THEN
SELECT totalCustodians,
       IFNULL(activeCustodians,0) as activeCustodians
FROM
  (SELECT COUNT(1) AS totalCustodians,
     (SELECT COUNT(DISTINCT custodians)  FROM 
(SELECT DISTINCT c.externalId AS custodians FROM `userTeam` ut INNER JOIN team t ON ut.teamId = t.id  INNER JOIN `teamPortfolioAccess` tpa ON t.id = tpa.teamId  INNER JOIN  account a ON tpa.portfolioId = a.portfolioId INNER JOIN custodian c ON a.custodianId = c.externalId WHERE ut.userId =var_user_id AND   t.isDeleted =0 AND tpa.isDeleted =0  AND a.isDeleted =0 AND c.isDeleted =0
UNION 
SELECT DISTINCT c.externalId AS custodians FROM `userTeam` ut INNER JOIN team t ON ut.teamId = t.id  INNER JOIN `teamAdvisorAccess` taa ON t.id = taa.teamId  INNER JOIN  account a ON taa.advisorId = a.advisorId INNER JOIN custodian c ON a.custodianId = c.externalId WHERE ut.userId =var_user_id AND   t.isDeleted =0 AND taa.isDeleted =0  AND a.isDeleted =0 AND c.isDeleted =0
) t1 ) AS activeCustodians
   FROM custodian
   WHERE isDeleted = 0 ) a;
   
   ELSE
   select 0 as totalCustodians, 0 as 
       activeCustodians ;
END IF;
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummaryRoles` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummaryRoles` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getDashboardSummaryRoles`(var_user_id INT)
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryRoles (1)
##----- SP to fetch Dashboard Summary for Roles for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Roles for a firm-----#
DECLARE var_roleType VARCHAR(20);
SELECT rt.roleType INTO var_roleType FROM `user` ur INNER JOIN role r ON ur.roleId = r.id INNER JOIN roleType rt ON r.roleTypeId = rt.id WHERE ur.userId = var_user_id;
IF (var_roleType = 'FIRM ADMIN')
THEN
SELECT  totalRoles ,(totalRoles - IFNULL(existingRoles,0)) AS newRoles , IFNULL(existingRoles,0) as existingRoles  FROM 
(
SELECT COUNT(DISTINCT id )   AS totalRoles  ,
(SELECT COUNT(DISTINCT id )  FROM role r WHERE  r.createdDate < NOW() - INTERVAL 30 DAY AND r.isDeleted =0 ) AS  existingRoles  
FROM role WHERE isDeleted = 0
)a;
ELSEIF (var_roleType = 'TEAM ADMIN') 
THEN
SELECT  totalRoles ,(totalRoles - IFNULL(existingRoles,0)) AS newRoles , IFNULL(existingRoles,0) as existingRoles    FROM 
(
SELECT COUNT(DISTINCT roleId )   AS totalRoles  ,
(SELECT COUNT(DISTINCT r.id )  FROM `user` ur INNER JOIN role r ON ur.roleId = r.id WHERE ur.userId = var_user_id AND  r.createdDate < NOW() - INTERVAL 30 DAY AND r.isDeleted =0 ) AS  existingRoles 
FROM `user` WHERE userId = var_user_id AND  isDeleted = 0
)a;
ELSE
SELECT  0 AS totalRoles ,0 AS newRoles , 0 AS existingRoles ;
END IF;
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummaryTeams` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummaryTeams` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getDashboardSummaryTeams`(var_user_id INT)
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryTeams (1)
##----- SP to fetch Dashboard Summary for Teams for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Teams for a firm-----#
DECLARE var_roleType VARCHAR(20);
SELECT rt.roleType INTO var_roleType FROM `user` ur INNER JOIN role r ON ur.roleId = r.id INNER JOIN roleType rt ON r.roleTypeId = rt.id WHERE ur.userId = var_user_id;
IF (var_roleType = 'FIRM ADMIN')
THEN
SELECT  totalTeams , IFNULL(existingTeams,0) as existingTeams , ( totalTeams - IFNULL(existingTeams,0) ) AS newTeams   FROM
(
SELECT COUNT(DISTINCT id)   AS totalTeams , 
( SELECT COUNT(DISTINCT t.id) FROM  team t   WHERE  t.isDeleted = 0 AND t.createdDate < NOW() - INTERVAL 30 DAY AND t.status = 1
  ) AS existingTeams
FROM `team` WHERE isDeleted = 0
)a;
ELSEIF (var_roleType = 'TEAM ADMIN') THEN
SELECT  totalTeams , IFNULL(existingTeams,0) as existingTeams , ( totalTeams - IFNULL(existingTeams,0) ) AS newTeams   FROM
(
SELECT COUNT(DISTINCT teamId)  AS totalTeams , 
( SELECT COUNT(DISTINCT t.id) FROM `userTeam` ut INNER JOIN team t ON ut.teamId = t.id  WHERE ut.userId = var_user_id AND t.isDeleted = 0 AND 
t.createdDate < NOW() - INTERVAL 30 DAY AND t.status = 1 
  ) AS existingTeams 
FROM `userTeam` WHERE userId = var_user_id AND  isDeleted = 0
)a;
ELSE 
SELECT  0 as totalTeams , 0 as existingTeams , 0 AS newTeams ;
END IF;
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummaryUsers` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummaryUsers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getDashboardSummaryUsers`(var_user_id INT)
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryUsers (1)
##----- SP to fetch Dashboard Summary for Users for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Users for a firm-----#
DECLARE var_roleType VARCHAR(20);
SELECT rt.roleType INTO var_roleType FROM `user` ur INNER JOIN role r ON ur.roleId = r.id INNER JOIN roleType rt ON r.roleTypeId = rt.id WHERE ur.userId = var_user_id;
IF (var_roleType = 'FIRM ADMIN')
THEN
SELECT totalUsers , (totalUsers - IFNULL(existingUsers,0)) AS newUsers , IFNULL(existingUsers,0) as  existingUsers   FROM  
(
SELECT COUNT(1) AS totalUsers     , 
(SELECT COUNT(1)  FROM `user` WHERE createdDate < NOW() - INTERVAL 30 DAY AND isDeleted =0 ) AS existingUsers
FROM `user` WHERE isDeleted = 0 )a ;
ELSEIF (var_roleType = 'TEAM ADMIN')
THEN
SELECT totalUsers , (totalUsers - IFNULL(existingUsers,0)) AS newUsers , IFNULL(existingUsers,0) as  existingUsers    FROM
(
SELECT COUNT(DISTINCT userId) AS totalUsers    , 
(SELECT COUNT(DISTINCT u.userId) FROM `user` u INNER JOIN userTeam ut ON u.userId  = ut.userId  WHERE u.isDeleted = 0 AND u.createdDate < NOW() - INTERVAL 30 DAY AND ut.teamId IN  (SELECT teamId FROM userTeam  WHERE userid = var_user_id AND isDeleted = 0)
 ) AS existingUsers
FROM userTeam WHERE  isDeleted = 0 AND teamId IN  (SELECT teamId FROM userTeam WHERE userid = var_user_id)  )a ;
ELSE
SELECT 0 as totalUsers , 0 AS newUsers , 0 as existingUsers  ;
END IF;
END */$$
DELIMITER ;

/* Procedure structure for procedure `getPreferenceValue` */

/*!50003 DROP PROCEDURE IF EXISTS  `getPreferenceValue` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getPreferenceValue`(varUserId INT , varLevelName VARCHAR(30), varFirmId INT , varRecordTypeID INT)
BEGIN 
##-- Author: Ashutosh Verma ##-- Created ON: 17th August,2016
                                                                                                                                                           ##-- CALL getPreferenceValue (1,'account',999,1) 
																																						   ##----- SP TO FETCH preference value FOR a recordType -----##
## -----  user_id , level name , firmId , levelId will be passed as a parameter.
##-----SQL query TO FETCH preference value FOR a recordType-----#
 DECLARE varRecordType INT ; 
 DECLARE varModelName VARCHAR(100);
 DECLARE varPortfolioId INT;
 DECLARE varCustodianId INT;
 DECLARE varTeamName VARCHAR(100); 
 DECLARE varCustodianName VARCHAR(100); 
 DECLARE varPortfolioName VARCHAR(100); 
 DECLARE varModelId INT; 
 DECLARE varTeamId INT;
SELECT bitValue INTO varRecordType
FROM preferenceLevel
WHERE NAME = varLevelName; 
IF(varRecordType IN(4, 2,16)) THEN
  SELECT preferenceId,
         VALUE,
         inheritedVALUE,
         CASE
             WHEN inheritedVALUE IS NULL THEN FALSE
             ELSE TRUE
         END AS isInherited,
         CASE
             WHEN inheritedVALUE IS NULL THEN NULL
             ELSE 'firm'
         END AS inheritedFrom,
         CASE
             WHEN inheritedVALUE IS NULL THEN NULL
             ELSE ''
         END AS inheritedFromName,
         CASE
             WHEN inheritedVALUE IS NULL THEN NULL
             ELSE varFirmId
         END AS inheritedFromId,
         `name`,
         categoryType,
         displayOrder,
         dataType,
         symbol,
         OPTIONS,
         selectedOptions,
         inheritedSelectedOptions
  FROM
    (SELECT DISTINCT p7.id AS preferenceId,
                     t1.VALUE AS VALUE,
       (SELECT VALUE
        FROM `preferenceValue` p6
        WHERE `relatedType`=1
          AND `relatedTypeId` =varFirmId
          AND p6.preferenceId = p7.id) AS inheritedVALUE,
                     p7.`name` AS NAME,
                     pc.name AS categoryType,
                     pc.displayOrder AS displayOrder,
                     p7.dataType AS dataType,
                     p7.symbol AS symbol,
                     CASE
                         WHEN p7.dataType = 'OptionList' THEN
                                (SELECT GROUP_CONCAT(po.id, ":", po.optionName)
                                 FROM preferenceOption po
                                 WHERE po.preferenceId = p7.id )
                         ELSE NULL
                     END AS OPTIONS,
                     CASE
                         WHEN p7.dataType = 'OptionList' THEN
                                (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                 FROM preferenceOptionValue pov
                                 INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                 WHERE pv.preferenceId = p7.id
                                   AND pv.relatedType =varRecordType
                                   AND pv.relatedTypeId =varRecordTypeID)
                         ELSE NULL
                     END AS selectedOptions,
                     CASE
                         WHEN p7.dataType = 'OptionList' THEN
                                (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                 FROM preferenceOptionValue pov
                                 INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                 WHERE pv.preferenceId = p7.id
                                   AND pv.relatedType =1
                                   AND pv.relatedTypeId =varFirmId)
                         ELSE NULL
                     END AS inheritedSelectedOptions
     FROM preference p7
     INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id
     LEFT OUTER JOIN
       (SELECT preferenceId,
               CASE
                   WHEN EXISTS
                          (SELECT VALUE
                           FROM `preferenceValue` p8
                           WHERE `relatedType`=varRecordType
                             AND `relatedTypeId` =varRecordTypeID
                             AND p8.`preferenceId`=p1.preferenceid) THEN VALUE
                   ELSE NULL
               END AS VALUE
        FROM `preferenceValue` p1
        WHERE `relatedType`=varRecordType
          AND `relatedTypeId` =varRecordTypeID
          AND `preferenceId` IN
            (SELECT id
             FROM preference
             WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t1 ON p7.id = t1.preferenceId
     WHERE p7.id IN
         (SELECT id
          FROM preference
          WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t2; ELSEIF (varRecordType = 1) THEN
  SELECT DISTINCT p7.id AS preferenceId,
                  t1.VALUE AS VALUE,
                  NULL AS inheritedVALUE,
                  p7.`name` AS NAME,
                  pc.name AS categoryType,
                  pc.displayOrder AS displayOrder,
                  p7.dataType AS dataType,
                  p7.symbol AS symbol,
                  CASE
                      WHEN p7.dataType = 'OptionList' THEN
                             (SELECT GROUP_CONCAT(po.id, ":", po.optionName)
                              FROM preferenceOption po
                              WHERE po.preferenceId = p7.id )
                      ELSE NULL
                  END AS OPTIONS,
                  CASE
                      WHEN p7.dataType = 'OptionList' THEN
                             (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                              FROM preferenceOptionValue pov
                              INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                              WHERE pv.preferenceId = p7.id
                                AND pv.relatedType =varRecordType
                                AND pv.relatedTypeId =varRecordTypeID)
                      ELSE NULL
                  END AS selectedOptions,
                  NULL AS inheritedSelectedOptions,
                  FALSE AS isInherited,
                           NULL AS inheritedFrom,
                           NULL AS inheritedFromName,
                           NULL AS inheritedFromId
  FROM preference p7
  INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id
  LEFT OUTER JOIN
    (SELECT preferenceId,
            CASE
                WHEN EXISTS
                       (SELECT VALUE
                        FROM `preferenceValue` p8
                        WHERE `relatedType`=varRecordType
                          AND `relatedTypeId` =varRecordTypeID
                          AND p8.`preferenceId`=p1.preferenceid) THEN VALUE
                ELSE NULL
            END AS VALUE
     FROM `preferenceValue` p1
     WHERE `relatedType`=varRecordType
       AND `relatedTypeId` =varRecordTypeID
       AND `preferenceId` IN
         (SELECT id
          FROM preference
          WHERE (allowedRecordTypes & varRecordType) = varRecordType )) t1 ON p7.id = t1.preferenceId WHERE p7.id IN
    (SELECT id
     FROM preference
     WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ; /* -------------- for portfolio level --------*/ ELSEIF (varRecordType = 8) THEN
  SELECT modelId INTO varModelId
  FROM portfolio WHERE id = varRecordTypeID;
  SELECT NAME INTO varModelName
  FROM model WHERE id = varModelId;
  SELECT NAME INTO varTeamName
  FROM team WHERE id = varTeamId;
  SELECT teamId INTO varTeamId
  FROM teamPortfolioAccess WHERE isPrimary =1
  AND portfolioId = varRecordTypeID;
  SELECT preferenceId,
         VALUE,
         inheritedValue,
         t3.name,
         t3.categoryType,
         t3.displayOrder,
         t3.dataType,
         t3.symbol,
         t3.options,
         t3.selectedOptions,
         CASE
             WHEN t3.dataType = 'OptionList'
                  OR t3.dataType = 'List' THEN CASE
                                                   WHEN inheritedFrom = 16 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =16
                                                             AND pv.relatedTypeId =varModelId)
                                                   WHEN inheritedFrom = 4 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =4
                                                             AND pv.relatedTypeId =varTeamId)
                                                   WHEN inheritedFrom = 1 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =1
                                                             AND pv.relatedTypeId =varFirmId)
                                                   ELSE NULL
                                               END
             ELSE NULL
         END AS inheritedSelectedOptions,
         CASE
             WHEN inheritedValue IS NULL THEN FALSE
             ELSE TRUE
         END AS isInherited,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 16 THEN 'Model'
                      WHEN inheritedFrom = 4 THEN 'Team'
                      WHEN inheritedFrom = 1 THEN 'Firm'
                  END
         END AS inheritedFrom,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 16 THEN varModelName
                      WHEN inheritedFrom = 4 THEN varTeamName
                      WHEN inheritedFrom = 1 THEN ''
                  END
         END AS inheritedFromName,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 16 THEN varModelId
                      WHEN inheritedFrom = 4 THEN varTeamId
                      WHEN inheritedFrom = 1 THEN varFirmId
                  END
         END AS inheritedFromId
  FROM preference p10
  INNER JOIN
    (SELECT DISTINCT p9.id AS preferenceId,
                     VALUE,
                     IF(a =1 ,
                          (SELECT VALUE
                           FROM `preferenceValue` p6
                           WHERE `relatedType`=16
                             AND `relatedTypeId` =varModelId
                             AND p6.preferenceId = p9.id) ,IF(EXISTS
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=4
                                                                   AND `relatedTypeId` =varTeamId
                                                                   AND p6.preferenceId = p9.id) =1,
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=4
                                                                   AND `relatedTypeId` =varTeamId
                                                                   AND p6.preferenceId = p9.id),
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=1
                                                                   AND `relatedTypeId` =varFirmId
                                                                   AND p6.preferenceId = p9.id))) AS inheritedValue,
                     IF(a =1 ,
                          (SELECT relatedType
                           FROM `preferenceValue` p6
                           WHERE `relatedType`=16
                             AND `relatedTypeId` =varModelId
                             AND p6.preferenceId = p9.id) ,IF(EXISTS
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=4
                                                                   AND `relatedTypeId` =varTeamId
                                                                   AND p6.preferenceId = p9.id) =1,
                                                                (SELECT relatedType
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=4
                                                                   AND `relatedTypeId` =varTeamId
                                                                   AND p6.preferenceId = p9.id),
                                                                (SELECT relatedType
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=1
                                                                   AND `relatedTypeId` =varFirmId
                                                                   AND p6.preferenceId = p9.id))) AS inheritedFrom,
                     t2.`name` AS NAME,
                     t2.categoryType AS categoryType,
                     t2.displayOrder AS displayOrder,
                     t2.dataType AS dataType,
                     t2.symbol AS symbol,
                     t2.OPTIONS AS OPTIONS,
                     t2.selectedOptions AS selectedOptions
     FROM preference p9
     INNER JOIN
       (SELECT DISTINCT p7.id AS preferenceId,
                        t1.VALUE AS VALUE,
          (SELECT COUNT(1)
           FROM `preferenceValue` p6
           WHERE `relatedType`=16
             AND `relatedTypeId` =varModelId
             AND p6.preferenceId = p7.id) AS a,
                        p7.`name` AS NAME,
                        pc.name AS categoryType,
                        pc.displayOrder AS displayOrder,
                        p7.dataType AS dataType,
                        p7.symbol AS symbol,
                        CASE
                            WHEN p7.dataType = 'OptionList'
                                 OR p7.dataType = 'List' THEN
                                   (SELECT GROUP_CONCAT(po.id, ":", po.optionName)
                                    FROM preferenceOption po
                                    WHERE po.preferenceId = p7.id )
                            ELSE NULL
                        END AS OPTIONS,
                        CASE
                            WHEN p7.dataType = 'OptionList'
                                 OR p7.dataType = 'List' THEN
                                   (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                    FROM preferenceOptionValue pov
                                    INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                    WHERE pv.preferenceId = p7.id
                                      AND pv.relatedType =varRecordType
                                      AND pv.relatedTypeId =varRecordTypeID)
                            ELSE NULL
                        END AS selectedOptions
        FROM preference p7
        INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id
        LEFT OUTER JOIN
          (SELECT preferenceId,
                  CASE
                      WHEN EXISTS
                             (SELECT VALUE
                              FROM `preferenceValue` p8
                              WHERE `relatedType`=varRecordType
                                AND `relatedTypeId` =varRecordTypeID
                                AND p8.`preferenceId`=p1.preferenceid) THEN VALUE
                      ELSE NULL
                  END AS VALUE
           FROM `preferenceValue` p1
           WHERE `relatedType`=varRecordType
             AND `relatedTypeId` =varRecordTypeID
             AND `preferenceId` IN
               (SELECT id
                FROM preference
                WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t1 ON p7.id = t1.preferenceId
        WHERE p7.id IN
            (SELECT id
             FROM preference
             WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t2 ON p9.id =t2.preferenceId
     WHERE p9.id IN
         (SELECT id
          FROM preference
          WHERE (allowedRecordTypes & varRecordType) = varRecordType )) t3 ON p10.id = t3.preferenceId WHERE p10.id IN
    (SELECT id
     FROM preference
     WHERE (allowedRecordTypes & varRecordType) = varRecordType ); /* -------------- for account level --------*/ ELSEIF (varRecordType = 32) THEN
  SELECT portfolioId,
         custodianId INTO varPortfolioId,
                          varCustodianId
  FROM account WHERE orionConnectExternalId = varRecordTypeID;
  SELECT modelId INTO varModelId
  FROM portfolio WHERE id = varPortfolioId;
  SELECT teamId INTO varTeamId
  FROM teamPortfolioAccess WHERE isPrimary =1
  AND portfolioId = varPortfolioId;
  SELECT NAME INTO varModelName
  FROM model WHERE id = varModelId;
  SELECT NAME INTO varTeamName
  FROM team WHERE id = varTeamId;
  SELECT NAME INTO varPortfolioName
  FROM portfolio WHERE id = varPortfolioId;
  SELECT NAME INTO varCustodianName
  FROM custodian WHERE externalId = varCustodianId;
  SELECT preferenceId,
         VALUE,
         inheritedValue,
         t3.name,
         t3.categoryType,
         t3.displayOrder,
         t3.dataType,
         t3.symbol,
         t3.options,
         t3.selectedOptions,
         CASE
             WHEN t3.dataType = 'OptionList'
                  OR t3.dataType = 'List' THEN CASE
                                                   WHEN inheritedFrom = 8 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =8
                                                             AND pv.relatedTypeId =varPortfolioId)
                                                   WHEN inheritedFrom = 16 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =16
                                                             AND pv.relatedTypeId =varModelId)
                                                   WHEN inheritedFrom = 4 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =4
                                                             AND pv.relatedTypeId =varTeamId)
                                                   WHEN inheritedFrom = 2 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =2
                                                             AND pv.relatedTypeId =varCustodianId)
                                                   WHEN inheritedFrom = 1 THEN
                                                          (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                                           FROM preferenceOptionValue pov
                                                           INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                                           WHERE pv.preferenceId = p10.id
                                                             AND pv.relatedType =1
                                                             AND pv.relatedTypeId =varFirmId)
                                                   ELSE NULL
                                               END
             ELSE NULL
         END AS inheritedSelectedOptions,
         CASE
             WHEN inheritedValue IS NULL THEN FALSE
             ELSE TRUE
         END AS isInherited,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 8 THEN 'Portfolio'
                      WHEN inheritedFrom = 16 THEN 'Model'
                      WHEN inheritedFrom = 4 THEN 'Team'
                      WHEN inheritedFrom = 2 THEN 'Custodian'
                      WHEN inheritedFrom = 1 THEN 'Firm'
                  END
         END AS inheritedFrom,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 8 THEN varPortfolioName
                      WHEN inheritedFrom = 16 THEN varModelName
                      WHEN inheritedFrom = 4 THEN varTeamName
                      WHEN inheritedFrom = 2 THEN varCustodianName
                      WHEN inheritedFrom = 1 THEN ''
                  END
         END AS inheritedFromName,
         CASE
             WHEN inheritedValue IS NULL THEN NULL
             ELSE CASE
                      WHEN inheritedFrom = 8 THEN varPortfolioId
                      WHEN inheritedFrom = 16 THEN varModelId
                      WHEN inheritedFrom = 4 THEN varTeamId
                      WHEN inheritedFrom = 2 THEN varCustodianId
                      WHEN inheritedFrom = 1 THEN varFirmId
                  END
         END AS inheritedFromId
  FROM preference p10
  INNER JOIN
    (SELECT DISTINCT p9.id AS preferenceId,
                     VALUE,
                     IF(a =1 ,
                          (SELECT VALUE
                           FROM `preferenceValue` p6
                           WHERE `relatedType`=8
                             AND `relatedTypeId` = varPortfolioId
                             AND p6.preferenceId = p9.id) ,IF(EXISTS
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=16
                                                                   AND `relatedTypeId` =varModelId
                                                                   AND p6.preferenceId = p9.id) =1,
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=16
                                                                   AND `relatedTypeId` =varModelId
                                                                   AND p6.preferenceId = p9.id),IF(EXISTS
                                                                                                     (SELECT VALUE
                                                                                                      FROM `preferenceValue` p6
                                                                                                      WHERE `relatedType`=4
                                                                                                        AND `relatedTypeId` =varTeamId
                                                                                                        AND p6.preferenceId = p9.id) =1 ,
                                                                                                     (SELECT VALUE
                                                                                                      FROM `preferenceValue` p6
                                                                                                      WHERE `relatedType`=4
                                                                                                        AND `relatedTypeId` =varTeamId
                                                                                                        AND p6.preferenceId = p9.id), IF(EXISTS
                                                                                                                                           (SELECT VALUE
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=2
                                                                                                                                              AND `relatedTypeId` =varCustodianId
                                                                                                                                              AND p6.preferenceId = p9.id) =1,
                                                                                                                                           (SELECT VALUE
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=2
                                                                                                                                              AND `relatedTypeId` =varCustodianId
                                                                                                                                              AND p6.preferenceId = p9.id),
                                                                                                                                           (SELECT VALUE
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=1
                                                                                                                                              AND `relatedTypeId` =varFirmId
                                                                                                                                              AND p6.preferenceId = p9.id))))) AS inheritedValue,
                     IF(a =1 ,
                          (SELECT relatedType
                           FROM `preferenceValue` p6
                           WHERE `relatedType`=8
                             AND `relatedTypeId` = varPortfolioId
                             AND p6.preferenceId = p9.id) ,IF(EXISTS
                                                                (SELECT VALUE
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=16
                                                                   AND `relatedTypeId` =varModelId
                                                                   AND p6.preferenceId = p9.id) =1,
                                                                (SELECT relatedType
                                                                 FROM `preferenceValue` p6
                                                                 WHERE `relatedType`=16
                                                                   AND `relatedTypeId` =varModelId
                                                                   AND p6.preferenceId = p9.id),IF(EXISTS
                                                                                                     (SELECT VALUE
                                                                                                      FROM `preferenceValue` p6
                                                                                                      WHERE `relatedType`=4
                                                                                                        AND `relatedTypeId` =varTeamId
                                                                                                        AND p6.preferenceId = p9.id) =1 ,
                                                                                                     (SELECT relatedType
                                                                                                      FROM `preferenceValue` p6
                                                                                                      WHERE `relatedType`=4
                                                                                                        AND `relatedTypeId` =varTeamId
                                                                                                        AND p6.preferenceId = p9.id), IF(EXISTS
                                                                                                                                           (SELECT VALUE
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=2
                                                                                                                                              AND `relatedTypeId` =varCustodianId
                                                                                                                                              AND p6.preferenceId = p9.id) =1,
                                                                                                                                           (SELECT relatedType
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=2
                                                                                                                                              AND `relatedTypeId` =varCustodianId
                                                                                                                                              AND p6.preferenceId = p9.id),
                                                                                                                                           (SELECT relatedType
                                                                                                                                            FROM `preferenceValue` p6
                                                                                                                                            WHERE `relatedType`=1
                                                                                                                                              AND `relatedTypeId` =varFirmId
                                                                                                                                              AND p6.preferenceId = p9.id))))) AS inheritedFrom,
                     t2.`name` AS NAME,
                     t2.categoryType AS categoryType,
                     t2.displayOrder AS displayOrder,
                     t2.dataType AS dataType,
                     t2.symbol AS symbol,
                     t2.OPTIONS AS OPTIONS,
                     t2.selectedOptions AS selectedOptions
     FROM preference p9
     INNER JOIN
       (SELECT DISTINCT p7.id AS preferenceId,
                        t1.VALUE AS VALUE,
          (SELECT COUNT(1)
           FROM `preferenceValue` p6
           WHERE `relatedType`= 8
             AND `relatedTypeId` =varPortfolioId
             AND p6.preferenceId = p7.id) AS a,
                        p7.`name` AS NAME,
                        pc.name AS categoryType,
                        pc.displayOrder AS displayOrder,
                        p7.dataType AS dataType,
                        p7.symbol AS symbol,
                        CASE
                            WHEN p7.dataType = 'OptionList'
                                 OR p7.dataType = 'List' THEN
                                   (SELECT GROUP_CONCAT(po.id, ":", po.optionName)
                                    FROM preferenceOption po
                                    WHERE po.preferenceId = p7.id )
                            ELSE NULL
                        END AS OPTIONS,
                        CASE
                            WHEN p7.dataType = 'OptionList'
                                 OR p7.dataType = 'List' THEN
                                   (SELECT GROUP_CONCAT(pov.preferenceOptionId,":", pov.prefOrder)
                                    FROM preferenceOptionValue pov
                                    INNER JOIN preferenceValue pv ON pv.id = pov.preferenceValueId
                                    WHERE pv.preferenceId = p7.id
                                      AND pv.relatedType =varRecordType
                                      AND pv.relatedTypeId =varRecordTypeID)
                            ELSE NULL
                        END AS selectedOptions
        FROM preference p7
        INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id
        LEFT OUTER JOIN
          (SELECT preferenceId,
                  CASE
                      WHEN EXISTS
                             (SELECT VALUE
                              FROM `preferenceValue` p8
                              WHERE `relatedType`=varRecordType
                                AND `relatedTypeId` =varRecordTypeID
                                AND p8.`preferenceId`=p1.preferenceid) THEN VALUE
                      ELSE NULL
                  END AS VALUE
           FROM `preferenceValue` p1
           WHERE `relatedType`=varRecordType
             AND `relatedTypeId` =varRecordTypeID
             AND `preferenceId` IN
               (SELECT id
                FROM preference
                WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t1 ON p7.id = t1.preferenceId
        WHERE p7.id IN
            (SELECT id
             FROM preference
             WHERE (allowedRecordTypes & varRecordType) = varRecordType ) ) t2 ON p9.id =t2.preferenceId
     WHERE p9.id IN
         (SELECT id
          FROM preference
          WHERE (allowedRecordTypes & varRecordType) = varRecordType )) t3 ON p10.id = t3.preferenceId WHERE p10.id IN
    (SELECT id
     FROM preference
     WHERE (allowedRecordTypes & varRecordType) = varRecordType );
	 END IF; 
	 END */$$
DELIMITER ;

/* Procedure structure for procedure `getPreferenceValuetest` */

/*!50003 DROP PROCEDURE IF EXISTS  `getPreferenceValuetest` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getPreferenceValuetest`(varUserId INT , varLevelName VARCHAR(30) , varFirmId INT , varRecordTypeID INT )
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryCustodians (1)
##----- SP to fetch Dashboard Summary for Custodians for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Custodians for a firm-----#
DECLARE varRecordType INT ;
SELECT bitValue INTO varRecordType FROM preferenceLevel WHERE NAME = varLevelName;
IF( varRecordType in(4, 2,16))
then 
SELECT preferenceId , VALUE ,inheritedVALUE , CASE WHEN inheritedVALUE IS NULL THEN FALSE ELSE TRUE END AS isInherited , CASE WHEN inheritedVALUE IS NULL THEN NULL ELSE 'firm' END AS inheritedFrom , CASE WHEN inheritedVALUE IS NULL THEN NULL ELSE '' END AS inheritedFromName , CASE WHEN inheritedVALUE IS NULL THEN NULL ELSE varFirmId END AS inheritedFromId , `name` , categoryType , displayOrder , dataType , symbol , OPTIONS , selectedOptions , inheritedSelectedOptions FROM 
(
SELECT DISTINCT p7.id AS preferenceId , t1.VALUE AS VALUE ,  (SELECT VALUE  FROM `preferenceValue` p6 WHERE `relatedType`=1 AND  `relatedTypeId` =varFirmId AND p6.preferenceId = p7.id)  AS inheritedVALUE ,  p7.`name` as name , pc.name AS categoryType ,pc.displayOrder as displayOrder, p7.dataType as dataType, p7.symbol  as symbol, CASE WHEN p7.dataType = 'OptionList'  THEN ( SELECT GROUP_CONCAT(po.id , ":" , po.optionName) FROM preferenceOption po WHERE po.preferenceId = p7.id ) ELSE NULL END AS OPTIONS ,  
CASE WHEN p7.dataType = 'OptionList' THEN ( SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p7.id AND pv.relatedType =varRecordType AND  pv.relatedTypeId =varRecordTypeID)  ELSE NULL END AS selectedOptions , CASE WHEN p7.dataType = 'OptionList' THEN ( SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p7.id AND pv.relatedType =1 AND  pv.relatedTypeId =varFirmId)  ELSE NULL END AS inheritedSelectedOptions 
         
         FROM preference p7 INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id LEFT OUTER JOIN  
(
SELECT preferenceId, CASE
         WHEN EXISTS (SELECT VALUE FROM `preferenceValue` p8 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  p8.`preferenceId`=p1.preferenceid)
           THEN VALUE  
         ELSE NULL
       END   AS VALUE   FROM `preferenceValue` p1 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  `preferenceId` IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType  ) ) t1   ON p7.id = t1.preferenceId WHERE  p7.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType ) ) t2;
	   
	   
	   
	 ELSEIF ( varRecordType = 1)
THEN 
SELECT DISTINCT p7.id AS preferenceId , t1.VALUE AS VALUE ,  NULL  AS inheritedVALUE ,  p7.`name` as name , pc.name AS categoryType ,pc.displayOrder as displayOrder, p7.dataType as dataType, p7.symbol  as symbol, CASE WHEN p7.dataType = 'OptionList'  THEN ( SELECT GROUP_CONCAT(po.id , ":" , po.optionName) FROM preferenceOption po WHERE po.preferenceId = p7.id ) ELSE NULL END AS OPTIONS ,  
CASE WHEN p7.dataType = 'OptionList' THEN ( SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p7.id AND pv.relatedType =varRecordType AND  pv.relatedTypeId =varRecordTypeID)  ELSE NULL END AS selectedOptions ,  NULL  AS inheritedSelectedOptions ,False AS isInherited , NULL AS inheritedFrom , NULL AS inheritedFromName , NULL AS inheritedFromId 
         
         FROM preference p7 INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id LEFT OUTER JOIN  
(
SELECT preferenceId, CASE
         WHEN EXISTS (SELECT VALUE FROM `preferenceValue` p8 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  p8.`preferenceId`=p1.preferenceid)
           THEN VALUE  
         ELSE NULL
       END   AS VALUE   FROM `preferenceValue` p1 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  `preferenceId` IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType  )) t1   ON p7.id = t1.preferenceId WHERE  p7.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType ) ;
END IF; 
	   END */$$
DELIMITER ;

/* Procedure structure for procedure `getPreferenceValuetest2` */

/*!50003 DROP PROCEDURE IF EXISTS  `getPreferenceValuetest2` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getPreferenceValuetest2`(varUserId INT , varLevelName VARCHAR(30) , varFirmId INT , varRecordTypeID INT )
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryCustodians (1)
##----- SP to fetch Dashboard Summary for Custodians for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Custodians for a firm-----#
DECLARE varRecordType INT ;
DECLARE varModelName varchar(100);
DECLARE varTeamName varchar(100);
DECLARE varModelId INT;
DECLARE varTeamId INT;
SELECT modelId INTO varModelId  FROM portfolio WHERE id = varRecordTypeID;
select name into varModelName from model where id = varModelId;
select name into varTeamName from team where id = varTeamId;
SELECT bitValue INTO varRecordType FROM preferenceLevel WHERE NAME = varLevelName;
SELECT teamId INTO varTeamId FROM teamPortfolioAccess WHERE isPrimary =1 AND portfolioId = varRecordTypeID;
select preferenceId , VALUE , inheritedValue  , t3.name , t3.categoryType , t3.displayOrder , t3.dataType , t3.symbol  , t3.options , t3.selectedOptions  , case when t3.dataType = 'OptionList' OR t3.dataType = 'List' THEN case when inheritedFrom = 16 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =16 AND  pv.relatedTypeId =varModelId)  
when inheritedFrom = 4 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =4 AND  pv.relatedTypeId =varTeamId)  
when inheritedFrom = 1 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =1 AND  pv.relatedTypeId =varFirmId)  
else NULL
END
else NULL
END  as inheritedSelectedOptions   ,    CASE WHEN inheritedValue IS NULL THEN FALSE ELSE TRUE END AS isInherited , CASE WHEN inheritedValue IS NULL THEN NULL ELSE case when inheritedFrom = 16 then 'Model' 
when inheritedFrom = 4 then 'Team'
when inheritedFrom = 1 then 'Firm'
END
END AS inheritedFrom , CASE WHEN inheritedValue IS NULL THEN NULL ELSE 
case when inheritedFrom = 16 then varModelName 
when inheritedFrom = 4 then varTeamName 
when inheritedFrom = 1 then ''
END
 END AS inheritedFromName , CASE WHEN inheritedValue IS NULL THEN NULL ELSE 
 
 case when inheritedFrom = 16 then  varModelId
when inheritedFrom = 4 then varTeamId
when inheritedFrom = 1 then varFirmId
END
END AS inheritedFromId 
from preference p10 inner join 
(
SELECT DISTINCT p9.id AS preferenceId  , VALUE , IF(a =1 ,(SELECT  VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id) ,IF( EXISTS(SELECT VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id) =1,(SELECT  VALUE    FROM  `preferenceValue` p6  WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id),(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=1 AND  `relatedTypeId` =varFirmId AND p6.preferenceId = p9.id) )) AS inheritedValue  ,IF(a =1 ,(SELECT relatedType   FROM `preferenceValue` p6 WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id) ,IF( EXISTS(SELECT VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id) =1,(SELECT relatedType   FROM   `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id),(SELECT relatedType   FROM `preferenceValue` p6 WHERE `relatedType`=1 AND  `relatedTypeId` =varFirmId AND p6.preferenceId = p9.id) )) AS inheritedFrom, t2.`name` as name  , t2.categoryType as categoryType , t2.displayOrder as displayOrder, t2.dataType as dataType, t2.symbol as symbol , t2.OPTIONS  as options, t2.selectedOptions as selectedOptions  FROM 
preference p9 INNER JOIN 
(
SELECT DISTINCT p7.id AS preferenceId , t1.VALUE AS VALUE ,  (SELECT COUNT(1)  FROM `preferenceValue` p6 WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p7.id)  AS a ,  p7.`name` AS NAME , pc.name AS categoryType ,pc.displayOrder AS displayOrder, p7.dataType AS dataType, p7.symbol  AS symbol, CASE WHEN p7.dataType = 'OptionList' OR p7.dataType = 'List' THEN ( SELECT GROUP_CONCAT(po.id , ":" , po.optionName) FROM preferenceOption po WHERE po.preferenceId = p7.id ) ELSE NULL END AS OPTIONS ,  
CASE WHEN p7.dataType = 'OptionList' OR p7.dataType = 'List' THEN ( SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p7.id AND pv.relatedType =varRecordType AND  pv.relatedTypeId =varRecordTypeID)  ELSE NULL END AS selectedOptions 
         
         FROM preference p7 INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id LEFT OUTER JOIN  
(
SELECT preferenceId, CASE
         WHEN EXISTS (SELECT VALUE FROM `preferenceValue` p8 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  p8.`preferenceId`=p1.preferenceid)
           THEN VALUE  
         ELSE NULL
       END   AS VALUE   FROM `preferenceValue` p1 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  `preferenceId` IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType  ) ) t1   ON p7.id = t1.preferenceId WHERE  p7.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType ) ) t2 ON p9.id =t2.preferenceId WHERE  p9.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType )) t3 on p10.id = t3.preferenceId WHERE  p10.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType );
	   
	   
	   END */$$
DELIMITER ;

/* Procedure structure for procedure `getPreferenceValuetest3` */

/*!50003 DROP PROCEDURE IF EXISTS  `getPreferenceValuetest3` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getPreferenceValuetest3`(varUserId INT , varLevelName VARCHAR(30) , varFirmId INT , varRecordTypeID INT )
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 3rd August,2016
##-- call getDashboardSummaryCustodians (1)
##----- SP to fetch Dashboard Summary for Custodians for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Custodians for a firm-----#
DECLARE varRecordType INT ;
DECLARE varModelName varchar(100);
Declare varPortfolioId INT;
Declare varCustodianId INT;
DECLARE varTeamName varchar(100);
DECLARE varCustodianName varchar(100);
DECLARE varPortfolioName varchar(100);
DECLARE varModelId INT;
DECLARE varTeamId INT;
SELECT bitValue INTO varRecordType FROM preferenceLevel WHERE NAME = varLevelName;
select portfolioId,custodianId into varPortfolioId , varCustodianId from account where orionConnectExternalId = varRecordTypeID;
SELECT modelId INTO varModelId  FROM portfolio WHERE id = varPortfolioId;
SELECT teamId INTO varTeamId FROM teamPortfolioAccess WHERE isPrimary =1 AND portfolioId = varPortfolioId;
select name into varModelName from model where id = varModelId;
select name into varTeamName from team where id = varTeamId;
select name into varPortfolioName from portfolio where id = varPortfolioId;
select name into varCustodianName from custodian where externalId = varCustodianId;
select preferenceId , VALUE , inheritedValue  , t3.name , t3.categoryType , t3.displayOrder , t3.dataType , t3.symbol  , t3.options , t3.selectedOptions  , case when t3.dataType = 'OptionList' OR t3.dataType = 'List' THEN case 
when inheritedFrom = 8 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =8 AND  pv.relatedTypeId =varPortfolioId) 
when inheritedFrom = 16 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =16 AND  pv.relatedTypeId =varModelId)  
when inheritedFrom = 4 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =4 AND  pv.relatedTypeId =varTeamId) 
when inheritedFrom = 2 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =2 AND  pv.relatedTypeId =varCustodianId) 
when inheritedFrom = 1 then (SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p10.id AND pv.relatedType =1 AND  pv.relatedTypeId =varFirmId)  
else NULL
END
else NULL
END  as inheritedSelectedOptions   ,    CASE WHEN inheritedValue IS NULL THEN FALSE ELSE TRUE END AS isInherited , CASE WHEN inheritedValue IS NULL THEN NULL ELSE case 
when inheritedFrom = 8 then 'Portfolio' 
when inheritedFrom = 16 then 'Model' 
when inheritedFrom = 4 then 'Team'
when inheritedFrom = 2 then 'Custodian'
when inheritedFrom = 1 then 'Firm'
END
END AS inheritedFrom , CASE WHEN inheritedValue IS NULL THEN NULL ELSE 
case 
when inheritedFrom = 8 then varPortfolioName 
when inheritedFrom = 16 then varModelName 
when inheritedFrom = 4 then varTeamName 
when inheritedFrom = 2 then varCustodianName 
when inheritedFrom = 1 then ''
END
 END AS inheritedFromName , CASE WHEN inheritedValue IS NULL THEN NULL ELSE 
 
 case
 when inheritedFrom = 8 then  varPortfolioId
 when inheritedFrom = 16 then  varModelId
 when inheritedFrom = 4 then varTeamId
 when inheritedFrom = 2 then  varCustodianId
 when inheritedFrom = 1 then varFirmId
END
END AS inheritedFromId 
from preference p10 inner join 
(
SELECT DISTINCT p9.id AS preferenceId  , VALUE , IF(a =1 ,(SELECT  VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=8 AND  `relatedTypeId` = varPortfolioId AND p6.preferenceId = p9.id) ,IF( EXISTS(SELECT VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id) =1,(SELECT  VALUE    FROM  `preferenceValue` p6  WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id),IF(EXISTS(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id) =1 ,(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id), IF(EXISTS(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=2 AND  `relatedTypeId` =varCustodianId AND p6.preferenceId = p9.id) =1,(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=2 AND  `relatedTypeId` =varCustodianId AND p6.preferenceId = p9.id),(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=1 AND  `relatedTypeId` =varFirmId AND p6.preferenceId = p9.id))))) AS inheritedValue ,IF(a =1 ,(SELECT  relatedType   FROM `preferenceValue` p6 WHERE `relatedType`=8 AND  `relatedTypeId` = varPortfolioId AND p6.preferenceId = p9.id) ,IF( EXISTS(SELECT VALUE   FROM `preferenceValue` p6 WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id) =1,(SELECT  relatedType    FROM  `preferenceValue` p6  WHERE `relatedType`=16 AND  `relatedTypeId` =varModelId AND p6.preferenceId = p9.id),IF(EXISTS(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id) =1 ,(SELECT  relatedType    FROM `preferenceValue` p6 WHERE `relatedType`=4 AND  `relatedTypeId` =varTeamId AND p6.preferenceId = p9.id), IF(EXISTS(SELECT  VALUE    FROM `preferenceValue` p6 WHERE `relatedType`=2 AND  `relatedTypeId` =varCustodianId AND p6.preferenceId = p9.id) =1,(SELECT  relatedType    FROM `preferenceValue` p6 WHERE `relatedType`=2 AND  `relatedTypeId` =varCustodianId AND p6.preferenceId = p9.id),(SELECT  relatedType    FROM `preferenceValue` p6 WHERE `relatedType`=1 AND  `relatedTypeId` =varFirmId AND p6.preferenceId = p9.id))))) AS inheritedFrom
, t2.`name` as name  , t2.categoryType as categoryType , t2.displayOrder as displayOrder, t2.dataType as dataType, t2.symbol as symbol , t2.OPTIONS  as options, t2.selectedOptions as selectedOptions  FROM 
preference p9 INNER JOIN 
(
SELECT DISTINCT p7.id AS preferenceId , t1.VALUE AS VALUE ,  (SELECT COUNT(1)  FROM `preferenceValue` p6 WHERE `relatedType`= 8 AND  `relatedTypeId` =varPortfolioId AND p6.preferenceId = p7.id)  AS a ,  p7.`name` AS NAME , pc.name AS categoryType ,pc.displayOrder AS displayOrder, p7.dataType AS dataType, p7.symbol  AS symbol, CASE WHEN p7.dataType = 'OptionList' OR p7.dataType = 'List' THEN ( SELECT GROUP_CONCAT(po.id , ":" , po.optionName) FROM preferenceOption po WHERE po.preferenceId = p7.id ) ELSE NULL END AS OPTIONS ,  
CASE WHEN p7.dataType = 'OptionList' OR p7.dataType = 'List' THEN ( SELECT GROUP_CONCAT(pov.preferenceOptionId ,":", pov.prefOrder) FROM preferenceOptionValue pov INNER JOIN  preferenceValue pv ON  pv.id = pov.preferenceValueId WHERE pv.preferenceId = p7.id AND pv.relatedType =varRecordType AND  pv.relatedTypeId =varRecordTypeID)  ELSE NULL END AS selectedOptions 
         
         FROM preference p7 INNER JOIN preferenceCategory pc ON p7.categoryId = pc.id LEFT OUTER JOIN  
(
SELECT preferenceId, CASE
         WHEN EXISTS (SELECT VALUE FROM `preferenceValue` p8 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  p8.`preferenceId`=p1.preferenceid)
           THEN VALUE  
         ELSE NULL
       END   AS VALUE   FROM `preferenceValue` p1 WHERE `relatedType`=varRecordType AND  `relatedTypeId` =varRecordTypeID AND  `preferenceId` IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType  ) ) t1   ON p7.id = t1.preferenceId WHERE  p7.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType ) ) t2 ON p9.id =t2.preferenceId WHERE  p9.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType )) t3 on p10.id = t3.preferenceId WHERE  p10.id IN (SELECT id FROM preference WHERE (allowedRecordTypes & varRecordType ) = varRecordType );
	   
	   
	   END */$$
DELIMITER ;

/* Procedure structure for procedure `getSecurityPreferenceValuetest` */

/*!50003 DROP PROCEDURE IF EXISTS  `getSecurityPreferenceValuetest` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `getSecurityPreferenceValuetest`(varUserId INT , varPreferenceValueId INT , varFirmId INT )
BEGIN
##-- Author: Ashutosh Verma
##----- SP to fetch Dashboard Summary for Custodians for a firm -----##
## -----  user_id will be passed as a parameter.
##-----Sql query to fetch Dashboard Summary for Custodians for a firm-----#
Declare varPreferenceId INT ;
Declare varRelatedType INT ;
Declare varRelatedTypeId INT ;
select preferenceId , relatedType , relatedTypeId into varPreferenceId ,varRelatedType ,varRelatedTypeId from preferenceValue where id = varPreferenceValueId;
select sspv.securityId , sspv.securitySettingPreferenceId , ssp.group , ssp.name as securitySettingPreferenceName ,sspv.securitySettingPreferenceOptionId , sspo.value , s.symbol , s.name as securityName, st.name as securityType , NULL as inheritedValue from securitySettingPreferenceValue sspv inner join securitySettingPreferences ssp on sspv.securitySettingPreferenceId = ssp.id inner join securitySettingPreferenceOptions sspo on sspv.securitySettingPreferenceOptionId = sspo.id inner join security s on sspv.securityId = s.orionConnectExternalId inner join securityType st on s.securityTypeId = st.id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `updateUserStatus` */

/*!50003 DROP PROCEDURE IF EXISTS  `updateUserStatus` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEA`@`%` PROCEDURE `updateUserStatus`(varTeamId INT)
BEGIN
##-- Author: Ashutosh Verma
##-- Created On: 12 August,2016
##-- call updateUserStatus (1)
##----- SP to update status of user -----##
## -----  teamId will be passed as a parameter.
##-----Sql query to to update status of user -----#
UPDATE `user` SET STATUS = 0 WHERE isDeleted = 0 AND userId IN ( 
SELECT userId FROM 
(
SELECT ut.userId , COUNT(t.id) AS teamCount ,
(SELECT COUNT(t1.id) FROM team t1 
INNER JOIN userTeam ut1 ON ut1.teamId = t1.id AND t1.status = 0 
WHERE ut1.userID = ut.userId ) AS statusCount 
FROM userTeam ut 
INNER JOIN team t ON t.id = ut.teamID 
WHERE ut.userId IN ((SELECT userId FROM userTeam WHERE teamId = varTeamId  and isDeleted = 0)) 
GROUP BY ut.userId ) tab1 WHERE tab1.teamCount = tab1.statusCount
);
END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
