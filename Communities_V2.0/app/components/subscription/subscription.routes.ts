import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { SubscriptionComponent } from './subscription.component';
import { StrategistMarketingComponent } from '../subscription/view/strategistmarketing.component';
import { ModelMarketingComponent } from '../subscription/view/modelmarketing.component';
import { SubscriptionProfiles } from '../subscription/list/subscriptionprofiles.component';
export const SubscriptionRoutes: Routes = [
    {
        path: '',
        component: SubscriptionComponent,
        canActivate: [AuthGuard],
        children: [
            {

                path: '',
                canActivateChild: [AuthGuard],
                children: [
                    { path: 'profiles', component: SubscriptionProfiles },
                    { path: 'view/:id', component: StrategistMarketingComponent },
                    { path: 'modelmarketing/:id/:strategistId', component: ModelMarketingComponent }
                ]
            }
        ]
    }
];

export const SUBSCRIPTION_ROUTING: ModuleWithProviders = RouterModule.forChild(SubscriptionRoutes);
