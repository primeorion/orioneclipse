import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CommunityComponent } from './community.component';
import { AuthGuard }             from './core/auth.guard';
import { AuthService }             from './core/auth.service';
import { RouterModule, Routes } from '@angular/router';
export const CommunityRoutes: Routes = [
    { path: 'community', redirectTo: 'community/dashboard', pathMatch: 'full' },
    {
        path: 'community',
        component: CommunityComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'administrator',
                loadChildren: '../../app/components/administrator/administrator.module#AdministratorModule',
                data: {
                    preload: true
                }
            },
            {
                path: 'overview',
                loadChildren: '../../app/components/overview/overview.module#OverviewModule',
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
                path: 'subscription',
                loadChildren: '../../app/components/subscription/subscription.module#SubscriptionModule',
                data: {
                    preload: true
                }
            }
        ]
    }
];

export const COMMUNITY_ROUTER_PROVIDERS = RouterModule.forChild(CommunityRoutes);
