"use strict";

var jsonValidate = require('express-jsonschema');
var jsonschema = require('jsonschema');

var dateREGEX = /^([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
var booleanREGEX = /^('?|"?)(true|false|1|0)('?|"?)$/;
var colorREGEX = /(^#([0-9abcdef]{3,6})$)|(^rgba\(\d{1,3},\d{1,3},\d{1,3}\,(1|0?.\d*)\)$)|(^hsla\(\d{1,3},\d{1,3},\d{1,3}\,(1|0?.\d*)\)$)/i

jsonValidate.addSchemaProperties({

	is : function(instance, schema, options, ctx){
		
		/*
		 * when required - false, and value is undefined
		 * does not allow null value
		*/if(!schema.required && instance === undefined){
			return;
		}
		switch(schema.is){
			case 'notEmpty' : 
				if(instance){
					if(instance.length > 0)
						return;
				}
				return "should not be empty";
			case 'numeric':
				if(/^('?|"?)\d+('?|"?)$/.test(instance)){
					return;
				}else{
					return "is not numeric string";
				}
			case 'numericOrempty':
				if(!instance){
					return ;
				}
				
				if(/^('?|"?)\d+('?|"?)$/.test(instance)){
					return;
				}else{
					return "is not numeric string";
				}
			case 'date':
			if(instance){
				if(dateREGEX.test(instance)){
					console.log("the instance value i got is"+instance);
					return;
				}else{

					return "is not date in specified format";
				}
			}else{
				return;
			}
			case 'boolean': 
				if(booleanREGEX.test(instance)){
					return;
				}else{
					return "is not boolean in specified format";
				}
			case 'hexColor' : 
				if(instance){
					if(colorREGEX.test(instance)){	
						return true;
					}else{
						return "is not valid color code with either #, rgba(), hsla()";
					}
				}else{
					if(instance && instance.length > 0){
						return;						
					}else{
						return "is string cannot be empty";
					}
				}
			case 'sum_is_100' :
				if(instance && instance.length>0){
					var totalPercentage = 0;
					instance.forEach(function(value){
						totalPercentage += value.targetPercent;
					});
				}
				if(totalPercentage == 100){
					return;					
				}
				return " targetAllowPercentage sum should be 100% ";

			default: 
				return "Invalid data type, please verify";
		}
	},
	equivalence_check : function(instance, schema, options, ctx){
		/*
		 * when required - false, and value is undefined
		 * does not allow null value
		*/if(!schema.required && instance === undefined){
			return;
		}
		switch(schema.equivalence_check){
			case 'not_in_equivalences' : 
				var status = false;
				if(instance && instance.length>0){
					instance.forEach(function(value){
						var securityId = value.id;
						var equivalences = value.equivalences;
						if(equivalences){
							equivalences.forEach(function(value){
								var equivalenceId = value.id;
								if(securityId == equivalenceId){
									status = true;
								}
							})
						}
					});
				}
				if(status){
					return " Security cannot be added as equivalence to itself ";							
				}else{
					return ;
				}
			default: 
				return "Invalid data type, please verify";
		}
	},
	tlh_check : function(instance, schema, options, ctx){
		/*
		 * when required - false, and value is undefined
		 * does not allow null value
		*/if(!schema.required && instance === undefined){
			return;
		}
		
		switch(schema.tlh_check){
			case 'not_in_tlh' : 
				var status = false;
				if(instance && instance.length>0){
					instance.forEach(function(value){
						var securityId = value.id;
						var tlh = value.tlh;
						if(tlh){
							tlh.forEach(function(value){
								var tlhId = value.id;
								if(securityId == tlhId){
									status = true;
								}
							})
						}
					});
				}
				if(status){
					return " Security cannot be added as tlh to itself ";							
				}else
					return ;
				return;
			default: 
				return "Invalid data type, please verify";
		}
	}

});

module.exports = jsonValidate.validate;
