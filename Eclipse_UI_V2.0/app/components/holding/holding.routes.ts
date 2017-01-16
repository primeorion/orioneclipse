import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { HoldingComponent } from './holding.component';
import { HoldingDashboardComponent }  from './dashboard/dashboard.component';
import { HoldingListComponent }  from './list/holdinglist.component';
import { HoldingViewComponent }  from './view/holdingview.component';
import { HoldingsFilterComponent }  from './list/holdingfilter.component';
import { ConfirmDeactivateGuard } from '../portfolio/shared/confirm.deactivatedguard';

export const HoldingRoutes: Routes = [
    {
        path: '',
        component: HoldingComponent,
        canActivate: [AuthGuard],
        children:
        [
            {
                path: '',
                children: [
                    { path: 'dashboard', component: HoldingDashboardComponent },
                    { path: 'dashboard/:type/:tid', component: HoldingDashboardComponent },
                    { path: 'list', component: HoldingListComponent, canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'list/:type/:tid', component: HoldingListComponent, canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'list/:type/:tid/:fid', component: HoldingListComponent, canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'view/:type/:tid', component: HoldingViewComponent },
                    { path: 'view/:type/:tid/:id', component: HoldingViewComponent },
                    { path: 'filter/:route/:type/:tid', component: HoldingsFilterComponent },
                    { path: 'filter/:route/:type/:tid/:fid', component: HoldingsFilterComponent },
                    { path: 'search/:route/:type/:tid/:id', component: HoldingsFilterComponent },
                ]
            }
        ]
    }
];

export const HOLDING_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(HoldingRoutes);
