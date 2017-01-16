import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { BaseComponent } from '../core/base.component';
import { TokenHelperService } from '../core/tokenhelper.service';
import { LoginService } from './login.service';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user';
import { ILogin } from './login';

@Component({
    selector: 'community-login',
    templateUrl: './app/login/login.component.html',
   // providers: [LoginService, UserService]
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
    constructor(private _router: Router, private _loginService: LoginService, private _userService: UserService, private _tokenHelper: TokenHelperService) {
        super();
        // initialize the model
        this.token = <ILogin>{ isAuthenticated: false, access_token: null, expires_in: null };
    }

    /**
     * 
     * this method fires on login button click
     */
    onLogin() {
        this.errorMessage = '';
        this.showErrorMessage = false;       
        this._loginService.login(this.username, this.password)
            .map((response: Response) => <ILogin>response.json())          
            .subscribe(
            token => {
                this.token = token;
                this.token.isAuthenticated = true;
                this._tokenHelper.setAccessToken('accessTokenInfo', this.token);
                console.log('token :' + this._tokenHelper.getAccessToken('accessTokenInfo'));
                // load user data

                this._userService.getUser()
                    .map((response: Response) => <IUser>response.json())
                    .do(data => console.log('user All: ' + JSON.stringify(data)))
                    .subscribe(
                    user => {
                        this._tokenHelper.setAccessToken('user', user);
                        //console.log('user info :' + this._tokenHelper.getAccessToken('user'));
                        // redirects to dashboard page on successful login
                        this._router.navigate(['community/dashboard']);
                    },
                    error => {
                        console.log(this.errorMessage);
                     
                    });
            },
            error => {
                this.showErrorMessage = true;
                this.errorMessage = error.status == 401 ? 'Invalid credentials' : '';
              
                console.log("errorMessage: " + this.errorMessage);
                //throw error;
            }
            );
    }
}
