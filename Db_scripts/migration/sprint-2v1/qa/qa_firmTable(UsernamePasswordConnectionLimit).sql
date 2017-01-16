ALTER TABLE `qa_orionEclipseCommon`.`firm` ADD COLUMN `username` VARCHAR(50) NULL AFTER `server`; 
ALTER TABLE `qa_orionEclipseCommon`.`firm` ADD COLUMN `password` VARCHAR(50) NULL AFTER `username`; 
ALTER TABLE `qa_orionEclipseCommon`.`firm` ADD COLUMN `poolLimit` INT NULL AFTER `password`; 

UPDATE `qa_orionEclipseCommon`.`firm` 
SET `server` = 'aurorapocinstance2-cluster.cluster-cwz3dqtcj9ax.us-east-1.rds.amazonaws.com' 
, `poolLimit` = '10'  
, `username` = 'b0VBUUE='
, `password` = 'b0VBUUFAb3Jpb25AZWNsaXBzZQ==' 
WHERE `orionConnectFirmID` = '477'; 

UPDATE `qa_orionEclipseCommon`.`firm` 
SET `server` = 'aurorapocinstance2-cluster.cluster-cwz3dqtcj9ax.us-east-1.rds.amazonaws.com'
, `poolLimit` = '10'
, `username` = 'b0VBUUE='
, `password` = 'b0VBUUFAb3Jpb25AZWNsaXBzZQ== 
WHERE `orionConnectFirmID` = '999';