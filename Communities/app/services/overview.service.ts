import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {IAumSummery} from '../models/overview'


@Injectable()
export class OverviewService {
    private _dashboardAumSummeryEndpoint = 'community/dashboard/aum/summary';
    private _dashboardAccountSummeryEndpoint = 'community/dashboard/account/summary';
    private _dashboardCashFlowSummeryEndpoint = 'community/dashboard/cashflow/summary';


    constructor(private _httpClient: HttpClient) { }
    //get dashboard aum summary Info
    getAumSummary(type: string, date: string) {
        return this._httpClient.getData(this._dashboardAumSummeryEndpoint + "?type=" + type + "&date=" + date);
    }
    //get dashboard account summary Info
    getAccountSummary(type: string, date: string ) {
        return this._httpClient.getData(this._dashboardAccountSummeryEndpoint + "?type =" + type + "&date=" + date);
    }
    //get dashboard cash flow summary Info
    getCashFlowSummary(type: string, startDate: string = "09/23/2016", endDate: string = "09/23/2016") {
        return this._httpClient.getData(this._dashboardCashFlowSummeryEndpoint + "?type =" + type + "&startDate =" + startDate +
            "&endDate" + endDate);
    }



}