import { Injectable } from '@angular/core';
import { TokenHelperService } from '../core/tokenhelper.service';

@Injectable()
export class AuthService {
    isLoggedIn: boolean = false;

    constructor(private _tokenHelper: TokenHelperService) {
        this.isLoggedIn = _tokenHelper.isAuthenticated();
    }
}
