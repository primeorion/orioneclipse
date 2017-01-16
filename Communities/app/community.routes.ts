import { DashboardComponenet } from './components/dashboard/dashboard.component';
import { CommunityComponent } from './community.component';
import { AuthGuard }             from './core/auth.guard';
import { AuthService }             from './core/auth.service';
import { RouterModule, Routes } from '@angular/router';
export const CommunityRoutes: Routes = [
    { path: 'community', redirectTo: 'community/dashboard', terminal: true },
    {
        path: 'community',
        component: CommunityComponent,
        canActivate: [AuthGuard],
        loadChildren: '../../app/components/component.module#ComponentModule'
    }
    
];
export const COMMUNITY_ROUTER_PROVIDERS = RouterModule.forChild(CommunityRoutes);
