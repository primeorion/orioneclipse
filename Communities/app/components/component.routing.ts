import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { DashboardComponenet } from './dashboard/dashboard.component';

export const componentRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponenet },
    { path: 'administrator', redirectTo: 'administrator/dashboard', terminal: true },
    { path: 'overview', redirectTo: 'overview/firm' },
    {
        path: 'administrator',
        loadChildren: '../../app/components/administrator/administrator.module#AdministratorModule'
    },
    {
        path: 'overview',
        loadChildren: '../../app/components/overview/overview.module#OverviewModule'
    }
];
export const componentRouting: ModuleWithProviders = RouterModule.forChild(componentRoutes);
