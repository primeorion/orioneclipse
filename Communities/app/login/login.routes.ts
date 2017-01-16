//import { provideRouter, RouterConfig } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { TokenHelperService } from '../core/tokenhelper.service';
import { LoginService } from './login.service';
import { UserService } from '../services/user.service';
import { LoginComponent } from './login.component';

export const LoginRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    }];

export const LOGIN_SERVICE_PROVIDERS = [
    LoginService, UserService, TokenHelperService
];
