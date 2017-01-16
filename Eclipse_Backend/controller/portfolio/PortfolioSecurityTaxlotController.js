"use strict";

var app = require('express')();
var response = require('controller/ResponseController.js');
var portfolioSecurityTaxlotService = require('service/portfolio/PortfolioSecurityTaxlotService.js');

app.use(require('middleware/DBConnection').common);

app.get('/:id', function(req, res){
    var data = req.data;
    data.portfolioId = req.params.id;
	portfolioSecurityTaxlotService.getAccountsSecuritiesTaxLotsForPortfolioDetail
    (data, function(err, statusCode, rs){
     	response(err, statusCode, rs, res);
	});
});

module.exports = app;