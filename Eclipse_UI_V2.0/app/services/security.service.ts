import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ICategory } from '../models/category';
import { IClass } from '../models/class';
import { ISubClass } from '../models/subClass';
import { ISecurity,ICorporateActions } from '../models/security';
import { ISecurityPreference, ISecuritySimple } from '../models/Preferences/securityPreference';


@Injectable()
export class SecurityService {
    private _categoryEndPoint = 'security/categories';
    private _classEndPoint = "security/classes";
    private _subClassEndPoint = "security/subclasses";
    private _securityEndPoint = "security/securities";
    private _securityTypeEndPoint = "security/securities/securitytype";
    private _securitySearchEndPoint = "security/securities/orion";
    private _securityStatusEndPoint = "security/securities/securitystatus";

    private yesOrNoOptions: any[] = [];    

    constructor(private _httpClient: HttpClient) { }

    /**
     * Get all categories
     */
    getCategoryData() {
        return this._httpClient.getData(this._categoryEndPoint)
    }

    /**
      * Get all classes
      */
    getClassData() {
        return this._httpClient.getData(this._classEndPoint)
    }

    /**
     * Get all sub classes
     */
    getSubClassData() {
        return this._httpClient.getData(this._subClassEndPoint)
    }

    saveCategory(category: ICategory) {
        return this._httpClient.postData(this._categoryEndPoint, category);
    }

    saveClass(assetClass: IClass) {
        return this._httpClient.postData(this._classEndPoint, assetClass);
    }

    saveSubClass(subClass: ISubClass) {
        return this._httpClient.postData(this._subClassEndPoint, subClass);
    }

    updateCategory(category: ICategory) {
        return this._httpClient.updateData(this._categoryEndPoint + "/" + category.id, category);
    }

    updateClass(assetClass: IClass) {
        return this._httpClient.updateData(this._classEndPoint + "/" + assetClass.id, assetClass);
    }

    updateSubClass(subClass: ISubClass) {
        return this._httpClient.updateData(this._subClassEndPoint + "/" + subClass.id, subClass);
    }

    deleteCategory(categoryId: number) {
        return this._httpClient.deleteData(this._categoryEndPoint + "/" + categoryId);
    }

    deleteClass(assetClassId: number) {
        return this._httpClient.deleteData(this._classEndPoint + "/" + assetClassId);
    }

    deleteSubClass(subClassId: number) {
        return this._httpClient.deleteData(this._subClassEndPoint + "/" + subClassId);
    }

    getSecurityData() {
        return this._httpClient.getData(this._securityEndPoint);
    }

    getSecurityDetail(id) {
        return this._httpClient.getData(this._securityEndPoint + "/" + id);
    }

    getSecurityType() {
        return this._httpClient.getData(this._securityTypeEndPoint);
    }

    searchSecurity(searchString: string) {
        return this._httpClient.getData(this._securitySearchEndPoint + "?search=" + searchString);
    }

    searchSecurityFromOrionEclipse(searchString: string, securityStatus: string) {
        return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&status=' + securityStatus);
    }

    saveSecurity(securityId: number) {
        return this._httpClient.postData(this._securityEndPoint, { id: securityId });
    }

    updateSecurity(security: ISecurity) {
        return this._httpClient.updateData(this._securityEndPoint + "/" + security.id, security);
    }


    deleteSecurity(securityId: number) {
        return this._httpClient.deleteData(this._securityEndPoint + "/" + securityId);
    }

    getSecuritiesByCategory(id: number, securityStatus: string) {
        return this._httpClient.getData(this._securityEndPoint + "?assetCategoryId=" + id + '&status=' + securityStatus);
    }

    getSecuritiesByClass(id: number, securityStatus: string) {
        return this._httpClient.getData(this._securityEndPoint + "?assetClassId=" + id + '&status=' + securityStatus);
    }

    getSecuritiesBySubClass(id: number, securityStatus: string) {
        return this._httpClient.getData(this._securityEndPoint + "?assetSubClassId=" + id + '&status=' + securityStatus);
    }

    getSecurityStatusList() {
        return this._httpClient.getData(this._securityStatusEndPoint);
    }

    getSecurityPreferences(searchString: string) {
        let securityPref = <ISecurityPreference[]>[];
        securityPref.push(<ISecurityPreference>{
            id: 1, securityName: "Security Test",
            redemptionFeeTypeId: 1, redemptionFeeAmount: 40, redemptionFeeDays: 4, sellTradeMinAmtBySecurity: 100,
            sellTradeMinPctBySecurity: 20, buyTradeMinAmtBySecurity: 200, buyTradeMinPctBySecurity: 30, buyTradeMaxAmtBySecurity: 800,
            buyTradeMaxPctBySecurity: 60, sellTradeMaxAmtBySecurity: 900, sellTradeMaxPctBySecurity: 80,
            taxableAlternate: { id: 12, name: "Apple" },
            taxDeferredAlternate: { id: 14, name: "Intel" },
            taxExemptAlternate: { id: 12, name: "Apple" },
            taxableDivReInvest: true, taxDefDivReinvest: false, taxExemptDivReinvest: false,
            capGainReinvestTaxable: true, capGainsReinvestTaxDef: false, capGainsReinvestTaxExempt: true,
            sellTransactionFee: 1000, buyTransactionFee: 2000,
            custodianRedemptionFeeTypeId: 2,
            custodianRedemptionDays: 20,
            custodianRedemptionFeeAmount: 56, excludeHolding: true
        });
        securityPref.push(<ISecurityPreference>{
            id: 1, securityName: "Security Test 2",
            redemptionFeeTypeId: 2, redemptionFeeAmount: 40, redemptionFeeDays: 4, sellTradeMinAmtBySecurity: 100,
            sellTradeMinPctBySecurity: 20, buyTradeMinAmtBySecurity: 200, buyTradeMinPctBySecurity: 30, buyTradeMaxAmtBySecurity: 800,
            buyTradeMaxPctBySecurity: 60, sellTradeMaxAmtBySecurity: 900, sellTradeMaxPctBySecurity: 80,
            taxableAlternate: { id: 12, name: "Apple" },
            taxDeferredAlternate: { id: 13, name: "Google" },
            taxExemptAlternate: { id: 12, name: "Apple" },
            taxableDivReInvest: true, taxDefDivReinvest: false, taxExemptDivReinvest: false,
            capGainReinvestTaxable: true, capGainsReinvestTaxDef: false, capGainsReinvestTaxExempt: true,
            sellTransactionFee: 1000, buyTransactionFee: 2000,
            custodianRedemptionFeeTypeId: 2,
            custodianRedemptionDays: 20,
            custodianRedemptionFeeAmount: 90, excludeHolding: false
        });
        return securityPref;
    }

    getTaxalternates(searchString: string) {
        let alternate = <ISecuritySimple[]>[];
        alternate.push(<ISecuritySimple>{ id: 12, name: "Apple" });
        alternate.push(<ISecuritySimple>{ id: 13, name: "Google" });
        alternate.push(<ISecuritySimple>{ id: 14, name: "Intel" });
        alternate.push(<ISecuritySimple>{ id: 15, name: "Microsoft" });


        return alternate;
    }
    getYesOrNoValuesForPreferences() {
        this.yesOrNoOptions.push(
            { id: 'null',value: null, name: "Select" },
            { id: true, value: true, name: "Yes" },
            { id: false, value: false, name: "No" }

        );
        return this.yesOrNoOptions;
    }

    getCorporateActions() {
        let corp = <ICorporateActions[]>[];
        corp.push(<ICorporateActions>{ id: 12, corpActionType: "Stock Split", dynShareAllocation: 2, spinoff: null });
        corp.push(<ICorporateActions>{ id: 13, corpActionType: "Reverse Split", dynShareAllocation: 3, spinoff: null });
        corp.push(<ICorporateActions>{ id: 14, corpActionType: "Spin-Off", dynShareAllocation: 2, spinoff: "FB" });
        return corp;
    }

    /** To search sell securitites for trades */
    getSellSecurities(searchString: string, tradeFilterMethod: string, selectedIds: number[]) {
        if (tradeFilterMethod == 'portfolio')
            return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&portfolioIds=' + selectedIds.join());
        if (tradeFilterMethod == 'account')
            return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&accountIds=' + selectedIds.join());
        if (tradeFilterMethod == 'model')
            return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&modelIds=' + selectedIds.join());
        if (tradeFilterMethod == 'tradeGroupsForPortfolio')
            return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&tradeGroupsForPortfolioIds=' + selectedIds.join());
        if (tradeFilterMethod == 'tradeGroupsForAccount')
            return this._httpClient.getData(this._securityEndPoint + "?search=" + searchString + '&tradeGroupsForAccountId=' + selectedIds.join());
    }

}
