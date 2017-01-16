import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { AdministratorComponent } from './administrator.component';
import { AdministratorDashboardComponent } from './dashboard/dashboard.component';
import { StrategistComponent } from './strategist/strategist.component';
import { AuthGuard }             from '../../core/auth.guard';
import { AuthService}             from '../../core/auth.service';

export const AdministratorRoutes: Routes = [
    {
        path: '',
        component: AdministratorComponent,
        canActivate: [AuthGuard],
        children: [
            {    path : '',
                 canActivateChild: [AuthGuard],
                 children: [
                        { path: 'dashboard', component: AdministratorDashboardComponent },
                        { path: 'strategist', component: StrategistComponent}
                    ]
            }
        ]
    }
    
    
];
export const administratorRouting: ModuleWithProviders = RouterModule.forChild(AdministratorRoutes);
