import { provideRouter, RouterConfig } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { AccountService } from '../../services/account.service';
import { AccountComponent } from './account.component';
import { AccountDashboardComponent }  from './dashboard/dashboard.component';
import { AccountListComponent }  from './list/accountlist.component';
import { AccountViewComponent }  from './view/accountview.component';
import { AccountFilterComponent }  from './list/accountfilter.component';
import { ConfirmDeactivateGuard } from '../portfolio/shared/confirm.deactivatedguard';


export const AccountRoutes: RouterConfig = [
    { path: 'account', redirectTo: 'account/dashboard', terminal: true },
    {
        path: 'account',
        component: AccountComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'dashboard', component: AccountDashboardComponent },
            { path: 'list', component: AccountListComponent, canDeactivate: [ConfirmDeactivateGuard] },
            { path: 'list/:id', component: AccountListComponent },
            { path: 'filter/:id', component: AccountFilterComponent },
            { path: 'view', component: AccountViewComponent },
            { path: 'view/:id', component: AccountViewComponent },
            { path: 'search/:id', component: AccountFilterComponent }
        ]
    }
];

export const ACCOUNT_ROUTER_PROVIDERS = [
    provideRouter(AccountRoutes), AccountService
];
