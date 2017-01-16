import { provideRouter, RouterConfig } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LOGIN_SERVICE_PROVIDERS } from  './login/login.routes';
import { DASHBOARD_ROUTER_PROVIDERS, AUTH_PROVIDERS, EclipseRoutes } from  './eclipse.routes';
import { LogoutComponent } from './login/logout.component';
import { NotAuthorizedComponent } from './shared/notauthorized/notauthorized.component';
import { NotFoundComponent } from './shared/notfound/notfound.component';

export const routes: RouterConfig = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    ...EclipseRoutes,
    { path: 'notauthorized', component: NotAuthorizedComponent },
    { path: '**', component: NotFoundComponent }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes),
    AUTH_PROVIDERS
];
