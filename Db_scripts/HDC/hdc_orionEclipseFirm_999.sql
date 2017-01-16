/*
SQLyog Community v11.25 (64 bit)
MySQL - 5.6.10 : Database - hdc_orionEclipseFirm_999
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`hdc_orionEclipseFirm_999` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `hdc_orionEclipseFirm_999`;

/*Table structure for table `account` */

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `orionConnectExternalId` int(11) NOT NULL,
  `orionConnectFirmId` int(11) DEFAULT NULL,
  `accountId` varchar(100) DEFAULT NULL,
  `accountNumber` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `name` varchar(500) CHARACTER SET latin1 DEFAULT NULL,
  `portfolioId` int(11) DEFAULT NULL,
  `householdId` int(11) DEFAULT NULL,
  `ytdRealizedStgl` decimal(10,0) DEFAULT NULL,
  `sweepSymbol` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `custodianId` int(11) DEFAULT NULL,
  `custodialAccountNumber` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `sleeveType` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `householdName` varchar(500) CHARACTER SET latin1 DEFAULT NULL,
  `accountTypeId` int(11) DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `advisorId` int(11) DEFAULT NULL,
  `sweepSecurityId` int(11) DEFAULT NULL,
  `systematicAmount` varchar(255) DEFAULT NULL,
  `systematicDate` datetime DEFAULT NULL,
  `sma` tinyint(1) DEFAULT NULL,
  `sleeveTarget` decimal(5,2) DEFAULT NULL,
  `sleeveContributionPercent` decimal(5,2) DEFAULT NULL,
  `sleeveDistributionPercent` decimal(5,2) DEFAULT NULL,
  `sleeveToleranceLower` decimal(5,2) DEFAULT NULL,
  `sleeveToleranceUpper` decimal(5,2) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  `disabled` tinyint(1) DEFAULT NULL,
  `disabledReason` varchar(255) DEFAULT NULL,
  `smaTradeable` varchar(255) DEFAULT NULL,
  `ytdRealizedLtgl` decimal(10,0) DEFAULT NULL,
  `billingAccount` varchar(255) DEFAULT NULL,
  `ssn` varchar(225) DEFAULT NULL,
  PRIMARY KEY (`orionConnectExternalId`),
  UNIQUE KEY `UNIQUE` (`orionConnectExternalId`),
  KEY `accountTypeId` (`accountTypeId`),
  KEY `custodianId` (`custodianId`),
  KEY `FK_account_user_createdBy` (`createdBy`),
  KEY `portfolioId` (`portfolioId`),
  KEY `FK_account_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_account_portfolio_portfolioId` FOREIGN KEY (`portfolioId`) REFERENCES `portfolio` (`id`),
  CONSTRAINT `FK_account_accountType` FOREIGN KEY (`accountTypeId`) REFERENCES `accountType` (`id`),
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
  KEY `FK_accountExtension_account_accountId` (`accountId`),
  KEY `FK_accountExtension_user_createdBy` (`createdBy`),
  KEY `FK_accountExtension_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_accountExtension_portfolio_portfolioId` FOREIGN KEY (`portfolioId`) REFERENCES `dev_orionEclipseFirm_999`.`portfolio` (`id`),
  CONSTRAINT `FK_accountExtension_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `dev_orionEclipseFirm_999`.`user` (`userId`),
  CONSTRAINT `FK_accountExtension_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `dev_orionEclipseFirm_999`.`account` (`orionConnectExternalId`),
  CONSTRAINT `FK_accountExtension_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `dev_orionEclipseFirm_999`.`user` (`userId`)
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
  KEY `FK_accountSMAAllocation_account_accountId` (`accountId`),
  KEY `FK_accountSMAAllocation_user_createdBy` (`createdBy`),
  KEY `FK_accountSMAAllocation_user_editedBy` (`editedBy`),
  CONSTRAINT `accountSMAAllocation_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `dev_orionEclipseFirm_999`.`model` (`id`),
  CONSTRAINT `FK_accountSMAAllocation_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`),
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
  KEY `FK_accountType_user_editedBy` (`editedBy`),
  KEY `FK_accountType_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_accountType_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_accountType_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

/*Table structure for table `advisor` */

DROP TABLE IF EXISTS `advisor`;

CREATE TABLE `advisor` (
  `orionFirmId` int(11) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `advisorNumber` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
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
  `color` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `createdBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_assetCategory_user_editedBy` (`editedBy`),
  KEY `FK_assetCategory_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_assetCategory_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetCategory_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=latin1;

/*Table structure for table `assetClass` */

DROP TABLE IF EXISTS `assetClass`;

CREATE TABLE `assetClass` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `assetCategoryId` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `createdBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_AssetCategoryId` (`assetCategoryId`),
  KEY `FK_assetClass_user_createdBy` (`createdBy`),
  KEY `FK_assetClass_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_assetClass_assetCategory` FOREIGN KEY (`assetCategoryId`) REFERENCES `assetCategory` (`id`),
  CONSTRAINT `FK_assetClass_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetClass_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=415 DEFAULT CHARSET=latin1;

/*Table structure for table `assetSubClass` */

DROP TABLE IF EXISTS `assetSubClass`;

CREATE TABLE `assetSubClass` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assetClassId` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  `createdBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `AssetClassId` (`assetClassId`),
  KEY `FK_assetSubClass_user_createdBy` (`createdBy`),
  KEY `FK_assetSubClass_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_assetSubClass_assetClass` FOREIGN KEY (`assetClassId`) REFERENCES `assetClass` (`id`),
  CONSTRAINT `FK_assetSubClass_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_assetSubClass_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2458 DEFAULT CHARSET=latin1;

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
  CONSTRAINT `FK_communityStrategistModel_communityStrategistPreference_id` FOREIGN KEY (`communityStrategistPreferenceId`) REFERENCES `communitystrategistpreferencevalue` (`id`),
  CONSTRAINT `FK_communityStrategistModel_model_id` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

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
  CONSTRAINT `FK_communityPreference_preferenceValue_id` FOREIGN KEY (`preferenceValueId`) REFERENCES `preferencevalue` (`id`),
  CONSTRAINT `FK_communityPreference_modelAccessLevel_id` FOREIGN KEY (`modelAccessLevel`) REFERENCES `modelaccesslevel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Table structure for table `component` */

DROP TABLE IF EXISTS `component`;

CREATE TABLE `component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

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
  KEY `FK_custodian_user_editedBy` (`editedBy`),
  KEY `FK_custodian_user_createdBy` (`createdBy`),
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
  UNIQUE KEY `PRIMARY1` (`securityId`,`custodianId`)
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
  CONSTRAINT `FK_custodianTETForSecurity_securityType_securityTypeId` FOREIGN KEY (`securityTypeId`) REFERENCES `securityType` (`id`),
  CONSTRAINT `FK_custodianTETForSecurity_tET_custodianId` FOREIGN KEY (`custodianId`) REFERENCES `custodian` (`externalId`),
  CONSTRAINT `FK_custodianTETForSecurity_tET_tradeExecutionTypeId` FOREIGN KEY (`tradeExecutionTypeId`) REFERENCES `tradeExecutionType` (`id`),
  CONSTRAINT `FK_custodianTETForSecurity_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_custodianTETForSecurity_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
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
  CONSTRAINT `FK_gridView_user` FOREIGN KEY (`ownerUserId`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_gridView_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_gridView_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
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
  KEY `IDX_ownerUserId` (`ownerUserId`),
  KEY `IDX_createdBy` (`createdBy`),
  KEY `IDX_editedBy` (`editedBy`),
  CONSTRAINT `FK_model_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_model_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_model_user_ownerUserId` FOREIGN KEY (`ownerUserId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

/*Table structure for table `modelElements` */

DROP TABLE IF EXISTS `modelElements`;

CREATE TABLE `modelElements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `targetPercent` decimal(5,2) NOT NULL,
  `toleranceLowerPercent` decimal(5,2) NOT NULL,
  `toleranceUpperPercent` decimal(5,2) NOT NULL,
  `tolerancePercentBand` decimal(5,2) DEFAULT NULL,
  `toleranceLower$` decimal(10,0) DEFAULT NULL,
  `toleranceUpper$` decimal(10,0) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

/*Table structure for table `portfolio` */

DROP TABLE IF EXISTS `portfolio`;

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `modelId` int(11) NOT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `disabled` tinyint(1) NOT NULL,
  `disabledReason` varchar(500) DEFAULT NULL,
  `sleevePortfolio` tinyint(1) NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_portfolio_user_createdBy` (`createdBy`),
  KEY `IDX_modelIDX_modelIdId` (`modelId`),
  KEY `FK_portfolio_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_portfolio_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_portfolio_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `portfolio_OLD` */

DROP TABLE IF EXISTS `portfolio_OLD`;

CREATE TABLE `portfolio_OLD` (
  `id` int(50) NOT NULL,
  `orionConnectFirmId` int(10) DEFAULT NULL,
  `orionConnectExternalId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `modelId` int(11) DEFAULT NULL,
  `searchTags` varchar(100) DEFAULT NULL,
  `externalId` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` varchar(255) DEFAULT NULL,
  `updatedDate` datetime DEFAULT NULL,
  `updatedBy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  `positionYtdRealizedLtgl` decimal(22,7) NOT NULL,
  UNIQUE KEY `IDXU_externalId` (`externalId`),
  KEY `FK_position_user_editedBy` (`editedBy`),
  KEY `FK_position_security_securityId` (`securityId`),
  KEY `FK_position_user_createdBy` (`createdBy`),
  KEY `FK_position_account_accountId` (`accountId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `preference` */

DROP TABLE IF EXISTS `preference`;

CREATE TABLE `preference` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `allowedRecordTypes` int(11) DEFAULT NULL,
  `dataType` varchar(50) DEFAULT NULL,
  `defaultValue` varchar(255) DEFAULT NULL,
  `requiresApproval` tinyint(1) DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `symbol` varchar(50) DEFAULT NULL,
  `displayOrder` int(11) DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` varchar(100) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_preference_preferenceCategory` (`categoryId`),
  CONSTRAINT `FK_preference_preferenceCategory` FOREIGN KEY (`categoryId`) REFERENCES `preferenceCategory` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=latin1;

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
  `optionName` varchar(100) DEFAULT NULL,
  `optionValue` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` varchar(100) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `preferenceId` (`preferenceId`),
  CONSTRAINT `preferenceOption_ibfk_1` FOREIGN KEY (`preferenceId`) REFERENCES `preference` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=latin1;

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
  CONSTRAINT `FK_privilege_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `dev_orionEclipseFirm_999`.`user` (`userId`),
  CONSTRAINT `FK_privilege_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `dev_orionEclipseFirm_999`.`user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=latin1;

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
  KEY `FK_realizedGainLoss_account_accountId` (`accountId`),
  KEY `FK_realizedGainLoss_user_editedBy` (`editedBy`),
  KEY `FK_realizedGainLoss_security_securityId` (`securityId`),
  KEY `FK_realizedGainLoss_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_realizedGainLoss_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_realizedGainLoss_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_realizedGainLoss_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  `roleTypeId` int(11) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `expireDate` date DEFAULT '2050-12-31',
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_role_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_role_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=731 DEFAULT CHARSET=utf8;

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
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(10) NOT NULL,
  PRIMARY KEY (`roleId`,`privilegeId`),
  KEY `IDX_privilegeId` (`privilegeId`),
  KEY `FK_rolePrivilege_user_createdBy` (`createdBy`),
  KEY `FK_rolePrivilege_user_editedBy` (`editedBy`),
  KEY `IDX_roleId` (`roleId`),
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
  `custodialCash` tinyint(1) DEFAULT '0',
  `status` tinyint(1) DEFAULT '2',
  `assetCategoryId` int(11) DEFAULT NULL,
  `assetClassId` int(11) DEFAULT NULL,
  `assetSubClassId` int(11) DEFAULT NULL,
  `securityTypeId` int(11) DEFAULT NULL,
  `createdDate` datetime DEFAULT NULL,
  `createdBy` int(10) NOT NULL,
  `editedDate` datetime DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `editedBy` int(10) NOT NULL,
  KEY `assetCategoryId` (`assetCategoryId`),
  KEY `FK_security_user_editedBy` (`editedBy`),
  KEY `FK_security_user_createdBy` (`createdBy`),
  KEY `assetClassId` (`assetClassId`),
  KEY `assetSubClassId` (`assetSubClassId`),
  CONSTRAINT `FK_security_assetCategory` FOREIGN KEY (`assetCategoryId`) REFERENCES `assetCategory` (`id`),
  CONSTRAINT `FK_security_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_security_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `security_ibfk_1` FOREIGN KEY (`assetClassId`) REFERENCES `assetClass` (`id`),
  CONSTRAINT `security_ibfk_2` FOREIGN KEY (`assetSubClassId`) REFERENCES `assetSubClass` (`id`)
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
  `createdDate` datetime NOT NULL,
  `createdBy` int(11) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` int(11) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `minTradeAmount` decimal(10,0) DEFAULT NULL,
  `minInitialBuyDollar` decimal(10,0) DEFAULT NULL,
  `buyPriority` tinyint(1) DEFAULT NULL,
  `sellPriority` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`securitySetId`,`securityId`,`equivalentSecurityId`),
  KEY `equivalentSecurityId` (`equivalentSecurityId`)
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
  KEY `IDX_securityPrice_user_createdBy` (`createdBy`),
  KEY `IDX_securityPrice_user_editedBy` (`editedBy`),
  CONSTRAINT `FK_securityPrice_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_securityPrice_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

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
  PRIMARY KEY (`securitySetId`,`securityId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  PRIMARY KEY (`securitySetId`,`securityId`,`tlhSecurityId`)
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
  `createdBy` varchar(100) DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` varchar(100) DEFAULT NULL,
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
  KEY `FK_taxLot_account_accountId` (`accountId`),
  KEY `FK_taxLot_user_editedBy` (`editedBy`),
  KEY `FK_taxLot_security_securityId` (`securityId`),
  KEY `FK_taxLot_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_taxLot_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_taxLot_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_taxLot_account_accountId` FOREIGN KEY (`accountId`) REFERENCES `account` (`orionConnectExternalId`)
) ENGINE=InnoDB AUTO_INCREMENT=2251 DEFAULT CHARSET=latin1;

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
) ENGINE=InnoDB AUTO_INCREMENT=356 DEFAULT CHARSET=utf8;

/*Table structure for table `teamAccountAccess` */

DROP TABLE IF EXISTS `teamAccountAccess`;

CREATE TABLE `teamAccountAccess` (
  `teamId` int(11) NOT NULL,
  `accountId` varchar(50) NOT NULL,
  `access` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL,
  `createdBy` varchar(100) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` varchar(100) NOT NULL,
  KEY `TeamId` (`teamId`),
  CONSTRAINT `teamAccountAccess_ibfk_1` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  KEY `FK_teamAdvisorAccess_team_teamId` (`teamId`),
  KEY `FK_teamAdvisorAccess_user_editedBy` (`editedBy`),
  KEY `advisorId` (`advisorId`),
  CONSTRAINT `teamAdvisorAccess_ibfk_1` FOREIGN KEY (`advisorId`) REFERENCES `advisor` (`externalId`),
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
  KEY `FK_teamModelAccess_user_createdBy` (`createdBy`),
  KEY `FK_teamModelAccess_user_editedBy` (`editedBy`),
  KEY `ModelId` (`modelId`),
  CONSTRAINT `teamModelAccess_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `model` (`id`),
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
  KEY `FK_teamPortfolioAccess_user_createdBy` (`createdBy`),
  KEY `TeamId` (`teamId`),
  KEY `portfolioId` (`portfolioId`),
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
  KEY `FK_transaction_security_securityId` (`securityId`),
  KEY `FK_transaction_user_editedBy` (`editedBy`),
  KEY `FK_transaction_user_createdBy` (`createdBy`),
  KEY `FK_transaction_account_accountId` (`accountId`),
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
  `createdBy` varchar(100) DEFAULT NULL,
  `editedDate` datetime DEFAULT NULL,
  `editedBy` varchar(100) DEFAULT NULL,
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
  `createdBy` varchar(100) NOT NULL,
  `editedDate` datetime NOT NULL,
  `editedBy` varchar(100) NOT NULL DEFAULT '370925',
  `email` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `expireDate` date DEFAULT '2050-12-31',
  `userLoginId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  KEY `FK_user_user_editedBy` (`editedBy`),
  KEY `FK_user_user_createdBy` (`createdBy`),
  KEY `IDX_roleId` (`roleId`),
  CONSTRAINT `FK_user_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  KEY `FK_userTeam_user_editedBy` (`editedBy`),
  KEY `FK_userTeam_user_createdBy` (`createdBy`),
  CONSTRAINT `FK_userTeam_team_teamId` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`),
  CONSTRAINT `FK_userTeam_user_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_userTeam_user_editedBy` FOREIGN KEY (`editedBy`) REFERENCES `user` (`userId`),
  CONSTRAINT `FK_userTeam_user_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/* Procedure structure for procedure `getDashboardSummary` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummary` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `getDashboardSummary`(var_user_id INT)
BEGIN
CALL getDashboardSummaryUsers(var_user_id);
CALL getDashboardSummaryTeams(var_user_id);
CALL getDashboardSummaryRoles(var_user_id);
CALL getDashboardSummaryCustodians (var_user_id);
END */$$
DELIMITER ;

/* Procedure structure for procedure `getDashboardSummaryCustodians` */

/*!50003 DROP PROCEDURE IF EXISTS  `getDashboardSummaryCustodians` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `getDashboardSummaryCustodians`(var_user_id INT)
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

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `getDashboardSummaryRoles`(var_user_id INT)
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

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `getDashboardSummaryTeams`(var_user_id INT)
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

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `getDashboardSummaryUsers`(var_user_id INT)
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

/* Procedure structure for procedure `updateUserStatus` */

/*!50003 DROP PROCEDURE IF EXISTS  `updateUserStatus` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`oEAHDC`@`%` PROCEDURE `updateUserStatus`(varTeamId INT)
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
