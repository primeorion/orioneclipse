import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenHelperService } from './tokenhelper.service';
import { ILogin } from '../login/login';

@Injectable()
export class HttpClient {
    private _accessTokenName = 'accessTokenInfo';
    private apiEndpoint: string;

    constructor(private _http: Http, private _tokenHelper: TokenHelperService,
        @Inject('ApiEndpoint') private _apiEndpoint: string) {
        this.apiEndpoint = _apiEndpoint;
    }

    createAuthorizationHeader(headers: Headers) {
        var accessToken = <ILogin>this._tokenHelper.getAccessToken(this._accessTokenName);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Session ' + accessToken.community_access_token);
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
        //console.log('From getData Authorization : ' + authHeaders.get('Authorization'));
        return this._http.get(this.getApiUrl(url), {
            headers: authHeaders,body:""
        })
    }
    postData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this._http.post(this.getApiUrl(url),  JSON.stringify(data), {
            headers: authHeaders
        })
    }

    updateData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this._http.put(this.getApiUrl(url), JSON.stringify(data), {
            headers: authHeaders
        })
    }

    patchData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this._http.patch(this.getApiUrl(url), data, {
            headers: authHeaders
        })
    }
    deleteData(url: string) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this._http.delete(this.getApiUrl(url), {
            headers: authHeaders,body:""
        })
    }
} 