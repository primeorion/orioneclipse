import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';

@Injectable()
export class HoldingService {
    private holdingParameters: any[] = [];
    private _holdingDashboardEndPoint = 'dashboard';
    private _holdingByPortfolioEndPoint = 'portfolio/portfolios';
    private _holdingByAccountEndPoint = 'account/accounts';
    private _holdingsEndPoint = 'holding/holdings';

    constructor(private _httpClient: HttpClient) { }

    /** Get dashboard data */
    getHoldingDashboardSummaryById(type, id) {
        return this._httpClient.getData(this._holdingDashboardEndPoint + "/" + type + "/" + id + "/holdings" + "/summary");
    }

    /** To get static Holding param values */
    getHoldingParameters() {
        this.holdingParameters.push(
            { id: 1, name: "Portfolio" },
            { id: 2, name: "Account" }
            //{ id: 3, name: "Registration" }
        );
        return this.holdingParameters;
    }
    /**To get Holdings List By Account Id and Portfolio Id */
    getHoldings(type, id, filterType) {
        if (type == "Portfolio" || type == "portfolio")
            return (filterType == 0)
                ? this._httpClient.getData(this._holdingByPortfolioEndPoint + "/" + id + "/holdings")
                : this._httpClient.getData(this._holdingByPortfolioEndPoint + "/" + id + "/holdings" + '?filter=' + filterType);

        else if (type == "Account" || type == "account")
            return (filterType == 0)
                ? this._httpClient.getData(this._holdingByAccountEndPoint + "/" + id + "/holdings")
                : this._httpClient.getData(this._holdingByAccountEndPoint + "/" + id + "/holdings" + '?filter=' + filterType);
    }

    /**To Search Holdings */
    searchHoldings(type, id,searchKey) {      
          if (type == "Portfolio" || type == "portfolio")
            return this._httpClient.getData(this._holdingsEndPoint + "/simple" +'?inPortfolioId=' + id + '&search=' + searchKey)               
          else if (type == "Account" || type == "account")
           return this._httpClient.getData(this._holdingsEndPoint + "/simple" +'?inAccountId=' + id + '&search=' + searchKey)
           
    }

    /**
    * Get Holding Details by Id */
    getHoldingDetailsById(holdingId) {
        return this._httpClient.getData(this._holdingsEndPoint + '/' + holdingId)
    }

    /**
    * Get Holding taxlots Details by Id */
    getHoldingTaxlotsDetailsById(holdingId) {
        return this._httpClient.getData(this._holdingsEndPoint + '/' + holdingId + "/taxlots")
    }


    /**
    * Get Holding transaction Details by Id */
    getHoldingTTransactionDetailsById(holdingId) {
        return this._httpClient.getData(this._holdingsEndPoint + '/' + holdingId + "/transactions")
    }


    /** To get holding filters */
    getHoldingFilters() {
        return this._httpClient.getData(this._holdingsEndPoint + '/holdingfilters');
    }


    /** To get holding search by account/portfolio id/name */
    getHoldingSearchByAccountOrPortfolio(searchKey: any) {
        return this._httpClient.getData(this._holdingsEndPoint + '?search=' + searchKey)
    }
}