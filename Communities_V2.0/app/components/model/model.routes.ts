import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import {ModelComponent} from './model.component';
import {ModelListComponent} from './list/modellist.component';
import {ModelDetailsComponent} from './detail/modeldetails.component';
import {ModelViewComponent} from './view/modelview.component';
//import {ModelTabsComponent} from './model.tab.component'
import { AuthGuard }             from '../../core/auth.guard';
import { AuthService}             from '../../core/auth.service';
import { ModelCommentaryComponent } from './marketing/commentary/commentary.component';
import { ModelAdvertisementComponent } from './marketing/advertisement/advertisement.component';
import { ModelMarketingDownloadComponent } from './marketing/downloads/downloads.component';
import { ModelPerformanceComponent } from './marketing/performance/performance.component';
import { ModelMarketingComponent } from './marketing/marketing.component';


export const ModelRoutes: Routes = [
    {
        path: "",
        component: ModelComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                canActivateChild: [AuthGuard],
                children: [
                    { path: 'list', component: ModelListComponent },
                    { path: 'view', component: ModelViewComponent },
                    { path: 'view/:id', component: ModelViewComponent },
                    { path: 'add', component: ModelDetailsComponent },
                    { path: 'edit/:id', component: ModelDetailsComponent },
                    { path: 'marketing', component: ModelMarketingComponent,
                      children: [
                          { path: 'commentary', component: ModelCommentaryComponent },
                          { path: 'commentary/:id', component: ModelCommentaryComponent },
                          { path: 'advertisement', component: ModelAdvertisementComponent },
                          { path: 'advertisement/:id', component: ModelAdvertisementComponent },
                          { path: 'downloads', component: ModelMarketingDownloadComponent },
                          { path: 'downloads/:id', component: ModelMarketingDownloadComponent },
                          { path: 'performance', component: ModelPerformanceComponent },
                          { path: 'performance/:id', component: ModelPerformanceComponent }
                      ]
                    }

                ]
            }]
    }
];

export const MODEL_ROUTING: ModuleWithProviders = RouterModule.forChild(ModelRoutes);