ALTER TABLE `qa_orionEclipseFirm_999`.`assetClass` 
            CHANGE `orionConnectExternalId` `orionConnectExternalId` INT(11) NULL AFTER `id`, 
            CHANGE `name` `name`                                     VARCHAR(255) CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `orionConnectExternalId`,
            ADD COLUMN `color`                                       VARCHAR(20) NULL AFTER `name`,
            CHANGE `isDeleted` `isDeleted`                           TINYINT(1) NULL ;
			
			
			
ALTER TABLE `qa_orionEclipseFirm_999`.`assetSubClass`
            CHANGE `name` `name`                                     VARCHAR(255) CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL AFTER `orionConnectExternalId`,
            CHANGE `orionConnectExternalId` `orionConnectExternalId` INT(11) NULL AFTER `id`, 
            ADD COLUMN `color`                                       VARCHAR(20) NULL AFTER `name`,
            CHANGE `isDeleted` `isDeleted`                           TINYINT(1) NULL ;
			
			
 ALTER TABLE `qa_orionEclipseFirm_999`.`security` 
  ADD COLUMN `status` TINYINT(1) NULL AFTER `custodialCash`, 
  ADD COLUMN `assetClassId` INT(11) NULL AFTER `assetCategoryId`, 
  ADD COLUMN `assetSubClassId` INT(11) NULL AFTER `assetClassId`,
  ADD COLUMN `securityTypeId` INT(11) NULL AFTER `assetSubClassId`,
  CHANGE createdDateTime createdDate DATETIME NULL,
CHANGE updatedDateTime editedDate DATETIME NULL,  
	DROP COLUMN updatedBy,
  ADD FOREIGN KEY (`assetClassId`) REFERENCES 
  `qa_orionEclipseFirm_999`.`assetClass`(`id`), 
  ADD FOREIGN KEY (`assetSubClassId`) REFERENCES 
  `qa_orionEclipseFirm_999`.`assetSubClass`(`id`); 
  
ALTER TABLE `qa_orionEclipseFirm_999`.`custodianSecuritySymbol` ADD UNIQUE INDEX `PRIMARY1` (`securityId`); 

ALTER TABLE `qa_orionEclipseFirm_999`.`custodianSecuritySymbol` DROP PRIMARY KEY, ADD PRIMARY KEY (`custodianId`, `securityId`), DROP INDEX `PRIMARY1`, ADD UNIQUE INDEX `PRIMARY` (`securityId`, `custodianId`); 
ALTER TABLE `qa_orionEclipseFirm_999`.`custodianSecuritySymbol` DROP PRIMARY KEY, ADD PRIMARY KEY (`custodianId`, `securityId`), DROP INDEX `PRIMARY1`, ADD UNIQUE INDEX `PRIMARY1` (`securityId`, `custodianId`); 

ALTER TABLE `qa_orionEclipseFirm_999`.`securityPrice` 
  CHANGE `createddatetime` `createddate` DATETIME NULL, 
  CHANGE `updateddate` `editeddate` DATETIME NULL; 
  
  ALTER TABLE `qa_orionEclipseFirm_999`.`custodianSecuritySymbol` CHANGE `isDeleted` `isDeleted` TINYINT(1) NOT NULL; 
  
UPDATE assetClass SET color = "#123456";
UPDATE assetCategory SET color = "#123456";
UPDATE assetSubClass SET color = "#123456";

ALTER TABLE `qa_orionEclipseFirm_999`.`securitySet` CHANGE `isDeleted` `isDeleted` TINYINT(1) NOT NULL; 

ALTER TABLE `qa_orionEclipseFirm_999`.`securitySetDetail` CHANGE `isDeleted` `isDeleted` TINYINT(1) NOT NULL; 

ALTER TABLE `qa_orionEclipseFirm_999`.`securityEquivalenceInSecuritySet` CHANGE `securityId` `securityId` INT(11) NOT NULL,
			CHANGE `isDeleted` `isDeleted` TINYINT(1) NOT NULL,
            CHANGE `equivalentSecurityId` `equivalentSecurityId`                                           INT(11) NOT NULL AUTO_INCREMENT,
            CHANGE `taxableSymbol` `taxableSecurityId`                                                       INT(11) NOT NULL,
            CHANGE `taxDeferredSymbol` `taxDeferredSecurityId`                                               INT(11) NOT NULL,
            CHANGE `taxExemptSymbol` `taxExemptSecurityId`                                                   INT(11) NOT NULL,
            ADD KEY(`equivalentSecurityId`), 
            DROP PRIMARY KEY, 
            ADD PRIMARY KEY (`securitySetId`, `securityId`, `equivalentSecurityId`);
			
			
CREATE TABLE `qa_orionEclipseFirm_999`.`securityTLHInSecuritySet` 
  ( 
     `securitySetId` INT(11) NOT NULL, 
     `securityId`    INT(11) NOT NULL, 
     `tlhSecurityId` INT(11) NOT NULL, 
     `priority`      INT, 
     `createdDate`   DATETIME NOT NULL, 
     `createdBy`     INT(11) NOT NULL, 
     `editedDate`    DATETIME, 
     `editedBy`      INT(11), 
     `isDeleted`     TINYINT(1) NOT NULL, 
     PRIMARY KEY (`securitySetId`, `securityId`, `tlhSecurityId`) 
  ); 
  
  
ALTER TABLE `qa_orionEclipseFirm_999`.`securitySetDetail` 
  ADD COLUMN `taxableSecurityId` INT(11) NULL AFTER `upperPercentage`, 
  ADD COLUMN `taxDeferredSecurityId` INT(11) NULL AFTER `taxableSecurityId`, 
  ADD COLUMN `taxExemptSecurityId` INT(11) NULL AFTER `taxDeferredSecurityId`; 
  
  
  ALTER TABLE `qa_orionEclipseFirm_999`.`securitySetDetail` ADD PRIMARY KEY (`securitySetId`, `securityId`); 
  
  UPDATE `security` SET isDeleted = 0;
  
  ALTER TABLE team ADD STATUS INT(11);
  
  ALTER TABLE `qa_orionEclipseFirm_999`.`role` ADD COLUMN `status` TINYINT(1) NULL AFTER `expireDate`; 