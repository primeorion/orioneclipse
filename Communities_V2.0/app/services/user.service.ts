import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IUser } from '../models/user';
import {IUserProfile } from '../models/community.user';

@Injectable()
export class UserService {
    private _userEndPoint = '/admin/Users';
    private _connectUsersSearchEndPoint = '/admin/Users/connect';
    private _strategistUserEndPoint = 'community/strategists';
    private _communityUserEndPoint = 'community/users';
    private _updateUserEndPoint = 'community/strategists/user/';


    constructor(private _httpClient: HttpClient) { }

    getUser() {
        return this._httpClient.getData('community/users/detail');
    }

    getOrionUsers(id: string) {
        return this._httpClient.getData(this._connectUsersSearchEndPoint + "/" + id);
    }

    getCommunityUsers() {
        return this._httpClient.getData(this._communityUserEndPoint);
    }

    deleteUser(userId: number, strategistId: number) {
        return this._httpClient.deleteData(this._strategistUserEndPoint + "/" + strategistId + "/" + userId + "/user");
    }

    getUserDetail(id) {
        return this._httpClient.getData(this._communityUserEndPoint + "/" + id);
    }

    updateUserRole(updatedRole: number, userId: number, eclipseDatabaseId: number, strategistId: number) {

        if (updatedRole == RoleType.SuperAdmin) {
            let data = { "roleId": updatedRole, "eclipseDatabaseId": eclipseDatabaseId };
            return this._httpClient.updateData(this._updateUserEndPoint + userId, data);
        }
        else {
            let data = { "roleId": updatedRole, "id": strategistId }
            return this._httpClient.updateData(this._updateUserEndPoint + userId, data);
        }
    }
    addUserToCommunity(user: IUser) {

        return this._httpClient.postData(this._communityUserEndPoint, user);
    }
    uploadUserProfileLogoAndName(file:IUserProfile ) {
        var formData: any = new FormData();
        formData.append("logo", file.logo);
        formData.append("name", file.name);
        return this._httpClient.uploadFile(this._communityUserEndPoint, formData,"put");
    }
}
