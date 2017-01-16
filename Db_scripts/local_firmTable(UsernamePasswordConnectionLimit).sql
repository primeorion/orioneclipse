ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `username` VARCHAR(50) NULL AFTER `server`; 
ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `password` VARCHAR(50) NULL AFTER `username`; 
ALTER TABLE `dev_orionEclipseCommon`.`firm` ADD COLUMN `poolLimit` INT NULL AFTER `password`; 

UPDATE `dev_orionEclipseCommon`.`firm` 
SET `server` = 'localhost' 
, `poolLimit` = '10'  
, `username` = 'cm9vdA=='
, `password` = 'cGF4Y2VsQDEyMw==' 
WHERE `orionConnectFirmID` = '477'; 

UPDATE `dev_orionEclipseCommon`.`firm` 
SET `server` = 'localhost'
, `poolLimit` = '10'
, `username` = 'cm9vdA=='
, `password` = 'cGF4Y2VsQDEyMw==' 
WHERE `orionConnectFirmID` = '999';