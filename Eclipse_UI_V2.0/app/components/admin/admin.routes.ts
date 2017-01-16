import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
export { AdminComponent, AdminDashboardComponent }

export const AdminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: '',
                children: [
                    { path: 'dashboard', component: AdminDashboardComponent },
                ]
            }
        ]
    }
];

export const ADMIN_ROUTE_PROVIDERS: ModuleWithProviders = RouterModule.forChild(AdminRoutes);
