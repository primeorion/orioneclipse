 "use strict";

var moduleName = __filename;
var helper = require('helper');
var logger = helper.logger(moduleName);
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;

var UploadFileUtil = function () {};

UploadFileUtil.prototype.contentValidation = function (json, cb){
  var total = 0;
  var errorLog = [];
  var model = json;
  var securities = model.securities || [];
  logger.debug('securities ' + JSON.stringify(securities));

  //validating that securities should be present.
  if(securities.length == 0){
      errorLog.push({
                  'message': 'No security present in the model'
      });
  }else{   
    for( var i = 0; i < securities.length; i++) {
        if(!('symbol' in securities[i])) {
           errorLog.push({message: "No symbol for the " + securities[i] + " security found."});              
        }
     }

    if( errorLog.length > 0) {
        return cb(errorLog, null);
    }
    var data = securities.sort(function (a, b) {
    var predecessor = a['symbol'].toUpperCase();
    var successor = b['symbol'].toUpperCase();
    if (predecessor > successor) {
      return 1;
    }
    if (predecessor < successor) {
      return -1;
    }
    return 0;
   });
   securities = data;
  }

  //logger.info("the value of securities is:", securities);

  if( model.targetRiskLower != undefined) {
  if( isNaN(model.targetRiskLower) ) {
      errorLog.push({
                  'message': 'Target Risk Lower should be a number. Provided value is: ' + model.targetRiskLower
      });
  }else {
      if( parseFloat(model.targetRiskLower) > 100 || parseFloat(model.targetRiskLower) < 0) {
        errorLog.push({
                  'message': 'Target Risk Lower % should be a number between 0 and 100. Provided value is: ' + model.targetRiskLower
        });          
      }
  }
  }else{
      errorLog.push({
                  'message': 'Target Risk Lower should have some value.'
      });
  }
    
    
  if( model.targetRiskUpper != undefined) {
  if( isNaN(model.targetRiskUpper) ) {
      errorLog.push({
                  'message': 'Target Risk Upper should be a number. Provided value is: ' + model.targetRiskUpper
      });  
  }else{
      if( parseFloat(model.targetRiskUpper) > 100 || parseFloat(model.targetRiskUpper) < 0) {
        errorLog.push({
                  'message': 'Target Risk Upper % should be a number between 0 and 100. Provided value is: ' + model.targetRiskUpper
        });          
      }
  }
  }else {
          errorLog.push({
                  'message': 'Target Risk Upper should have some value.'
          });
  }

  if( model.minimumAmount != undefined) {
 if( isNaN(model.minimumAmount) ) {
      errorLog.push({
                  'message': 'Minimum amount should be a number. Provided value is: ' + model.minimumAmount
      });  
  }else{
      if(parseFloat(model.minimumAmount) < 0) {
        errorLog.push({
                  'message': 'Minimum Amount should be a positive number. Provided value is: ' + model.minimumAmount
        });          
      }
  }
  }else {
          errorLog.push({
                  'message': 'Minimum Amount should have some value.'
          });
  }

  if( model.currentRisk != undefined) {
  if( isNaN(model.currentRisk) ) {
       errorLog.push({
                   'message': 'Current risk should be a number. Provided value is: ' + model.currentRisk
       });    
  }else{
      if(parseFloat(model.currentRisk) < 0) {
        errorLog.push({
                  'message': 'Current Risk should be a positive number. Provided value is: ' + model.currentRisk
        });          
      }
  }
    }else {
          errorLog.push({
                  'message': 'Current Risk should have some value.'
          });
    }

  if( model.advisorFee != undefined) {
    if( isNaN(model.advisorFee) ) {
        errorLog.push({
                    'message': 'Advisor fees should be a number. Provided value is: ' + model.advisorFee
        });    
   }else{
        if(parseFloat(model.advisorFee) < 0) {
          errorLog.push({
                    'message': 'Advisor Fees should be a positive number. Provided value is: ' + model.advisorFee
          });          
        }
    }
  }else {
            errorLog.push({
                  'message': 'Advisor Fees should have some value.'
          });
  }

  if( model.weightedAvgNetExpense != undefined) {
     if( isNaN(model.weightedAvgNetExpense) ) {
        errorLog.push({
                    'message': 'Weighted Average net expanse should be a number. Provided value is:' + model.weightedAvgNetExpense
        });    
   }else{
        if(parseFloat(model.weightedAvgNetExpense) < 0) {
          errorLog.push({
                    'message': 'Weighted Avg Net Expense should be a positive number. Provided value is: ' + model.weightedAvgNetExpense
          });          
        }
    }
  }else {
            errorLog.push({
                    'message': 'Weighted Avg Net Expense should have some value.'
            });
  }
    
  var flag =0;

  for(var i = 0; i < securities.length; i++){
     logger.info("security name is:", model.securities[i].security);

     if( (i!= securities.length - 1) && (securities.length > 1) && (securities[i].symbol == securities[i + 1].symbol) ) {
      // logger.info("The security name has been repeated.");
       errorLog.push({
                  'message': 'Duplicate security name found.' + securities[i].symbol + ' should != ' + securities[i + 1].symbol
      });
     }
     
     if( securities[i].symbol == "CCASH") {
         flag = 1;
           if('allocation' in securities[i]) {
              if( isNaN(securities[i].allocation) ) {
                    errorLog.push({
                      'message': 'Security allocation % expanse should be a number.' + securities[i].allocation + ' found.'
                    });        
              }
              else {
                  if( parseFloat(securities[i].allocation) > 100 || parseFloat(securities[i].allocation) < 1) {
                    errorLog.push({
                              'message': 'Allocation % should be a number between 1 and 100 for CUSTODIAL_CASH. Provided value is: ' + securities[i].allocation
                    });          
                  }
                    total += parseInt(securities[i].allocation);
              }  
          }
         continue;
     }
     
     if( 'upperTolerancePercent' in securities[i]) {
             if( isNaN(securities[i].upperTolerancePercent) ) {
                 errorLog.push({
                    'message': 'Upper tolerance % expanse should be a number.' + securities[i].upperTolerancePercent + ' found.'
                });      
             }else{
              if( parseFloat(securities[i].upperTolerancePercent) > 100 || parseFloat(securities[i].upperTolerancePercent) < 0) {
                errorLog.push({
                          'message': 'Upper Tolernace % should be a number between 0 and 100. Provided value is: ' + securities[i].upperTolerancePercent
                });          
              }
            }
     }else {
         errorLog.push({
                          'message': 'upperTolerancePercent field missing from ' + securities[i]
                });
     }
      
    if('lowerTolerancePercent' in securities[i] ) {
    if( isNaN(securities[i].lowerTolerancePercent) ) {
         errorLog.push({
            'message': 'Lower tolerance % expanse should be a number.' + securities[i].lowerTolerancePercent
        });      
     }else{
      if( parseFloat(securities[i].lowerTolerancePercent) > 100 || parseFloat(securities[i].lowerTolerancePercent) < 0) {
        errorLog.push({
                  'message': 'Target Risk Upper % should be a number between 0 and 100. Provided value is: ' + securities[i].lowerTolerancePercent
        });          
      }
    }
    }else {
                errorLog.push({
                          'message': 'lowerTolerancePercent field missing from ' + securities[i]
                }); 
    }

     if('allocation' in securities[i]) {
          if( isNaN(securities[i].allocation) ) {
                errorLog.push({
                  'message': 'Security allocation % expanse should be a number.' + securities[i].allocation
                });        
          }
          else {
              if( parseFloat(securities[i].allocation) > 100 || parseFloat(securities[i].allocation) < 0) {
                errorLog.push({
                          'message': 'Allocation % should be a number between 0 and 100. Provided value is: ' + securities[i].allocation
                });          
              }
                total += parseInt(securities[i].allocation);
          }  
     }
     else if('Allocation %' in securities[i]){
             if( isNaN(securities[i]['Allocation %']) ) {
                 errorLog.push({
                  'message': 'Security allocation % expanse should be a number.' + securities[i]['Allocation %']
                });        
             }
             else {
               if( parseFloat(securities[i]['Allocation %']) > 100 || parseFloat(securities[i]['Allocation %']) < 0) {
                errorLog.push({
                          'message': 'Allocation % should be a number between 0 and 100. Provided value is: ' + securities[i].allocation
                });          
              }
                total += parseInt(securities[i]['Allocation %']);
             }
     }
     else{
      errorLog.push({
                  'message': 'Allocation percentage missing for the security' + securities[i].security + ' for model ' + model.name
      });
   //   return cb(errorLog, null);
     }

  }

  if(total != 100 && securities.length != 0){
     errorLog.push({
                  'message': 'Allocation percentage not equal to 100. It is ' + total + ' in model ' + model.name
      });
    //  return cb(errorLog, null);
  }

  if( flag == 0) {
      errorLog.push({
                  'message': 'CUSTODIAL_CASH security found missing for model ' + model.name 
      });
  }
    
  model.allocationPercent = total;

    if (errorLog.length > 0) {
      return cb(errorLog, null);
    }

  return cb(null, model);
}

module.exports = UploadFileUtil;