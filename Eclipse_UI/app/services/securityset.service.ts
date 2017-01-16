import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ISecuritySet } from '../models/securitySet';

@Injectable()
export class SecuritySetService {
    
     private _securitySetEndPoint = 'security/securityset';    
     private _sellPriorityEndPoint = 'security/securityset/sellpriority';
     private _buyPriorityEndPoint = 'security/securityset/buypriority';
     constructor(private _httpClient: HttpClient ) { }
     
    getSecuritySetData() {
        return this._httpClient.getData(this._securitySetEndPoint);
    }
    
    deleteSecuritySet(securitySetId: number){
        return this._httpClient.deleteData(this._securitySetEndPoint  + "/" + securitySetId);
    }
    
    getSecuritySetDetail(id: number){
        return this._httpClient.getData(this._securitySetEndPoint + "/" + id);
    }
    
    saveSecuritySet(securitySet: ISecuritySet){
        return this._httpClient.postData(this._securitySetEndPoint, securitySet);
    }
    
    updateSecuritySet(securityset: ISecuritySet){
        return this._httpClient.updateData(this._securitySetEndPoint + "/" + securityset.id, securityset);
    }
    
    getSellPriorityList(){
         return this._httpClient.getData(this._sellPriorityEndPoint);
    }
    
    getBuyPriorityList(){
         return this._httpClient.getData(this._buyPriorityEndPoint);
    }
    
    searchSecuritySet(searchString: string){
        return this._httpClient.getData(this._securitySetEndPoint + "?search=" + searchString);
    }
}

