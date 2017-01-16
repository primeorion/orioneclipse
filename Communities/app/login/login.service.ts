import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ILogin } from './login';
import { HttpClient } from '../core/http.client';

@Injectable()
export class LoginService {

    private _loginEndPoint = 'admin/Token';
    private _logoutEndPoint = 'admin/logout';

    constructor(private _http: Http, private _httpClient: HttpClient, @Inject('ApiEndpoint') private _apiEndpoint: string) { }

    login(username: string, password: string) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders, username, password);
        console.log('_loginEndPoint: ' + this._apiEndpoint + this._loginEndPoint);

        return this._http.get(this._apiEndpoint + this._loginEndPoint, { headers: authHeaders, body: "" });
    }
    
    logout() {
        return this._httpClient.getData(this._logoutEndPoint);
    }

    /**
     * Creates autherization header
     */
    createAuthorizationHeader(headers: Headers, username: string, password: string) {
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
        console.log('Authorization : ' + headers.get('Authorization'))
    }
}