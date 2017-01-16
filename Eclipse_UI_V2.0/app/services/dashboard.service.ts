import { Component } from '@angular/core';
import { HttpClient } from '../core/http.client';


@Component({

    providers: [HttpClient]

})


export class DashboardService {

    post_import = 'postimport/post_import_analysis';
    donutchartAPI = 'dashboard/main/summary';
    newFullImportEndPoint='dataimport/action/initiatefull';
    newPartialImportEndPoint='dataimport/action/initiatepartial';
    constructor(private _httpClient: HttpClient) { }

    getDashboardsummary() {
        return this._httpClient.getData(this.donutchartAPI);
    }

    getimportData() {
        return this._httpClient.getData(this.post_import);
    }


    /** TODO: 
     * YET TO PLUGIN THE SERVICES ONCE APIs ARE IMPLEMENTED 
     **/

    /** Refresh Analytics */
    refreshAnalytics() {

    }

    /** Initiate new Full Import */
    initiateNewFullImport() {
        return this._httpClient.postData(this.newFullImportEndPoint,{});
    }

    /** Initiate new Partial Import */
    initiateNewPartialImport() {
        return this._httpClient.postData(this.newPartialImportEndPoint,{});
    }

}