import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LOGIN_SERVICE_PROVIDERS } from './login/login.routes';
import { DASHBOARD_ROUTER_PROVIDERS, EclipseRoutes } from './eclipse.routes';
import { LogoutComponent } from './login/logout.component';
import { NotAuthorizedComponent } from './shared/notauthorized/notauthorized.component';
import { NotFoundComponent } from './shared/notfound/notfound.component';
import { PreloadSelectedModules } from './core/module.preload.strategy';
import{LoginAsComponent} from './login/loginAs.component'

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    {path:'loginAs',component:LoginAsComponent},
    ...EclipseRoutes,
    { path: 'notauthorized', component: NotAuthorizedComponent },
    { path: '**', component: NotFoundComponent }
];
export const APP_ROUTER_PROVIDERS = [RouterModule.forRoot(routes,
    { preloadingStrategy: PreloadSelectedModules })];
