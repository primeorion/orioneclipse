import { RouterModule, Routes } from '@angular/router';
import { LoginService } from './login.service';
import { UserService } from '../services/user.service';
import { LoginComponent } from './login.component';

export const LoginRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    }];

export const LOGIN_SERVICE_PROVIDERS = [LoginService, UserService];
