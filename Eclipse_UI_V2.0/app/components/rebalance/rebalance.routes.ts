import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { RebalanceComponent } from './rebalance.component';
import { AuthGuard }             from '../../core/auth.guard';
import { AuthService}             from '../../core/auth.service';

export const RebalanceRoutes: Routes = [
    {
        path: '',
        component: RebalanceComponent,
        children: [
            
        ]
    }    
];
export const rebalanceRouting: ModuleWithProviders = RouterModule.forChild(RebalanceRoutes);
