import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenHelperService } from '../core/tokenhelper.service';
import { LoginService } from './login.service';

@Component({
    selector: 'community-logout',
    templateUrl: './app/login/logout.component.html',
    providers: [LoginService],
})
export class LogoutComponent {
    constructor(private _loginService: LoginService, private _router: Router, private _tokenHelper: TokenHelperService) {
    }

    ngOnInit() { this.logoff(); }

    /**
     * this method fires when we log off
     */
    logoff() {
        this._loginService.logout().subscribe(response => {
            this.clearSession();
        },
        error => {
            this.clearSession();
        });
    }

    private clearSession(){
        this._tokenHelper.removeAll();
        console.log('token :' + this._tokenHelper.getAccessToken('accessToken'));
        // redirects to dashboard page on successful login
        this._router.navigate(['/login']);
    }

}
