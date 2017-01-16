import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {IUser, ICustomUser} from '../models/user';

@Injectable()
export class UserService {
    private _userEndPoint = 'admin/Users';
    private _usersummaryEndPoint = this._userEndPoint + '/summary';
    private _connectUsersSearchEndPoint = 'admin/Users/connect';

    constructor(private _httpClient: HttpClient) { }

    /** Get user summary count */
    getUserSummary() {
        return this._httpClient.getData(this._usersummaryEndPoint);
    }

    getUser() {
        return this._httpClient.getData('admin/authorization/user');
    }

    getOrionUsers(id: string) {
        return this._httpClient.getData(this._connectUsersSearchEndPoint + "/" + id);
    }

    /** Get user by Id */
    getUsers() {
        return this._httpClient.getData(this._userEndPoint);
    }

    /** Get user by Id */
    getUserById(userId: number) {
        return this._httpClient.getData(this._userEndPoint + "/" + userId);
    }

    /** To create user */
    createUser(user: any) {
        console.log('Add User Model: ', user);
        return this._httpClient.postData(this._userEndPoint, user);
    }

    /** To delete user */
    deleteUser(userId: number) {
        return this._httpClient.deleteData(this._userEndPoint + "/" + userId);
    }

    /** To search user */
    searchUser(searchString: string) {
        return this._httpClient.getData(this._userEndPoint + "?search=" + searchString);
    }

    /** Update a user */
    updateUser(userId: number, user: any) {
        return this._httpClient.updateData(this._userEndPoint + "/" + userId, user);
    }

}
