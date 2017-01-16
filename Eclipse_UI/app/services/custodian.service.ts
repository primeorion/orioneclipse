import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ICustodian, ISecurity, ITradeExecutionType } from '../models/custodian';

@Injectable()
export class CustodianService {

    private _custodianEndPoint = 'admin/custodians';
    private _securityTypesEndPoint = 'security/securities/securitytype';
    private _tradeExetypesEndPoint = 'tradeorder/trades/tradeExecutionType';

    constructor(private _httpClient: HttpClient) { }

    /** Get security types */
    getSecurityTypes() {
        return this._httpClient.getData(this._securityTypesEndPoint)
    }

    /** Get trade execution types */
    getTradeExecutionTypes() {
        return this._httpClient.getData(this._tradeExetypesEndPoint);
    }

    /** Get custodians */
    getCustodians() {
        return this._httpClient.getData(this._custodianEndPoint);
    }

    /** Load custodian details by custodianId */
    getCustodianById(custodianId: number) {
        return this._httpClient.getData(this._custodianEndPoint + "/" + custodianId);
    }

    /** Delete custodian by id */
    deleteCustodian(custodianId: number) {
        return this._httpClient.deleteData(this._custodianEndPoint + "/" + custodianId);
    }

    /** Update custodian */
    updateCustodian(custodianId: number, custodian: any) {
        return this._httpClient.updateData(this._custodianEndPoint + "/" + custodianId, custodian);
    }

    /** Custodian search for auto complete */
    custodianSearch(searchString: string) {
        return this._httpClient.getData(this._custodianEndPoint + '?search=' + searchString)
    }

    /** Get custodian accounts */
    getCustodianAccounts(custodianId: number) {
        return this._httpClient.getData(this._custodianEndPoint + '/' + custodianId + '/accounts');
    }

    searchCustodian(searchString: string) {
        return this._httpClient.getData(this._custodianEndPoint + "?search=" + searchString);
    }

    /** Get custodian summary */
    getCustodianSummary() {
        return this._httpClient.getData(this._custodianEndPoint + "/summary");
    }
}
