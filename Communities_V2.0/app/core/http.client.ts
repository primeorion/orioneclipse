import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TokenHelperService } from './tokenhelper.service';
import { ILogin } from '../login/login';
import 'rxjs/add/operator/share';
import { CustomSubService } from '../core/customSubService';

@Injectable()
export class HttpClient {
    private _accessTokenName = 'accessTokenInfo';
    private apiEndpoint: string;
    _subService: CustomSubService;

    constructor(private _http: Http, private _tokenHelper: TokenHelperService,
        @Inject('ApiEndpoint') private _apiEndpoint: string, subService: CustomSubService) {
        this.apiEndpoint = _apiEndpoint;
        this._subService = subService;
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
            headers: authHeaders, body: ""
        })
    }
    postData(url: string, data) {
        let authHeaders = new Headers();
        this.createAuthorizationHeader(authHeaders);
        return this._http.post(this.getApiUrl(url), JSON.stringify(data), {
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
            headers: authHeaders
        })
    }

    uploadFile(url: string, formData: FormData, methodType = ""): Observable<any> {
        return Observable.create(observer => {
            var accessToken = <ILogin>this._tokenHelper.getAccessToken(this._accessTokenName);
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
            if (methodType != "")
                xhr.open("PUT", this.getApiUrl(url), true);
            else
                xhr.open("POST", this.getApiUrl(url), true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Authorization', 'Session ' + accessToken.community_access_token)
            this._subService.beforeRequest.emit("beforeRequestEvent");
            xhr.send(formData);
        }).do(() => this._subService.afterRequest.emit("afterRequestEvent"),
            err => this._subService.afterRequest.emit("afterRequestEvent"));;

    }
} 