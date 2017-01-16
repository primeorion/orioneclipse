import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OVERVIEW_ROUTING } from './overview.routes';
import { OverviewService } from '../../services/overview.service';
import {CalendarModule} from 'primeng/components/calendar/calendar';

@NgModule({
  imports: [FormsModule, CommonModule, OVERVIEW_ROUTING, CalendarModule],
  providers: [OverviewService]
})

export class OverviewModule { }

