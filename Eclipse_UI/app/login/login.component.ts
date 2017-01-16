import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { BaseComponent } from '../core/base.component';
import { LoginService } from './login.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { IUser, IRole } from '../models/models';
import { ILogin } from './login';

@Component({
    selector: 'eclipse-login',
    templateUrl: './app/login/login.component.html',
    providers: [LoginService, UserService, RoleService]
})
export class LoginComponent extends BaseComponent {
    /**
     * ng-models
     */
    username: string = '';
    password: string = '';
    errorMessage: string;
    showErrorMessage: boolean;
    token: ILogin;

    /**
     * Contructor
     */
    constructor(private _router: Router, private _loginService: LoginService,
        private _userService: UserService, private _roleService: RoleService) {
        super();
        // initialize the model
        this.token = <ILogin>{ isAuthenticated: false, access_token: null, expires_in: null };
    }

    /**
     * this method fires on login button click
     */
    onLogin() {
        this.errorMessage = '';
        this.showErrorMessage = false;
        //this.showSpinner();
        this.responseToObject<ILogin>(this._loginService.login(this.username, this.password))
            .subscribe(token => {
                this.token = token;
                this.token.isAuthenticated = true;
                this._sessionHelper.set('accessTokenInfo', this.token);
                /** load user data */
                this.responseToObject<IUser>(this._userService.getUser())
                    .subscribe(user => {
                        if (user.role != null && user.role != undefined) {
                            this._sessionHelper.set('user', user);
                            // console.log("user: " + JSON.stringify(user));
                            this._sessionHelper.set('role', user.role);
                            // console.log('role info :' + JSON.stringify(this._sessionHelper.get<IRole>('role')));
                            // redirects to dashboard page on successful login
                            this._router.navigate(['eclipse/dashboard']);
                        } else {
                            this.showErrorMessage = true;
                            this.errorMessage = 'You do not have permissions to login';
                            this.hideSpinner();
                        }
                    },
                    error => {
                        console.log(this.errorMessage);
                       // this.hideSpinner();
                    });
            },
            error => {
                this.showErrorMessage = true;
                //this.errorMessage = error.status == 401 ? 'Invalid credentials' : '';
               // this.hideSpinner();
                console.log("errorMessage: " + this.errorMessage);
                //throw error;
            });
    }
}
