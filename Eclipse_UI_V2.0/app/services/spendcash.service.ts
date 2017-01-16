import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { HttpClient } from '../core/http.client';
import { ISpendFullAmount } from '../models/spendcash';

@Injectable()
export class SpendCashService {
    private _spendcashEndpoint = 'tradetool/spendcash';
    private spendFullAmount: ISpendFullAmount[] = [];

    constructor(private _httpClient: HttpClient) { }

    // /** To get spendcash calculation methods*/
    // getSpendCashCalculationMethods() {
    //     return this._httpClient.getData(this._spendcashEndpoint + "/calculation_methods");
    // }

    /** To get Spend full amount options */
    getSpendFullCashOptions() {
        this.spendFullAmount = [];
        this.spendFullAmount.push(<ISpendFullAmount>{ id: 1, name: 'Use Default' });
        this.spendFullAmount.push(<ISpendFullAmount>{ id: 2, name: 'Yes' });
        this.spendFullAmount.push(<ISpendFullAmount>{ id: 3, name: 'No' });
        return this.spendFullAmount;
    }

    /** To generate tarde */
    spendCashGenerateTrade(trade: any) {
        return this._httpClient.postData(this._spendcashEndpoint + "/action/generatetrade", trade);
    }
}
