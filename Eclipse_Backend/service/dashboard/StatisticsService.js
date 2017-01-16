
/**
 * 
 */
var moduleName = __filename;

var config = require('config');
var statsDao = require('dao/dashboard/StatisticsDao');
var logger = require('helper/Logger.js')(moduleName);
var preferenceService = new(require('service/preference/PreferenceService'))();
var messages = config.messages;
var responseCodes = config.responseCode;

function Stats(){
	
}

Stats.prototype.getStats = function(data, cb){
	var self = this;
	statsDao.getDashboardSummary(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}

		 self.getPreferenceDashboardSummary(data.data, function(err, result) {
			 if(err){
				 logger.error("Error while generating summary for preferences. : "+err);
			 } else {
				 logger.info("Prefernces summary generated successfully. Result is : "+result)
				 rs.PreferenceTotal = null;
		            rs.PreferenceEditedToday = result.editedToday;
		            rs.PreferenceEditedInWeek = result.editedBefore
		            cb(null, responseCodes.SUCCESS, rs);
			 }
	            
	        });

	});
};

Stats.prototype.getPreferenceDashboardSummary = function(data, cb) {
    preferenceService.listAllPreferenceLevels(data, function(err, httpStatus, prfernceLevels) {
        if (err) {
            logger.error("Error while getting preference level. \n" + err);
            return cb(err, 0);
        } else {
            if (prfernceLevels.length > 0) {
                var levelBitValues = [];

                prfernceLevels.forEach(function(level) {
                    levelBitValues.push(level.bitValue);
                });
                
                logger.info("Level's Allowed to Current User : " + JSON.stringify(levelBitValues));
                
                data.fetchCriteria = {
                    levelBitValues: levelBitValues
                };
                preferenceService.getUserPreferenceSummary(data, function(err, result) {
                    if (err) {
                        logger.error("Error while getting preferences list. \n" + err);
                        return cb(err, result);
                    } else {
                    	logger.info("Preferences allowed to Current User's firm : " + result);
                        return cb(err, result);
                    }
                });
            } else {
            	 logger.info("No Level allowed for current user's firm.");
                return cb(err, 0);
            }
        }
    });
};

module.exports = new Stats();
