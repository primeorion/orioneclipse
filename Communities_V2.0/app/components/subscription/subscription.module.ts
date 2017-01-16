import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {SUBSCRIPTION_ROUTING} from './subscription.routes'
import { FormsModule } from '@angular/forms';
import {SubscriptionBreadcrumbComponent} from '../../shared/breadcrumb/subscriptionbreadcrumb';
import {DialogModule} from 'primeng/components/dialog/dialog';
import {StrategistMarketingComponent} from '../subscription/view/strategistmarketing.component';
import {ModelMarketingComponent} from '../subscription/view/modelmarketing.component';
import {SubscriptionComponent} from '../subscription/subscription.component';
import {SubscriptionProfiles} from '../subscription/list/subscriptionprofiles.component';
import {StrategistService} from '../../services/strategist.service';
import { ModelMarketingService } from '../../services/model.marketing.service';
import { ModelService } from '../../services/model.service';
import { DonutChartService } from '../../services/donutchart.service';
@NgModule({
  imports: [FormsModule,CommonModule, SUBSCRIPTION_ROUTING,DialogModule],
  providers: [StrategistService,ModelMarketingService,ModelService,DonutChartService],
  declarations: [StrategistMarketingComponent, SubscriptionComponent, SubscriptionBreadcrumbComponent,
   ModelMarketingComponent,SubscriptionProfiles]
})

export class SubscriptionModule { }