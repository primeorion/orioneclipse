//import { provideRouter, RouterConfig } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CommunityComponent } from './community.component';
//import { LOGIN_SERVICE_PROVIDERS } from  './login/login.routes';
import { CommunityRoutes } from  './community.routes';
import { LogoutComponent } from './login/logout.component';
//routing module-instead of RouterConfig and providerRouter
import { RouterModule, Routes } from '@angular/router';
export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    ...CommunityRoutes
];
export const APP_ROUTER_PROVIDERS = RouterModule.forRoot(routes);
    

