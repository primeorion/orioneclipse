import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IAccountCustomView, IAsideCash, IAccountAsideCash, IAsideCashAmountType, IAsideCashExpirationType, IAsideCashTransactionType } from '../models/account';
import { IPortfolio } from '../models/portfolio';

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

    /**Accounts with No portfolios */
    // getNoportfolioAccounts()
    // {
    //     return this._httpClient.getData(this._accountEndPoint + "/noportfolio" );
    // }

    /**
     * To get Accounts by Account name
     * Used in Account Preferences
     */
    searchAccounts(searchString: string) {
        return this._httpClient.getData(this._accountSimpleEndPoint + '?search=' + searchString);
    }

    /** Search account by AccountId or Name to get id, name, value*/
    searchAccountsByIdWithValue(searchKey) {
        return this._httpClient.getData(this._accountSimpleEndPoint + '?returnvalue=true' + '&search=' + searchKey)
    }

    /** Search account by AccountId or Name to get id, name, value*/
    searchAccountsByIdValue(searchKey, isSpendCash) {
        return (isSpendCash)
            ? this._httpClient.getData(this._accountSimpleEndPoint + '?includevalue=true&inModel=true' + '&search=' + searchKey)
            : this._httpClient.getData(this._accountSimpleEndPoint + '?includevalue=true' + '&search=' + searchKey)
        // return this._httpClient.getData(this._accountSimpleEndPoint + '?includevalue=true' + '&search=' + searchKey)
    }

    /**posts Aside Cash */
    addAsidecash(id: number, asidecash: IAccountAsideCash) {
        return this._httpClient.postData(this._accountEndPoint + "/" + id + "/asidecash", asidecash);
        // account/accounts/:id/asidecash/:asidecashId
    }

    /**Updata Aside Cash */
    updateAsideCash(id: number, asidecash) {
        //account/accounts/1/asidecash/41

        //return this._httpClient.updateData(this._accountEndPoint + "/" + id + "/asidecash", asidecash + "/" + asidecash.id)
        return this._httpClient.updateData(this._accountEndPoint + "/" + id + "/asidecash/" + asidecash.id, asidecash)
    }

    /** Get Aside cash for Grid */
    getAsideCash(id: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id + "/asidecash");
    }

    /** To get AsideCashExpirationTypes */
    getCashExpiration() {
        return this._httpClient.getData(this._accountEndPoint + "/asideCashExpirationType");
    }

    /** to Get AsideCashTransactionType */
    getCashTransaction() {
        return this._httpClient.getData(this._accountEndPoint + "/asideCashTransactionType");
    }

    /**Get aside Cash Amount Type */
    getCashAmountType() {
        return this._httpClient.getData(this._accountEndPoint + "/asideCashAmountType");
    }

    /** Get AsideDetails */
    getAsideDetailsById(id: number, asidecashId: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id + "/asidecash/" + asidecashId);
    }

    /** Delete Asidecash by id */
    deleteAsideCash(id: number, asidecashId: number) {
        //account/accounts/:id/asidecash/:asidecashId
        return this._httpClient.deleteData(this._accountEndPoint + "/" + id + "/asidecash/" + asidecashId);
    }

    /**Get Replenish */
    getReplenish(id: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id + "/action/getReplenish");
    }

    /** Set Replenish */
    setReplenish(id: number, replenish: boolean) {
        return this._httpClient.updateData(this._accountEndPoint + "/" + id + "/action/setreplenish?value=" + replenish, {});
    }

    /** To get model levels for sma weightings */
    getAccountModelTypes(accountId: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + accountId + "/model/modelTypes");
    }

    /** To get sub node for model */
    getSubNodesForModel(accountId: number, modelTypeId: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + accountId + "/model/submodels?modelTypeId=" + modelTypeId);
    }

    /** To get sma list */
    getSMAList(accountId: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + accountId + "/sma");
    }

    /** Add/Update sma node details */
    updateSmaNodeDetails(accountId: number, nodes: any) {
        return this._httpClient.updateData(this._accountEndPoint + "/" + accountId + "/sma", nodes);
    }

    /** Get portfolio id by account id */
    getPortfolioIdByAccountId(id: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id + "/portfolioId");
    }

}
