import { provideRouter, RouterConfig } from '@angular/router';
import { AuthGuard } from '../../../core/auth.guard';
import { CustodianService } from '../../../services/custodian.service';
import { CustodianComponent } from './custodian.component';
import { CustodianListComponent }  from './list/custodianlist.component';
import { CustodianDetailComponent }  from './detail/custodiandetail.component';
import { CustodianViewComponent }  from './view/custodianview.component';

export const CustodianRoutes: RouterConfig = [
    { path: 'custodian', redirectTo: 'custodian/list', terminal: true },
    {
        path: 'custodian',
        component: CustodianComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'list', component: CustodianListComponent },
            { path: 'edit/:id', component: CustodianDetailComponent },
            { path: 'view', component: CustodianViewComponent },
            { path: 'view/:id', component: CustodianViewComponent }
        ]
    }
];

export const CUSTODIAN_ROUTER_PROVIDERS = [
    provideRouter(CustodianRoutes), CustodianService
];
