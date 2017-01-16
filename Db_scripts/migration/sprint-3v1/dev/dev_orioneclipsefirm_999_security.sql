ALTER TABLE `dev_orioneclipsefirm_999`.`assetcategory` ADD COLUMN `orionEclipseName` VARCHAR(255) NULL AFTER `orionConnectExternalId`; 

ALTER TABLE `dev_orioneclipsefirm_999`.`assetclass` CHANGE `orionConnectExternalId` `orionConnectExternalId` INT(11) NULL AFTER `assetCategoryId`, ADD COLUMN `orionEclipseName` VARCHAR(255) NULL AFTER `orionConnectExternalId`, CHANGE `isDeleted` `isDeleted` TINYINT(1) NULL AFTER `orionEclipseName`; 

ALTER TABLE `dev_orioneclipsefirm_999`.`assetsubclass` ADD COLUMN `orionEclipseName` VARCHAR(255) NULL AFTER `orionConnectExternalId`; 

ALTER TABLE `dev_orioneclipsefirm_999`.`security` DROP COLUMN `updatedDateTime`, DROP COLUMN `updatedBy`, ADD COLUMN `orionEclipseName` VARCHAR(255) NULL AFTER `name`, CHANGE `isDeleted` `isDeleted` TINYINT(1) NULL AFTER `assetCategoryId`, CHANGE `createdDateTime` `createdDate` DATETIME NULL AFTER `isDeleted`, ADD COLUMN `editedDate` DATETIME NULL AFTER `createdby`;

UPDATE assetCategory SET orionEclipseName = `name`;
UPDATE assetClass SET orionEclipseName = `name`;
UPDATE assetSubClass SET orionEclipseName = `name`;