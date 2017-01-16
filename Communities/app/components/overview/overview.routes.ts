import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { OverviewComponent } from './overview.component';
import { AuthGuard }         from '../../core/auth.guard';
import { AuthService}        from '../../core/auth.service';
import { AdvisorComponent } from './advisor/advisor.component';
import { FirmComponent } from './firm/firm.component';
import { ModelComponent } from './model/model.component';

export const OverviewRoutes: Routes = [
    {
        path: '',
        component: OverviewComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                canActivateChild: [AuthGuard],
                children: [
                    { path: 'firm', component: FirmComponent },
                    { path: 'model', component: ModelComponent },
                    { path: 'advisor', component: AdvisorComponent }
                ]
            }
        ]
    }
];

export const OVERVIEW_ROUTING: ModuleWithProviders = RouterModule.forChild(OverviewRoutes);
