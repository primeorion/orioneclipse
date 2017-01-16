import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';

@Injectable()
export class RebalanceService {

    private _rebalanceEndPoint = 'portfolio/portfolioRebalance';
    private _rebalancerEndPoint = "rebalancer/rebalance/"
    private _rebalancerDownloadEndPoint = "rebalancer/rebalance/download"
    constructor(private _httpClient: HttpClient) { }

    getRebalanceDetail(id) {
         return this._httpClient.getData(this._rebalanceEndPoint + "/" + id);
    }
    
    rebalancePortfolio(modelId, portfolioId) {
           return this._httpClient.getData(this._rebalancerEndPoint + "model/" + modelId+"/portfolio/"+portfolioId);
    }
    assignModel(modelId, portfolioId) {
           return this._httpClient.getData(this._rebalancerEndPoint +"assignModel/" + modelId+"/portfolio/"+portfolioId);
    }
    
    dowloadLogs(tradeCode) {
        return this._httpClient.getData(this._rebalancerDownloadEndPoint + "/" + tradeCode);
    }
    

}
