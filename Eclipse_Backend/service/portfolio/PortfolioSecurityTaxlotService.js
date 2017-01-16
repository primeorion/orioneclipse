
/**
 * 
 */
var moduleName = __filename;

var config = require('config');
var portfolioSecurityTaxDao = require('dao/portfolio/PortfolioSecurityTaxlotDao.js');
var logger = require('helper/Logger.js')(moduleName);
var messages = config.messages;
var responseCode = config.responseCodes;
var _ = require("lodash");

function PortfolioSecurityTaxlot(){
	
}

PortfolioSecurityTaxlot.prototype.getAccountsSecuritiesTaxLotsForPortfolioDetail = function(data, cb){
	var self = this;
	portfolioSecurityTaxDao.getAccountsSecuritiesTaxLotsForPortfolio(data, function(err, rs){
	    var portfolioDetail = {};
    	if(err){
			logger.error(err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
        if(rs) {
		   if(rs && rs.length > 0 && rs.length >= 5){
               if(rs[0].length >0) {
                    portfolioDetail = rs[0][0];
                    portfolioDetail.securityList = [];
                    
                    rs[4].forEach(function(value, i){
                    
                        var security = {};
                        security.taxlot = [];
                        security.id = value.securityId;
                        security.securityName = value.securityName;
                        security.marketValue = value.totalMarketValue;
                        security.currentPrice = value.price;
                        security.securityQuantity = value.securityQuantityCount;
                        rs[3].forEach(function(val, i){    
                            var taxlot = {};
                            if(val.securityId == value.securityId){
                                taxlot.id = val.id;
                                taxlot.accountNumber = val.accountNumber;
                                taxlot.quantity = val.quantity;
                                taxlot.price = val.taxlotPrice;
                                taxlot.accountType  = val.taxableType;
                                security.taxlot.push(taxlot);
                            }
                        });
                        portfolioDetail.securityList.push(security);
                        
                    }); 
				}
           }
        }
       
        return cb(null, responseCode.SUCCESS, portfolioDetail);
	});
};
module.exports = new PortfolioSecurityTaxlot();
