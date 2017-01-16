import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustodianService } from '../../../services/custodian.service';
import { CustodianComponent } from './custodian.component';
import { CustodianListComponent } from './list/custodianlist.component';
import { CustodianDetailComponent } from './detail/custodiandetail.component';
import { CustodianViewComponent } from './view/custodianview.component';
import { CustodianFilterComponent } from './view/custodianfilter.component';
export {
    CustodianComponent, CustodianListComponent,
    CustodianDetailComponent, CustodianViewComponent, CustodianFilterComponent
};

export const CustodianRoutes: Routes = [
    { path: 'custodian', redirectTo: 'custodian/list' },
    {
        path: 'custodian',
        component: CustodianComponent,
        children:
        [
            { path: 'list', component: CustodianListComponent },
            { path: 'edit/:id', component: CustodianDetailComponent },
            { path: 'view', component: CustodianViewComponent },
            { path: 'view/:id', component: CustodianViewComponent },
            { path: 'filter/:id', component: CustodianFilterComponent }
        ]
    }
];

export const CUSTODIAN_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(CustodianRoutes);
