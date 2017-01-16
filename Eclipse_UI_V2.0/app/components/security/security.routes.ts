import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { SecurityComponent } from './security.component';
import { SecuritytDashboardComponent } from './dashboard/dashboard.component';
import { SecurityMaintenanceComponent } from './securitymaintenance/security.maintenance.component';
import { SecurityViewComponent } from './securitymaintenance/view/security.view.component';
import { SecurityViewFilterComponent } from './securitymaintenance/view/security.viewfilter.component';
import { SecurityDetailComponent } from './securitymaintenance/detail/security.detail.component';
import { SecuritySetMaintenanceComponent } from './securitysetmaintenance/securityset.maintenance.component';
import { SecuritySetViewComponent } from './securitysetmaintenance/view/securityset.view.component';
import { SecuritySetDetailComponent } from './securitysetmaintenance/detail/securityset.detail.component';
import { AssetMaintenanceComponent } from './assetmaintenance/asset.maintenance.component';
import { CategoryMaintenanceComponent } from './assetmaintenance/categorymaintenance/category.maintenance.component';
import { ClassMaintenanceComponent } from './assetmaintenance/classmaintenance/class.maintenance.component';
import { SubClassMaintenanceComponent } from './assetmaintenance/subclassmaintenance/subclass.maintenance.component';
import { AuthGuard }             from '../../core/auth.guard';
import { AuthService}             from '../../core/auth.service';

export const SecurityRoutes: Routes = [
    {
        path: '',
        component: SecurityComponent,
        children: [
            {    path : '',
                 children: [
                        { path: 'dashboard', component: SecuritytDashboardComponent },
                        {
                            path: 'asset',
                            component: AssetMaintenanceComponent,
                            children:
                            [
                                { path: 'category', component: CategoryMaintenanceComponent },
                                { path: 'class', component: ClassMaintenanceComponent },
                                { path: 'subclass', component: SubClassMaintenanceComponent }
                            ]
                        },
                        {
                            path: 'maintenance',
                            component: SecurityMaintenanceComponent,
                             children: [
                                { path: 'list', component: SecurityViewComponent},
                                { path: 'add', component: SecurityDetailComponent },
                                { path: 'edit/:id', component: SecurityDetailComponent },
                                { path: 'view', component: SecurityDetailComponent },
                                { path: 'view/:id', component: SecurityDetailComponent },
                                { path: 'search/:id', component: SecurityViewFilterComponent}
                            ]
                        },
                        {
                            path: 'securitySet',
                            component: SecuritySetMaintenanceComponent,
                            children: [
                                { path: 'list', component: SecuritySetViewComponent},
                                { path: 'add', component: SecuritySetDetailComponent },
                                { path: 'edit/:id', component: SecuritySetDetailComponent },
                                { path: 'copy/:id', component: SecuritySetDetailComponent },
                                { path: 'view', component: SecuritySetDetailComponent },
                                { path: 'view/:id', component: SecuritySetDetailComponent },
                            ]
                        }
                    ]
            }
        ]
    }
    
    
];
export const securityRouting: ModuleWithProviders = RouterModule.forChild(SecurityRoutes);
