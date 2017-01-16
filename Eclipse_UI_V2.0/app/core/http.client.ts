import { Injectable, Inject, ElementRef,Optional } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SessionHelper } from '../core/session.helper';
import { ILogin } from '../login/login';
import { DOCUMENT } from '@angular/platform-browser';
import 'rxjs/Rx';
import {CustomSubService} from '../core/customSubService';

@Injectable()
export class HttpClient {
    private _accessTokenName = 'accessTokenInfo';
    private apiEndpoint: string;
    private dom;
    private requestCounter : number = 0;

    _subService: CustomSubService
    constructor(private _http: Http, private _sessionHelper: SessionHelper, subService: CustomSubService,
        @Inject('ApiEndpoint') private _apiEndpoint: string) {
        this.apiEndpoint = _apiEndpoint;
        this.dom = DOCUMENT;
        this._subService = subService;
    }

    createAuthorizationHeader(headers: Headers) {
        var accessToken = this._sessionHelper.get<ILogin>(this._accessTokenName);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Session ' + accessToken.eclipse_access_token);
        //console.log('From createAuthorizationHeader Authorization : ' + headers.get('Authorization'));
    }

    /** 
     * append host url to given path and returns  
     */
    getApiUrl(route): string {
        return this.apiEndpoint + "" + route;
    }

    getData(url: string,showProgress?:boolean) {

        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        // this.showSpinner();
        return this.intercept(this._http.get(this.getApiUrl(url), {
            headers: authHeaders
        }).map(res => {
            //this.hideSpinner();
            return res;
        }).catch(res => {
            // this.hideSpinner();
            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
        //console.log('From getData Authorization : ' + authHeaders.get('Authorization'));
    }


    login(url: string, data: Headers) {
        let authHeaders = data;
        return this.intercept(this._http.get(url, { headers: authHeaders }));
    }


    postData(url: string, data,showProgress?:boolean) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);

        return this.intercept(this._http.post(this.getApiUrl(url), JSON.stringify(data), {
            headers: authHeaders
        }).map(res => {
            return res;
        }).catch(res => {
            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
    }

    updateData(url: string, data,showProgress?:boolean) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this.intercept(this._http.put(this.getApiUrl(url), JSON.stringify(data), {
            headers: authHeaders
        }).map(res => {
            return res;
        }).catch(res => {
            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
    }

    patchData(url: string, data,showProgress?:boolean) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);

        return this.intercept(this._http.patch(this.getApiUrl(url), data, {
            headers: authHeaders
        }).map(res => {
            return res;
        }).catch(res => {
            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
    }

    deleteData(url: string,showProgress?:boolean) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);

        return this.intercept(this._http.delete(this.getApiUrl(url), {
            headers: authHeaders
        }).map(res => {

            return res;
        }).catch(res => {

            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
    }
    /**
     * Intercepting to show/hide spinner
     */
    intercept(observable: Observable<Response>,showProgress:boolean=true): Observable<Response> {
        if(showProgress){
            this.requestCounter++;
            this._subService.beforeRequest.emit(this.requestCounter);
        }
        return observable.do(() => {if(showProgress) this.requestCounter--; this._subService.afterRequest.emit(this.requestCounter);},
            err => {if(showProgress) this.requestCounter--; this._subService.afterRequest.emit(this.requestCounter);});
        
    }

    /**  */
    uploadFile(url: string, formData: FormData): Observable<any> {
        return Observable.create(observer => {
            var accessToken = <ILogin>this._sessionHelper.getAccessToken(this._accessTokenName);
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            }
            xhr.open("POST", this.getApiUrl(url), true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Authorization', 'Session ' + accessToken.eclipse_access_token)
            this._subService.beforeRequest.emit("beforeRequestEvent");
            xhr.send(formData);
        }).do(() => this._subService.afterRequest.emit("afterRequestEvent"),
            err => this._subService.afterRequest.emit("afterRequestEvent"));;
    }
    
    getRebalancerLogFile(url: string,showProgress?:boolean){
        return this.intercept(this._http.get(url, {
        }).map(res => {
            return res;
        }).catch(res => {
            return Observable.throw(res.json());
        }),showProgress==undefined?true:showProgress);
    }
}
