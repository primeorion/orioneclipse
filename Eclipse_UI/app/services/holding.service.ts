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
    getHoldings(type, id) {
        if (type == "Portfolio")
            return this._httpClient.getData(this._holdingByPortfolioEndPoint + "/" + id + "/holdings");
        else if (type == "Account")
            return this._httpClient.getData(this._holdingByAccountEndPoint + "/" + id + "/holdings");
    }

  /**To get Holdings List By filtertype */
    getHoldingsByFilter(type, id, filterTypeId) {
        if (type == "Portfolio")
            return this._httpClient.getData(this._holdingByPortfolioEndPoint + "/" + id + "/holdings" +'?filter=' + filterTypeId);
        else if (type == "Account")
            return this._httpClient.getData(this._holdingByAccountEndPoint + "/" + id + "/holdings" +'?filter=' + filterTypeId);
    }
    /**To Search Holdings */
    searchHoldings(searchKey) {
        return this._httpClient.getData(this._holdingsEndPoint + '?search=' + searchKey)
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
}