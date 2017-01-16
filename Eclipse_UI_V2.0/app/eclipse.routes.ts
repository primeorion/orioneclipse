import { RouterModule, Routes } from '@angular/router';
import { SessionHelper } from './core/session.helper';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { EclipseComponent } from './eclipse.component';
import { OverviewComponenet } from './components/dashboard/overview.component';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { ConfirmDeactivateGuard } from './components/portfolio/shared/confirm.deactivatedguard';
import { DataQueriesComponenet } from './components/querybuilder/dataqueries/dataqueries.component';
export const EclipseRoutes: Routes = [
    { path: 'eclipse', redirectTo: 'eclipse/dashboard', pathMatch: 'full' },
    {
        path: 'eclipse',
        component: EclipseComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'dashboard', component: OverviewComponenet },
            {
                path: 'sleeve',
                loadChildren: '../../app/components/sleeve/sleeve.module#SleeveModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'admin',
                loadChildren: '../../app/components/admin/admin.module#AdminModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'model',
                loadChildren: '../../app/components/model/model.module#ModelModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'portfolio',
                loadChildren: '../../app/components/portfolio/portfolio.module#PortfolioModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'account',
                loadChildren: '../../app/components/account/account.module#AccountModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'security',
                loadChildren: '../../app/components/security/security.module#SecurityModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'holding',
                loadChildren: '../../app/components/holding/holding.module#HoldingModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'tradeorder',
                loadChildren: '../../app/components/tradeorder/tradeorder.module#ToMModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'rebalance',
                loadChildren: '../../app/components/rebalance/rebalance.module#RebalanceModule',
                data: {
                    preload: true
                }
            },
            { path: 'querybuilder', component: DataQueriesComponenet }
        ]
    }
];

export const AUTH_PROVIDERS = [AuthGuard, AuthService, ConfirmDeactivateGuard];
export const DASHBOARD_ROUTER_PROVIDERS = [RouterModule.forChild(EclipseRoutes), SessionHelper];
