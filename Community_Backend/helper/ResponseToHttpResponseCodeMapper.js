"use strict";

var httpResponseCode = require('config/constants/HttpResponse.js');

var responseCodeToHttpResponseCode = {
		/*
		 * ResponseCode to HttpResponseCode
		*/
		SUCCESS : 'SUCCESS',
		CREATED : 'CREATED',
		BAD_REQUEST : 'BAD_REQUEST',
		UNAUTHORIZED : 'UNAUTHORIZED',
		FORBIDDEN : 'FORBIDDEN',
		NOT_FOUND : 'NOT_FOUND',
		UNPROCESSABLE : 'UNPROCESSABLE',
		INTERNAL_SERVER_ERROR : 'INTERNAL_SERVER_ERROR',
		DUPLICATE_ENTRY : 'UNPROCESSABLE',
		IMPORTED : 'UNPROCESSABLE',
		ALREADY_DELETED : 'UNPROCESSABLE',
		EXISTS : 'EXISTS',
		
		/*
		 * Temporary for mapping
		*/200 : 'SUCCESS',                             
		201 : 'CREATED',                             
		400 : 'BAD_REQUEST',                     
		401 : 'UNAUTHORIZED',                   
		403 : 'FORBIDDEN',                         
		404 : 'NOT_FOUND',                         
		422 : 'UNPROCESSABLE',                 
		500 : 'INTERNAL_SERVER_ERROR', 
};

module.exports = function(responseCode){
	var returnStatus = httpResponseCode[responseCodeToHttpResponseCode[responseCode]];
	if(returnStatus){
		return returnStatus;
	}else{
		return httpResponseCode['INTERNAL_SERVER_ERROR'];
	}
};
