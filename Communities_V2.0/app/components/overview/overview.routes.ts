import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { AuthGuard }         from '../../core/auth.guard';
import { OverviewComponent } from './overview.component';
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
                    { path: 'firm', redirectTo: 'aumfirm' },
                    { path: 'aumfirm', component: FirmComponent },
                    { path: 'aummodel', component: ModelComponent },
                    { path: 'aumadvisor', component: AdvisorComponent },
                    { path: 'accountsfirm', component: FirmComponent },
                    { path: 'accountsmodel', component: ModelComponent },
                    { path: 'accountsadvisor', component: AdvisorComponent },
                    { path: 'cashflowfirm', component: FirmComponent },
                    { path: 'cashflowmodel', component: ModelComponent },
                    { path: 'cashflowadvisor', component: AdvisorComponent }
                ]
            }
        ]
    }
];

export const OVERVIEW_ROUTING: ModuleWithProviders = RouterModule.forChild(OverviewRoutes);
