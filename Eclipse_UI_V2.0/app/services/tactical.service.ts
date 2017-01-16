import { Injectable } from '@angular/core';
import { HttpClient } from '../core/http.client';
import { ITacticalPortfolio } from '../models/tactical';

@Injectable()
export class TacticalService {
    private _tradeEndPoint = 'tradetool/tacticaltradetool/';
    private _securitiesEndPoint = 'security/securities';

    constructor(private _httpClient: HttpClient) { }

    getTacticalPortfolio(portfolioId, accountId) {
        return this._httpClient.getData(this._tradeEndPoint + `portfolio/${portfolioId}/levels?usePendingValue=` + true + '&defaultAction=' + true + '&accountId=' + accountId);
    }

    getPortfolioSecurities(portfolioId, securitysetId, exclude) {
        let params = (exclude) ? "?exclude=true" : "";
        return this._httpClient.getData(this._tradeEndPoint + `portfolio/${portfolioId}/securityset/${securitysetId}/securities` + params);
    }

    getUnassignedSecurities(portfolioId) {
        return this._httpClient.getData(this._tradeEndPoint + `portfolio/${portfolioId}/unassignedsecurity`);
    }

    getSecurityAccounts(portfolioId, securityId, exclude) {
        let params = (exclude) ? "?exclude=true" : "";
        return this._httpClient.getData(this._tradeEndPoint + `portfolio/${portfolioId}/security/${securityId}/accounts` + params);
    }

    getAccountTaxlots(portfolioId, securityId, accountId) {
        return this._httpClient.getData(this._tradeEndPoint + `portfolio/${portfolioId}/security/${securityId}/account/${accountId}/taxlots`);
    }

    getCashSummary(portfolioId) {
        return this._httpClient.getData(`portfolio/portfolios/${portfolioId}/cashsummary`);
    }

    getSecurities(portfolioId: number = 0) {
        return this._httpClient.getData(this._securitiesEndPoint + '?excludePortfolioIds=' + (portfolioId > 0 ? portfolioId : ""));
    }

}
