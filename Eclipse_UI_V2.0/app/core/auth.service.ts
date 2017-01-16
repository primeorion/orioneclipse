import { Injectable } from '@angular/core';
import { SessionHelper } from '../core/session.helper';

@Injectable()
export class AuthService {
    isLoggedIn: boolean = false;

    constructor(private _sessionHelper: SessionHelper) {
        this.isLoggedIn = _sessionHelper.isAuthenticated();
    }
}
