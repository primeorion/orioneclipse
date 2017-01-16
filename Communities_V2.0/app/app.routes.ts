import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthorizeComponent } from './login/authorize.component'
import { CommunityComponent } from './community.component';
import { CommunityRoutes } from './community.routes';
import { LogoutComponent } from './login/logout.component';
import { PreloadSelectedModules } from './core/module.preload.strategy';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'login/:id', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'authorize/:accessToken/:navigateTo',  component: AuthorizeComponent },
    { path: 'authorize/:accessToken/:navigateTo/:id',  component: AuthorizeComponent },
    
    ...CommunityRoutes
];

export const APP_ROUTER_PROVIDERS = RouterModule.forRoot(routes, { preloadingStrategy: PreloadSelectedModules });
