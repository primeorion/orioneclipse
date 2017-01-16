import { Injectable } from '@angular/core';
import { HttpClient } from '../core/http.client';
import { ITradeOrder, ITradeFiles, IQuickTradeData, IPatchTradeOrder } from '../models/tom';

@Injectable()
export class TomService {

    private _tomEndPoint = 'tradeorder/trades';
    private tomDashboardEndPoint = '';
    private _tradeFiles = 'tradeorder/tradefiles';
    private _accountEndPoint = 'account/accounts';
    private _tradeImportEndPoint = 'tradeorder/uploadfile';
    private _saveTradEndPoint = 'tradeorder/uploadTrades';

    constructor(private _httpClient: HttpClient) { }

    getTradeOrders() {
        return this._httpClient.getData(this._tomEndPoint);
    }

    getTradeOrderCount() {
        return this._httpClient.getData(this._tomEndPoint + '/count');
    }

    updateOrder(id, order: IPatchTradeOrder) {
        return this._httpClient.patchData(this._tomEndPoint + "/" + id, order);
    }

    deleteTradeOrders() {
        return this._httpClient.deleteData(this._tomEndPoint + "/" + 'deleteAll');
    }

    deleteTradeOrder(id: number) {
        return this._httpClient.deleteData(this._tomEndPoint + "/" + id);
    }

    deleteZeroQuantityTradeOrders() {
        return this._httpClient.updateData(this._tomEndPoint + "/" + 'action/deleteZeroQuantity', {});
    }

    enableTradeOrders(data: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/" + '/action/enable', data);
    }

    disableTradeOrders(data: any) {
        return this._httpClient.updateData(this._tomEndPoint + '/action/disable', data);
    }

    processTradeOrders(data: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/" + 'action/processTrades', data);
    }

    /** To Get TradeFiles List*/
    gettradeFiles(date: Date) {
        return this._httpClient.getData(this._tradeFiles + "?fromDate=" + date);
    }

    /** Update TradeFile status*/
    updateTradeFile(id: number) {
        return this._httpClient.updateData(this._tradeFiles + "/" + id + "/action/sent", {});
    }

    /** Delete Trade File */
    deleteTradeFile(id: number) {
        return this._httpClient.deleteData(this._tradeFiles + "/" + id);
    }

    /** Count of the TradeFiles */
    getTradeFilesCount() {
        return this._httpClient.getData(this._tradeFiles + "/count")
    }

    getAwaitingAcceptenceTrades() {
        return this._httpClient.getData(this._tomEndPoint + '/awaitingAcceptance');
    }

    getDurations() {
        return this._httpClient.getData(this._tomEndPoint + '/durations');
    }

    getOrderTypes() {
        return this._httpClient.getData(this._tomEndPoint + '/orderTypes');
    }

    getQualifiers() {
        return this._httpClient.getData(this._tomEndPoint + '/qualifiers');
    }

    getTradeActions() {
        return this._httpClient.getData(this._tomEndPoint + '/tradeActions');
    }

    getApprovalStatus(tradeIds: string) {
        return this._httpClient.getData(this._tomEndPoint + "/tradeApprovalStatus?tradeIds=" + tradeIds);
    }

    setApprovalStatus(id: number, data: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/action/setApprovalStatus/" + id, data);
    }

    getTradeDetail(id: number) {
        return this._httpClient.getData(this._tomEndPoint + "/" + id);
    }

    /**
     * Model Tolerance API
     * Get list of assets by selected trade id and model level tab
     */
    getModelTolerance(levelName: string, trade: ITradeOrder) {
        let params = "?assetType=" + levelName + "&isSleevePortfolio=" + trade.portfolio.isSleevedPorfolio;
        return this._httpClient.getData("portfolio/portfolios/" + trade.portfolio.id + "/modelTolerance/" + trade.account.accountId + params);
    }

    /**
     * Model Tolerance/Analysis API
     * Get model levels by model id
     */
    getModelLevels(modelId: number) {
        return this._httpClient.getData("modeling/models/" + modelId + "/levels");
    }

    /**
     * Model Analysis API
     * Get list of models by selected trade ids
     */
    getModelsByTrades(tradeIds: number[]) {
        return this._httpClient.getData(this._tomEndPoint + "/model/simple?tradeIds=" + tradeIds.join(","));
    }

    /**
     * Model Analysis API
     * Get model summary by model id and parameters
     */
    getModelSummary(modelId: number, costBasis: boolean, tradeBlock: boolean, excludeAsset: boolean) {
        let params = ["isIncludeCostBasis=" + (costBasis ? 1 : 0)];
        params.push("isIncludeTradeBlockAccount=" + (tradeBlock ? 1 : 0));
        params.push("isExcludeAsset=" + (excludeAsset ? 1 : 0));
        return this._httpClient.getData("modeling/models/" + modelId + "/modelAnalysis/modelAggregate?" + params.join("&"));
    }

    /**
     * Model Analysis API
     * Get selected level data by model id and parameters
     */
    getLevelDataByModelId(levelName: string, modelId: number, costBasis: boolean, tradeBlock: boolean, excludeAsset: boolean) {
        let params = ["&isIncludeCostBasis=" + (costBasis ? 1 : 0)];
        params.push("isIncludeTradeBlockAccount=" + (tradeBlock ? 1 : 0));
        params.push("isExcludeAsset=" + (excludeAsset ? 1 : 0));
        return this._httpClient.getData("modeling/models/" + modelId + "/modelAnalysis?assetType=" + levelName + params.join("&"));
    }

    /**
     * Model Analysis API
     * Get portfolios with out of tolerance by model id and asset id
     */
    getPortfoliosByAssetId(levelName: string, modelId: number, assetId: number) {
        return this._httpClient.getData("portfolio/portfolios/" + modelId + "/outOfTolerance/" + assetId + "?assetType=" + levelName);
    }

    /**
     * Model Analysis API
     * Get accounts with out of tolerance by model id and asset id
     */
    getAccountsByAssetId(levelName: string, modelId: number, assetId: number) {
        return this._httpClient.getData("account/accounts/" + modelId + "/outOfTolerance/" + assetId + "?assetType=" + levelName);
    }

    /** Quick Trade Api*/
    /** get action types while selecting account*/
    getAccountActions() {
        return this._httpClient.getData(this._tomEndPoint + '/accountActions');
    }

    /** get action types while selecting portfolio*/
    getPortfolioActions() {
        return this._httpClient.getData(this._tomEndPoint + '/portfolioActions');
    }

    /** get account details to populate account tab in quick trade*/
    getAccountDetails(id: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id);

    }
    getPortfolioDetails(id: number) {
        return this._httpClient.getData("portfolio/portfolios" + "/" + id);

    }
    /** To save quick trade*/
    saveTrade(quickTrade: IQuickTradeData) {
        return this._httpClient.postData(this._tomEndPoint + "/", quickTrade);

    }
    /** To validate quick trade, api call needs to be changed*/
    validateTrade(quickTrade: IQuickTradeData) {
        return this._httpClient.postData(this._tomEndPoint + "/" + "validate", quickTrade);
    }

    /** get assest tab details for quicktrade-account */
    getAssetsforAccount(id: number) {
        return this._httpClient.getData(this._accountEndPoint + "/" + id + '/holdings');
    }

    /** get assest tab details for quicktrade-portfolio */
    getAssetsforPortfolio(id: number) {
        return this._httpClient.getData("portfolio/portfolios" + "/" + id + '/holdings');
    }

    /** get price tab details for quicktrade */
    getPrice(id: number) {
        return this._httpClient.getData("security/securities/price" + "/" + id);
    }
    /**Import Trade Order Excel */
    importTradeFile(file: any,isPending:boolean) {
        var formData: any = new FormData();
        formData.append("document", file);
        formData.append("isPending",isPending);
        return this._httpClient.uploadFile(this._tradeImportEndPoint, formData)
    }
    /**save valid uploaded Trades */
    saveUploadTrades(trades) {
        return this._httpClient.postData(this._saveTradEndPoint, trades);
    }

    //update on grid cell edi
    UpdateClientDirected(id, order: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/" + id + '/action/clientDirected', order);
    }
    //update on grid cell edi
    updateHoldUntil(id, order: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/" + id + '/action/holdUntil', order);
    }
    //update on grid cell edi
    updateSettlementType(id, order: any) {
        return this._httpClient.updateData(this._tomEndPoint + "/" + id + '/action/settlementType', order);
    }

//get settlementType master data
     getSettlementTypes() {
        return this._httpClient.getData(this._tomEndPoint + "/" + 'settlementTypes');
    }

//get tradeOrderMessages to display in message column of grid
      getTradeOrderMessages(id) {
        return this._httpClient.getData(this._tomEndPoint + "/" + 'tradeOrderMessages'+ "/" + id);
    }

    getOrdersForPortfolio(id)
    {
      return this._httpClient.getData(this._tomEndPoint + "/" + id);
    }
}
