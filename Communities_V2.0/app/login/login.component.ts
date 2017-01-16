import { Component, ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../core/base.component';
import { TokenHelperService } from '../core/tokenhelper.service';
import { LoginService } from './login.service';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user';
import { ICommunityUser } from '../models/community.user';
import { ILogin } from './login';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
    selector: 'community-login',
    templateUrl: './app/login/login.component.html',
    // providers: [LoginService, UserService]
})
export class LoginComponent extends BaseComponent {
    /**
     * ng-models
     */
    errorMessage: string;
    showErrorMessage: boolean;
    token: ILogin;
    loginForm: FormGroup;
    private authenticationError: string = '';
    /**
     * Contructor
     */
    constructor(fb: FormBuilder, private _router: Router, private activateRoute: ActivatedRoute, private _loginService: LoginService, private _userService: UserService) {
        super();

        this.activateRoute.params.subscribe(params => {

            if (params['id'] != undefined && params['id'] == 0)
                this.authenticationError = "Authentication failed. Please try again.";
            if (params['id'] != undefined && params['id'] == 1)
                this.authenticationError = "Invalid URL. Please try again.";            
        });
        // initialize the model
        this.token = <ILogin>{ isAuthenticated: false, access_token: null, expires_in: null };
        this.loginForm = fb.group({
            'username': [null, Validators.required],
            'password': [null, Validators.required],
        })
    }

    /**
     * 
     * this method fires on login button click
     */
    onLogin(value: any) {
        this.errorMessage = '';
        this.showErrorMessage = false;
        this._loginService.login(value.username, value.password)
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
                        if (user.roleId == RoleType.SuperAdmin) {
                            this._router.navigate(['community/administrator/dashboard']);
                        }
                        else if (user.roleId == RoleType.StrategistAdmin || user.roleId == RoleType.StrategistUser) {
                            this._router.navigate(['community/overview/firm']);
                        }
                        //this._router.navigate(['community/dashboard']);
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
