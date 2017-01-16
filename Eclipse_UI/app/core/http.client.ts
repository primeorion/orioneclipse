import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SessionHelper } from '../core/session.helper';
import { ILogin } from '../login/login';
import { BrowserDomAdapter } from '@angular/platform-browser/src/browser/browser_adapter';

@Injectable()
export class HttpClient {
    private _accessTokenName = 'accessTokenInfo';
    private apiEndpoint: string;
    dom: BrowserDomAdapter;

    constructor(private _http: Http, private _sessionHelper: SessionHelper,
        @Inject('ApiEndpoint') private _apiEndpoint: string) {
        this.apiEndpoint = _apiEndpoint;
        this.dom = new BrowserDomAdapter();        
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

    getData(url: string) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        this.showSpinner();
        //console.log('From getData Authorization : ' + authHeaders.get('Authorization'));
       return this._http.get(this.getApiUrl(url), {
            headers: authHeaders
        }).map( res=> {
            this.hideSpinner();
            return res;
        }).catch( res =>{
            this.hideSpinner();
           return Observable.throw(res.json()); 
        });
    }
    
    postData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        this.showSpinner();
        return this._http.post(this.getApiUrl(url),  JSON.stringify(data), {
            headers: authHeaders
        }).map( res=> {
            this.hideSpinner();
            return res;
        }).catch( res =>{
            this.hideSpinner();
           return Observable.throw(res.json());
        });
    }

    updateData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        this.showSpinner();
        return this._http.put(this.getApiUrl(url), JSON.stringify(data), {
            headers: authHeaders
        }).map( res=> {
            this.hideSpinner();
            return res;
        }).catch( res =>{
            this.hideSpinner();
           return Observable.throw(res.json()); 
        });
    }

    patchData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        this.showSpinner();
        return this._http.patch(this.getApiUrl(url), data, {
            headers: authHeaders
        }).map( res=> {
            this.hideSpinner();
            return res;
        }).catch(res =>{
             this.hideSpinner();
             return Observable.throw(res.json());
        });
    }
    
    deleteData(url: string) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        this.showSpinner();
        return this._http.delete(this.getApiUrl(url), {
            headers: authHeaders
        }).map( res=> {
            this.hideSpinner();
            return res;
        }).catch( res =>{
            this.hideSpinner();
           return Observable.throw(res.json()); 
        });
    }
    
    /**
     * spinner methods
     */
    showSpinner() {
        this.dom.removeClass(this.dom.query("spinner"), "hide-spinner");
    }

    /**
     * spinner methods
     */
    hideSpinner() {
        this.dom.addClass(this.dom.query("spinner"), "hide-spinner");
    }
    
}
