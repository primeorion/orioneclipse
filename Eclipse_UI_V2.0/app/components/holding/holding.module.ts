import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import { FormsModule } from '@angular/forms';
import {HOLDING_ROUTER_PROVIDERS} from './holding.routes'

import {DialogModule} from 'primeng/components/dialog/dialog';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';

import {AgGridModule} from 'ag-grid-ng2/main';
import { HoldingComponent } from './holding.component';
import { HoldingDashboardComponent }  from './dashboard/dashboard.component';
import { HoldingListComponent }  from './list/holdinglist.component';
import { HoldingsFilterComponent }  from './list/holdingfilter.component';
import { HoldingViewComponent }  from './view/holdingview.component';
import { HoldingTabNavComponent }  from './shared/holding.tabnav.component';
import { SavedViewComponent } from '../../shared/savedviews/savedview.component';
import { HoldingFilterComponent }  from './shared/holding.filterby.component';
import { ViewsService }  from '.././../services/views.service';
import {SharedModule} from '../../shared/shared.module';
import { ConfirmDeactivateGuard } from '../portfolio/shared/confirm.deactivatedguard';
import { DonutChartService } from '.././../services/donutchart.service';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, HOLDING_ROUTER_PROVIDERS, DialogModule,
        AgGridModule.forRoot(), CalendarModule, AutoCompleteModule],
    declarations: [HoldingTabNavComponent, HoldingComponent, HoldingDashboardComponent, HoldingListComponent,
        HoldingsFilterComponent, HoldingViewComponent,HoldingFilterComponent],
    providers: [ConfirmDeactivateGuard,ViewsService,DonutChartService]
})

export class HoldingModule { }