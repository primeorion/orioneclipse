import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IPortfolioDetails, IAccount, IAUMsummary, IPortfolioTeam, IPortfolio, IPortfolioDashboard } from '../models/portfolio';

@Injectable()
export class PortfolioService {
    private sleevedportfolio: any[] = [];
    private _portfolioEndPoint = 'portfolio/portfolios';
    private portfolioDashboardEndPoint = 'dashboard/portfolio/summary';

    private _accountsByFilterEndPoint = 'account/accounts';
    private _portfolioSimpleEndPoint = 'portfolio/portfolios/simple';

    constructor(private _httpClient: HttpClient) { }

    /** Get team portfolios data for auto complete */
    getPortfolioSearch(searchString: string) {
        return this._httpClient.getData(this._portfolioSimpleEndPoint + '?search=' + searchString)
    }

    getSimplePortfolioList() {
        return this._httpClient.getData(this._portfolioEndPoint + '/simple');
    }

    /** Get all portfolios list */
    getPortfolios(portfolioTypeId: number = 0) {
        return (portfolioTypeId == 0)
            ? this._httpClient.getData(this._portfolioEndPoint)
            : this._httpClient.getData(this._portfolioEndPoint + '?status=' + portfolioTypeId);
    }

    /** Get portfolio accounts based on portfolio Id */
    getPortfolioAccounts(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + '/' + portfolioId + '/accounts');
    }

    /** Get portfolio accounts count summary */
    getPortfolioAccountsCountSummary(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + '/' + portfolioId + '/accounts/summary');
    }

    /** To delete portfolio */
    deletePortfolio(portfolioId: number) {
        return this._httpClient.deleteData(this._portfolioEndPoint + "/" + portfolioId);
    }

    // /** To get custom view list */
    // getPortfolioCustomViews() {
    //     let customView = <IPortfolioCustomView[]>[];
    //     customView.push(<IPortfolioCustomView>{ id: 1, name: "custom view 1" });
    //     customView.push(<IPortfolioCustomView>{ id: 2, name: "custom view 2" });
    //     customView.push(<IPortfolioCustomView>{ id: 3, name: "custom view 3" });

    //     return customView;
    // }

    /** Get dashboard data */
    getPortfolioDashboardData() {
        return this._httpClient.getData(this.portfolioDashboardEndPoint);
    }

    /** load portfolio details by portfolio id */
    getPortfolioById(portfolioId: number) {
        // let finalres = this.getPortfolios();
        //return finalres.find(a => a.id == portfolioId);
        return this._httpClient.getData(this._portfolioEndPoint + "/" + portfolioId);
    }

    /** load portfolioregularaccount details by portfolio id */
    getRegularAccountsById(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + "/" + portfolioId + "/accounts" + "/regular");
    }

    /** load portfolioregularaccount details by portfolio id */
    getSmaAccountsById(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + "/" + portfolioId + "/accounts" + "/sma");
    }

    /** load portfolioregularaccount details by portfolio id */
    getSleevedAccountsById(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + "/" + portfolioId + "/accounts" + "/sleeved");
    }

    /** To get static slleved portfolio values */
    getSleevedPortfolio() {
        this.sleevedportfolio.push(
            { id: true, name: "Yes" },
            { id: false, name: "No" }
        );
        return this.sleevedportfolio;
    }

    /** To create Portfolio */
    createPortfolio(portfolio: any) {
        console.log('posted portfolio data:', JSON.stringify(portfolio));
        return this._httpClient.postData(this._portfolioEndPoint, portfolio);
    }

    /** To update Portfolio */
    updatePortfolio(portfolioId: number, portfolio: any) {
        console.log('update portfolio data:', JSON.stringify(portfolio));
        return this._httpClient.updateData(this._portfolioEndPoint + "/" + portfolioId, portfolio);
    }

    /** To update portfolio accounts */
    updateAccounts(portfolioId: number, accountIds: any) {
        return this._httpClient.updateData(this._portfolioEndPoint + "/" + portfolioId + "/accounts", accountIds);
    }


    /*** Get All Accounts data */
    getAllAccounts(id: number) {
        return this._httpClient.getData(this._accountsByFilterEndPoint + '?filterId=' + id);
    }


    /** Search by name for All Portfolios in Portfolio Assignment */
    searchPortfolio(name: string) {
        return this._httpClient.getData(this._portfolioEndPoint + '/simple' + '?search=' + name);
    }

    /** To get portfolio status */
    getPortfolioFilters() {
        return this._httpClient.getData(this._portfolioEndPoint + '/portfolioFilters');
    }

    /** Assgin Portfolio to Acconts */
    assignAccounts(id: number, accountIds: any) {
        return this._httpClient.postData(this._portfolioEndPoint + "/" + id + "/accounts", accountIds);
    }

    /** get All HouseholdIds */
    getHousehold(id: number)
    {
        return this._httpClient.getData(this._portfolioEndPoint + '?householdIds' + "/" + id);
    }

    /** Get New Portfolio */
    getNewPortfolios(searchKey: string = '')
    {
        if (searchKey != "" && searchKey != undefined) searchKey = "?search=" + searchKey
        return this._httpClient.getData(this._portfolioEndPoint + "/new" + (searchKey || ""));
    }

    
    /** Search by name or id to get id, name, value*/
    searchPortfolioByIdWithValue(name: any) {
        return this._httpClient.getData(this._portfolioSimpleEndPoint +'?includevalue=true'+'&search=' + name);
    }

}
