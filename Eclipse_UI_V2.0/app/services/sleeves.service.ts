import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';

@Injectable()
export class SleeveService {
    private _portfoilioSleeveEndPoint = 'portfolio/sleeves';
    private _portfolioEndPoint = 'portfolio/portfolios';
    private _sleeveSimpleSearchEndPoint = 'account/accounts/simple';
    private sleevedportfolio: any[] = [];


    constructor(private _httpClient: HttpClient) { }

    /** load portfolioregularaccount details by portfolio id */
    getSleevedAccountsById(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + "/" + portfolioId + "/accounts" + "/sleeved");
    }

    /** To get static slleved portfolio values */
    getSleevedPortfolio() {
        this.sleevedportfolio.push(
            { id: 1, name: "Yes" },
            { id: 0, name: "No" }
        );
        return this.sleevedportfolio;
    }

    /** get Sleeved accounts for autocomplete with accountNumber/portfolioName/accountNumber */
    searchportfolioSleeveAccounts(searchString: string) {
        return this._httpClient.getData(this._portfoilioSleeveEndPoint + '?search=' + searchString)
    }

    /** Gets Allocations for selected Sleeved account associated with a model */
    getSleevedAccountAllocation(sleevedAccountId: number) {
        return this._httpClient.getData(this._portfoilioSleeveEndPoint + '/' + sleevedAccountId + '/' + 'allocations');
    }

    getSleevedAccountSearch(searchString: string) {
        return this._httpClient.getData(this._sleeveSimpleSearchEndPoint + '?inSleeve=true&search=' + searchString)
    }

}
