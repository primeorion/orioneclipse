import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { AdministratorComponent } from './administrator.component';
import { AdministratorDashboardComponent } from './dashboard/dashboard.component';
import { StrategistComponent } from './strategist/strategist.component';
import { StrategistViewComponent } from './strategist/view/strategist.view.component';
import { StrategistDetailComponent } from './strategist/detail/strategist.detail.component';
import { UserViewComponent } from './user/view/user.view.component';
import { UserDetailComponent } from './user/detail/user.detail.component';
import { UserComponent } from './user/user.component';
import { AuthGuard }             from '../../core/auth.guard';
import { AuthService}             from '../../core/auth.service';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';

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
                        { path: 'strategist', component: StrategistComponent,
                          children: [
                              { path: 'list', component: StrategistViewComponent, canDeactivate: [ConfirmDeactivateGuard]},
                              { path: 'add', component: StrategistDetailComponent },
                              { path: 'edit/:id', component: StrategistDetailComponent },
                              { path: 'view', component: StrategistDetailComponent },
                              { path: 'view/:id', component: StrategistDetailComponent },
                          ]
                        },
                        { path: 'user', component: UserComponent,
                          children: [
                              { path: 'list', component: UserViewComponent, canDeactivate: [ConfirmDeactivateGuard]},
                              { path: 'add', component: UserDetailComponent },
                              { path: 'edit/:id', component: UserDetailComponent },
                              { path: 'view', component: UserDetailComponent },
                              { path: 'view/:id', component: UserDetailComponent },
                          ]
                        }
                    ]
            }
        ]
    }
    
    
];
export const administratorRouting: ModuleWithProviders = RouterModule.forChild(AdministratorRoutes);
