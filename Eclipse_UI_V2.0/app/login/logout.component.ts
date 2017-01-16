import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../core/base.component';
import { LoginService } from './login.service';

@Component({
    selector: 'eclipse-logout',
    templateUrl: './app/login/logout.component.html',
    providers: [LoginService],
})
export class LogoutComponent extends BaseComponent {
    constructor(private _loginService: LoginService, private _router: Router) {
        super();
        //this.showSpinner();
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
        this._sessionHelper.removeAll();
        // console.log('token :' + this._sessionHelper.get('accessToken'));
        // redirects to dashboard page on successful login
        this._router.navigate(['/login']);
    }

}
