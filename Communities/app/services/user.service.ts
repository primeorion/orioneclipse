import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IUser } from '../models/user';

@Injectable()
export class UserService {
    private _userEndPoint = '/admin/Users';
    private _connectUsersSearchEndPoint = '/admin/Users/connect';

    constructor(private _httpClient: HttpClient) { }

    getUser() {
        return this._httpClient.getData('admin/authorization/user');
    }

    getOrionUsers(id: string) {
        return this._httpClient.getData(this._connectUsersSearchEndPoint + "/" + id);
    }

}
