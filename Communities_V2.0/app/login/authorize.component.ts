import { Component } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import * as Util from '../core/functions';
import { UserService } from '../services/user.service';
import { LoginService } from './login.service';

import { IUser } from '../models/user';
import { ILogin } from './login';
import { TokenHelperService } from '../core/tokenhelper.service';

@Component({
    selector: 'authorize-component',
    templateUrl: './app/login/authorize.component.html'
})
export class AuthorizeComponent {
    private token: ILogin;
    private user: IUser = <IUser>{};
    private userId: number;
    private connectAccessToken: string;
    private navigateTo: string;
    private errorMessage: string;
    private targetId : string;

    constructor(private _userService: UserService, private _loginService: LoginService,
        private _router: Router, private activateRoute: ActivatedRoute, private _tokenHelper: TokenHelperService) {

        this.activateRoute.params.subscribe(params => {

            if (params['accessToken'] != undefined)
                this.connectAccessToken = params['accessToken'];
            if (params['navigateTo'] != undefined)
                this.navigateTo = params['navigateTo'];
            if (params['id']!= undefined)
                this.targetId = params['id'];
        });
    }

    ngOnInit() {
        console.log("2");
        if (this.connectAccessToken != undefined) {
            this.validateAccessToken();
        }
    }

    validateAccessToken() {

        //Validate target url here
        if (this.navigateTo != undefined) {

            this._loginService.AuthorizeOrionConnectToken(this.connectAccessToken)
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
                        .do(data => console.log('User data from community: ' + JSON.stringify(data)))
                        .subscribe(
                        user => {
                            this._tokenHelper.setAccessToken('user', user);
                            //Flag - Subscription menu access to the users logged in from Eclipse application.
                            this._tokenHelper.setAccessToken('EclipseUser', true);
                            
                            // redirects to targetURL on successful login
                            if (this.navigateTo == "subscription")
                                this._router.navigate(['community/subscription/profiles']);
                            else if(this.navigateTo == "strategist")
                            {   
                                //Flag - Subscription menu access to the users logged in from Eclipse application.
                                this._tokenHelper.setAccessToken('EclipseUser', false);//Setting false value to give access only to strategist role
                                if(this.targetId != undefined)
                                    this._router.navigate(['community/administrator/strategist/view', +this.targetId]);
                                else
                                    this._router.navigate(['/login/1']);
                            }
                            else {
                                this._router.navigate(['/login/1']);
                            }
                        },
                        error => {
                            console.log("Error while authorizing");
                            this._router.navigate(['/login/0']);
                        });
                },
                error => {

                    this.errorMessage = error.status == 401 ? 'Invalid credentials' : '';

                    console.log("errorMessage: " + this.errorMessage);
                    this._router.navigate(['/login/0']);
                    //throw error;
                }
                );
        }
        else {            
            this._router.navigate(['/login/1']);
        }
    }
}
