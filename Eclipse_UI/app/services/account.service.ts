import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IAccountCustomView} from '../models/account';
import {IPortfolio} from '../models/portfolio';

@Injectable()
export class AccountService {
    private _accountSimpleEndPoint = 'account/accounts/simple';
    private _accountDashboardEndPoint = 'dashboard/account/summary';
    private _accountEndPoint = 'account/accounts';

    constructor(private _httpClient: HttpClient) { }

    /** Get Accounts dashboard summary */
    getAccountDashboardSummary() {
        return this._httpClient.getData(this._accountDashboardEndPoint);
    }

    /** To get Account customViews */
    getAccountCustomViews() {
        //return this._httpClient.getData(this._accountEndPoint")
        let customView = <IAccountCustomView[]>[];
        customView.push(<IAccountCustomView>{ id: 1, name: "custom view 1" });
        customView.push(<IAccountCustomView>{ id: 2, name: "custom view 2" });
        customView.push(<IAccountCustomView>{ id: 3, name: "custom view 3" });
        return customView;
    }

    /** Get Account Filters */
    getAccountFilters() {
        return this._httpClient.getData(this._accountEndPoint + "/accountfilters")
    }

    /**
     * Get all accounts or accounts which are related to filter
     * @fileterTypeId is type number which is the id of filter type
     */
    getAccounts(fileterTypeId: number = 0) {
        return (fileterTypeId == 0)
            ? this._httpClient.getData(this._accountEndPoint)
            : this._httpClient.getData(this._accountEndPoint + '?filterId=' + fileterTypeId)
    }

    /**
     * Get Account Details by AccountId
     * @accountId is type number which is the id of the account
     */
    getAccountById(accountId) {
        return this._httpClient.getData(this._accountEndPoint + '/' + accountId)
    }

    /** Search account by AccountId or Name*/
    searchAccountsById(searchKey) {
        return this._httpClient.getData(this._accountSimpleEndPoint + '?search=' + searchKey)
    }

    /**
     * loads Account details by AccountId
     * Used in Account Preferences
     */
    getAcountDetail(accountId: number) {
        return this._httpClient.getData(this._accountSimpleEndPoint + "/" + accountId);
    }

    /**
     * To get Accounts by Account name
     * Used in Account Preferences
     */
    searchAccounts(searchString: string) {
        return this._httpClient.getData(this._accountSimpleEndPoint + '?search=' + searchString);
    }

    
    /** Search account by AccountId or Name to get id, name, value*/
    searchAccountsByIdWithValue(searchKey) {
        return this._httpClient.getData(this._accountSimpleEndPoint +'?includevalue=true'+'&search=' + searchKey)
    }

}
