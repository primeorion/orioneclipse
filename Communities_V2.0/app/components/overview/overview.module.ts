import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OVERVIEW_ROUTING } from './overview.routes';
import { OverviewService } from '../../services/overview.service';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import { ITabNav, OverviewTabNavComponent } from './shared/overview.tabnav.component';
import { OverviewLeftNavComponent } from '../../shared/leftnavigation/overview.leftnav.component';
import { OverviewBreadcrumbComponent } from '../../shared/breadcrumb/overviewbreadcrumb';
import { DonutChartService } from '../../services/donutchart.service';
import { LineChartService } from '../../services/linechart.service';
import { OverviewComponent } from '../overview/overview.component';
import { FirmComponent } from '../overview/firm/firm.component';
import { ModelComponent } from '../overview/model/model.component';
import { AdvisorComponent } from '../overview/advisor/advisor.component';
@NgModule({
  imports: [FormsModule, CommonModule, OVERVIEW_ROUTING, CalendarModule],
  providers: [OverviewService, DonutChartService,LineChartService],
  declarations:[OverviewComponent,OverviewTabNavComponent, OverviewLeftNavComponent, OverviewBreadcrumbComponent,FirmComponent,ModelComponent,AdvisorComponent]
})

export class OverviewModule { }

