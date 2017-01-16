import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ILoginAs } from '../models/loginas';

@Injectable()
export class LoginAsService {
     private _loginAsEndPoint = 'admin/token/loginas';
     private _revertLoginAsEndPoint = 'admin/token/loginas/revert';

    constructor(private _httpClient: HttpClient) { }

    /**To Post LoginAs information */
    loginAs(data:ILoginAs){
        return this._httpClient.postData(this._loginAsEndPoint,data);
    }

    /**To get the revert login as Response */
    revertLoginAs(){
        return this._httpClient.getData(this._revertLoginAsEndPoint);
    }
}