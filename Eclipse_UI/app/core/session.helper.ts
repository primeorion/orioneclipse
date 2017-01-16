import { Injectable } from '@angular/core';
import { ILogin, IUser, IRole, IRolePrivilege } from '../models/user.models';

export class SessionHelper {
    private _storage: Storage;
    private _tokenKey: string = 'accessTokenInfo';

    constructor() {
        this._storage = sessionStorage;
    }

    set(key: string, value: any) {
        this._storage.setItem(key, JSON.stringify(value));
    }

    get<T>(key: string): T {
        var item = this._storage.getItem(key);
        if (!item || item == 'undefined' || item == null) return null;
        return <T>JSON.parse(item);
    }

    getUser() {
        var user = this._storage.getItem('user');
        if (!user || user == 'undefined' || user == null) return null;
        return <IUser>JSON.parse(user);
        //var user = JSON.parse(this._storage.getItem('user'));
        //return user != undefined && user != null ? <T>user : null;
    }

    getPrivileges(hasAccess: boolean = false, contains: string = '') {
        let permissions = this.get<IRole>('role').privileges;
        if (hasAccess) {
            return permissions.filter(m => (contains == '' || m.code.indexOf(contains) > 0)
                && (m.canAdd || m.canDelete || m.canRead || m.canUpdate));
        }
        return permissions;
    }

    isAuthenticated() {
        var token = this._storage.getItem('accessTokenInfo');
        if (!token || token == 'undefined' || token == null) return false;
        return JSON.parse(token).isAuthenticated;
    }

    removeAll() {
        this._storage.clear();
    }

    public isTokenExpired(token?: string, offsetSeconds?: number) {
        var expiresIn = this.get<ILogin>(this._tokenKey).expires_in;
        var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(expiresIn);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return false;
        }
        // Token expired?
        return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    }

    /** Role Helper Methods */

    /**
     * get permission by given privilege code 
     */
    getPermission(privilegeCode: string): IRolePrivilege {
        let permissions = this.get<IRole>('role').privileges;
        if (permissions == null) return undefined;
        permissions = permissions.filter(pri => pri.code.toUpperCase() == privilegeCode.toUpperCase());
        return (permissions.length > 0) ? permissions[0] : undefined;
    }

}
