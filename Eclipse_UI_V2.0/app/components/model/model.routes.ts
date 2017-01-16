import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelComponent } from './model.component';
import { ModelDashboardComponent } from './dashboard/dashboard.component';
import { ModelListComponent } from './list/list.component';
import { ModelsFilterComponent } from './list/filter.component';
import { ModelDetailComponent } from './detail/detail.component';
import { ModelViewComponent } from './view/view.component';
import { ModelAddComponenet } from './information/add.component';
import { ModelStructureComponenet } from './information/structure.component';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';
import { ModelViewStructureComponenet } from './information/viewstructure.component';
import { ModelViewFilterComponent } from './view/viewfilter.component';
//import { TreeComponent } from './information/sample.component';

export const ModelRoutes: Routes = [
    {
        path: '',
        component: ModelComponent,
        children: [
            {
                path: '',
                children: [
                    { path: 'dashboard', component: ModelDashboardComponent },
                    { path: 'list', component: ModelListComponent, canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'list/:id', component: ModelListComponent, canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'filter/:id', component: ModelsFilterComponent },
                    { path: 'view', component: ModelViewComponent },
                    { path: 'view/:id', component: ModelViewComponent },
                    { path: 'detail', component: ModelDetailComponent },                   
                    { path: 'modelinfoadd', component: ModelAddComponenet },
                    { path: 'edit/:id', component: ModelAddComponenet },
                    { path: 'edit/:id/:nstatus', component: ModelAddComponenet },
                    { path: 'edit/:id/:nsubstituteid/:nstatus', component: ModelAddComponenet },
                    { path: 'viewstructure/:id', component: ModelViewStructureComponenet , canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'viewstructure/:id/:nstatus', component: ModelViewStructureComponenet, canDeactivate: [ConfirmDeactivateGuard]  },
                    { path: 'viewstructure/:id/:nsubstituteid/:nstatus', component: ModelViewStructureComponenet , canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'viewstructure/:id/:nstatus/:nid', component: ModelViewStructureComponenet, canDeactivate: [ConfirmDeactivateGuard]  },
                    { path: 'viewstructure/:id/:nstatus/:nid/:nportfolioid', component: ModelViewStructureComponenet, canDeactivate: [ConfirmDeactivateGuard]  },
                     { path: 'viewstructure/:id/:nstatus/:nid/:nportfolioid/:nIsSleeved', component: ModelViewStructureComponenet , canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'viewstructure/:id/:nstatus/:nsubstituteid/:nportfolioid/:nSleevedId/:nEditSubstitute', component: ModelViewStructureComponenet , canDeactivate: [ConfirmDeactivateGuard] },
                    { path: 'search/:id', component: ModelViewFilterComponent }
                ]
            }
        ]
    }
];

export const MODEL_ROUTE_PROVIDERS: ModuleWithProviders = RouterModule.forChild(ModelRoutes);
