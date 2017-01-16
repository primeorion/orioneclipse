import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
//import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {
    ITradeToolsFilter, ISellSecurity, ITradeGroupsPortfolio, ITradeGroupsAccount, IExcelImport, IGenerateTrades,
    ITradeTraget, ISecurity, IPreferences, ITradeSide, IShortTermGain, IWashSales, IModelTypes
} from '../models/tradetools';
import { IRaiseFullAmount } from '../models/raisecash';

@Injectable()
export class TradeToolsService {
    private _tradeToolsEndpoint = 'tradetool';
    private _tickerSwapEndpoint = 'tradetool/tickerswap/action/generateTrade';
    private _cashNeedGenerateTradeEndPoint = "tradetool/cashneeds/action/generatetrade";
    private _createTLHTradesEndPoint = "tradetool/taxLossHarvesting/action/createTrade";
    tradeTools: ITradeToolsFilter[] = [];
    sellSecuritiesList: ISellSecurity[] = [];
    tradeGroupsPortfolios: ITradeGroupsPortfolio[] = [];
    tradeGroupsAccounts: ITradeGroupsAccount[] = [];

    /** TRADE TOOL: SPEND CASH */
    private _spendcashEndpoint = 'tradetool/spendcash';
    private _raisecashEndpoint = 'tradetool/raisecash';


    constructor(private _httpClient: HttpClient) { }

    /** Upload selected file */
    uploadFileTemplate(file, isSleevePortfolio: boolean) {
        var formData: any = new FormData();
        formData.append("document", file);
        return (isSleevePortfolio) ? this._httpClient.uploadFile(this._tradeToolsEndpoint + "/uploadfile?isSleeve=true", formData) :
            this._httpClient.uploadFile(this._tradeToolsEndpoint + "/uploadfile", formData);
        // return this._httpClient.uploadFile(this._tradeToolsEndpoint + "/uploadfile", formData);
    }

    /** To generate trades */
    generateTrades(generateTrades: any) {
        return this._httpClient.postData(this._tradeToolsEndpoint + "/globaltrades/action/generateTrade", generateTrades);
    }

    swapTickerGenerateTrades(generateTrades: any) {
        return this._httpClient.postData(this._tickerSwapEndpoint, generateTrades);
    }
    /**To get static trade tools data */
    getTradeToolsData() {
        this.tradeTools.push(<ITradeToolsFilter>{ id: 1, name: 'Steve and Smit', tag: 'Steve' });
        this.tradeTools.push(<ITradeToolsFilter>{ id: 2, name: "Steve and Smit 2", tag: 'Steve' });
        this.tradeTools.push(<ITradeToolsFilter>{ id: 3, name: "Steve and Smit 3", tag: 'Steve' });
        return this.tradeTools;
    }

    /** Test Method: To get sell securities */
    getSellSecurities() {
        this.sellSecuritiesList.push(<ISellSecurity>{ id: 1, name: 'test sell security 1' });
        this.sellSecuritiesList.push(<ISellSecurity>{ id: 2, name: 'test sell security 2' });
        this.sellSecuritiesList.push(<ISellSecurity>{ id: 3, name: 'test sell security 3' });
        this.sellSecuritiesList.push(<ISellSecurity>{ id: 4, name: 'test sell security 4' });
        this.sellSecuritiesList.push(<ISellSecurity>{ id: 5, name: 'sell security 5' });
        return this.sellSecuritiesList;
    }

    /** Get static trade groups portfolios to bind auto complete*/
    getTradeGroupsPortfolios() {
        this.tradeGroupsPortfolios.push(<ITradeGroupsPortfolio>{ id: 1, name: 'TradeGroupsPortfolio 1' });
        this.tradeGroupsPortfolios.push(<ITradeGroupsPortfolio>{ id: 2, name: 'TradeGroupsPortfolio 2' });
        this.tradeGroupsPortfolios.push(<ITradeGroupsPortfolio>{ id: 3, name: 'TradeGroupsPortfolio 3' });
        this.tradeGroupsPortfolios.push(<ITradeGroupsPortfolio>{ id: 4, name: 'TradeGroupsPortfolio 4' });
        return this.tradeGroupsPortfolios;
    }

    /** Get static trade groups accounts to bind auto complete*/
    getTradeGroupsAccounts() {
        this.tradeGroupsAccounts.push(<ITradeGroupsAccount>{ id: 1, name: 'TradeGroupsAccount 1' });
        this.tradeGroupsAccounts.push(<ITradeGroupsAccount>{ id: 2, name: 'TradeGroupsAccount 2' });
        this.tradeGroupsAccounts.push(<ITradeGroupsAccount>{ id: 3, name: 'TradeGroupsAccount 3' });
        this.tradeGroupsAccounts.push(<ITradeGroupsAccount>{ id: 4, name: 'TradeGroupsAccount 4' });
        this.tradeGroupsAccounts.push(<ITradeGroupsAccount>{ id: 5, name: 'TradeGroupsAccount 5' });
        return this.tradeGroupsAccounts;
    }

    CashNeedGenerateTrade(generateTrades: IGenerateTrades) {
        return this._httpClient.postData(this._cashNeedGenerateTradeEndPoint, generateTrades);
    }


    /** To get spendcash calculation methods*/
    getSpendCashCalculationMethods() {
        return this._httpClient.getData(this._spendcashEndpoint + "/calculation_methods");
    }

    /** To get raisecash calculation methods*/
    getRaiseCashCalculationMethods() {
        return this._httpClient.getData(this._raisecashEndpoint + "/calculation_methods");
    }

    /** To get Tradeside  */
    getTradeSide() {
        return this._httpClient.getData(this._tradeToolsEndpoint + "/tradeside");
    }

    /** To get ShortTermGain */
    getShortTermGain() {
        return this._httpClient.getData(this._tradeToolsEndpoint + "/allowshorttermgains");
    }

    /** Get list for allow Wash Sales */
    getWashSales() {
        return this._httpClient.getData(this._tradeToolsEndpoint + "/allowwashsales");
    }

    /**Get model types on the basis of models or portfolios, or accounts */
    getModelTypes() {
        return this._httpClient.getData("modeling/models/submodels");
    }

    /** To Calculate TradeToTraget */
    calculateTarget(tradeTarget: ITradeTraget) {  //security: ISecurity,preferences: IPreferences, tradeAccounts:ITradeAccount[] 
        return this._httpClient.postData(this._tradeToolsEndpoint + "/tradetotarget/action/generateTrade", tradeTarget);
    }


    private raiseFullAmount: IRaiseFullAmount[] = [];
    /** To get Spend full amount options */
    getTradeToolsFullCashOptions() {
        this.raiseFullAmount.push(<IRaiseFullAmount>{ id: 1, name: 'Use Default' });
        this.raiseFullAmount.push(<IRaiseFullAmount>{ id: 2, name: 'Yes' });
        this.raiseFullAmount.push(<IRaiseFullAmount>{ id: 3, name: 'No' });
        return this.raiseFullAmount;
    }
    /**Create TLH trades */
    createTrades(tradeFilter) {
        return this._httpClient.postData(this._createTLHTradesEndPoint, tradeFilter);
    }

}
