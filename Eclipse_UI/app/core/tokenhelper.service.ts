import { Injectable } from '@angular/core';

export class TokenHelperService {
    private storage: Storage;


    constructor() {
        this.storage = sessionStorage;
    }
    
    /**
    * returns access token for the given key
    */

    getAccessToken(key: string): any {
        var item = this.storage.getItem(key);
        if (item && item !== 'undefined') {
            return JSON.parse(this.storage.getItem(key));
        }
        return;
    }

    setAccessToken(key: string, value: any) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    isAuthenticated() {
        var token = JSON.parse(this.storage.getItem('accessTokenInfo'));
        return token != undefined && token != null && token.isAuthenticated
    }
    
    getUser<T>() {
        var user = JSON.parse(this.storage.getItem('user'));
        return user != undefined && user != null ? <T>user : null;
    }

    removeAll() {
        this.storage.clear();
    }
}
