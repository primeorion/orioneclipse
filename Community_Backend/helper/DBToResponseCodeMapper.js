
"use strict";

var config = require('config');
var messages = config.messages;
var httpResponseCode = config.responseCodes;
var dbErrorCode = config.dbErrorCode;
var DBToResponseCodeMapper = function(){}

DBToResponseCodeMapper.prototype.dbToResponseCodeMapper = function(data, cb){
        
        var result=[];
        var res='';
            if (   data.errno === dbErrorCode.ER_BAD_FIELD_ERROR 
                || data.errno === dbErrorCode.ER_WRONG_FIELD_SPEC ) {
                res={
                    code    : httpResponseCode.BAD_REQUEST,
                    message : messages.badFieldError
                };
            }
            else if (data.errno === dbErrorCode.ER_PARSE_ERROR) {
                res={
                    code    : httpResponseCode.BAD_REQUEST,
                    message : messages.parseError
                };
            }
            else if (data.errno === dbErrorCode.ER_NO_SUCH_TABLE) {
                res={
                    code    : httpResponseCode.NOT_FOUND,
                    message : messages.noSuchTable
                };
            }
            else if (  data.errno === dbErrorCode.ER_CANNOT_ADD_FOREIGN 
                    || data.errno === dbErrorCode.ER_NO_REFERENCED_ROW 
                    || data.errno === dbErrorCode.ER_ROW_IS_REFERENCED) {
                res={
                    code    : httpResponseCode.UNPROCESSABLE,
                    message : messages.rowIsReferenced
                };
            }
            else if (  data.errno === dbErrorCode.ER_TOO_LONG_IDENT 
                    || data.errno === dbErrorCode.ER_TOO_LONG_KEY ) {
                res={
                    code    : httpResponseCode.UNPROCESSABLE,
                    message : messages.tooLongIdent
                };
            }
            else if (  data.errno === dbErrorCode.ER_DUP_FIELDNAME 
                    || data.errno === dbErrorCode.ER_DUP_KEYNAME 
                    || data.errno === dbErrorCode.ER_DUP_ENTRY ) {
                res={
                    code    : httpResponseCode.UNPROCESSABLE,
                    message : messages.dupEntry
                };
            }
            else if (  data.errno === dbErrorCode.ER_MULTIPLE_PRI_KEY 
                    || data.errno === dbErrorCode.ER_DUP_UNIQUE ) {
                res={
                    code    : httpResponseCode.BAD_REQUEST,
                    message : messages.dupUnique
                };
            }
            else if (  data.errno === dbErrorCode.ER_PRIMARY_CANT_HAVE_NULL 
                    || data.errno === dbErrorCode.ER_REQUIRES_PRIMARY_KEY ) {
                res={
                    code    : httpResponseCode.BAD_REQUEST,
                    message : messages.requiresPrimaryKey
                };
            }
            else{
                res={
                    code    : httpResponseCode.INTERNAL_SERVER_ERROR,
                    message : messages.internalServerError
                };
            } 

        result.push(res)
    return cb(null,result);  
}
module.exports = DBToResponseCodeMapper;

