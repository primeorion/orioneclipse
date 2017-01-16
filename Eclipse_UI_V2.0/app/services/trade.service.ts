import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {ITrade} from '../models/trade';

@Injectable()
export class TradeService {

    private _tradeEndPoint = 'tradeorder/trades';

    constructor(private _httpClient: HttpClient) { }
    
    getTradeListByPortfolio(portfolioId, tradeCode) {
        var url = this._tradeEndPoint+'/tradeListByPortfolio/'+portfolioId;
        if(tradeCode != null) {
           url = url+"?tradeCode="+tradeCode;
        }
        return this._httpClient.getData(url);
    }

}
