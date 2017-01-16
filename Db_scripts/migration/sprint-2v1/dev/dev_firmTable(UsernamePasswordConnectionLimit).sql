ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `username` VARCHAR(50) NULL AFTER `server`; 
ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `password` VARCHAR(50) NULL AFTER `username`; 
ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `poolLimit` INT NULL AFTER `password`; 

UPDATE `dev_orionEclipseCommon`.`firm` 
SET `server` = 'aurorapocinstance2-cluster.cluster-cwz3dqtcj9ax.us-east-1.rds.amazonaws.com' 
, `poolLimit` = '10'  
, `username` = 'b0VB'
, `password` = 'b0VBQG9yaW9uQGVjbGlwc2U=' 
WHERE `orionConnectFirmID` = '477'; 

UPDATE `dev_orionEclipseCommon`.`firm` 
SET `server` = 'aurorapocinstance2-cluster.cluster-cwz3dqtcj9ax.us-east-1.rds.amazonaws.com'
, `poolLimit` = '10'
, `username` = 'b0VB'
, `password` = 'b0VBQG9yaW9uQGVjbGlwc2U=' 
WHERE `orionConnectFirmID` = '999';