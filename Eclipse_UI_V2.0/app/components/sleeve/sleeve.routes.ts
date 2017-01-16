import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { SleeveComponent } from './sleeve.component';
import { SleeveDetailComponent } from './detail/sleevedetail.component';
import { SleeveTransferComponent } from './transfer/sleeve.transfer.component';
import { SleeveStrategyComponent } from './strategy/sleeve.strategy.component';

export const SleeveRoutes: Routes = [
    {
        path: '',
        component: SleeveComponent,
        canActivate: [AuthGuard],
        children:
        [
            {
                path: '',
                children: [
                    { path: '', component: SleeveDetailComponent },
                    { path: 'edit/:id', component: SleeveDetailComponent },
                    { path: 'transfer/:id', component: SleeveTransferComponent },
                    { path: 'strategy', component: SleeveStrategyComponent }
                ]
            }
        ]
    }
];

export const SLEEVE_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(SleeveRoutes);
