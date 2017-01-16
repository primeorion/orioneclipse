import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MODEL_ROUTING } from './model.routes';
import {ModelComponent} from './model.component';
import {ModelTabNavComponent} from './shared/model.tabnav.component';
import { ModelBreadcrumbComponent } from '../../shared/breadcrumb/modelbreadcrumb';
import {ModelDetailsComponent} from './detail/modeldetails.component';
import {ModelListComponent} from './list/modellist.component';
import {ModelViewComponent} from './view/modelview.component';
import { SavedViewComponent } from '../../shared/savedviews/savedview.component';
import {ModelService} from '../../services/model.service';
import {ModelMarketingService} from '../../services/model.marketing.service';
import {DialogModule} from 'primeng/components/dialog/dialog';
import {AgGridModule} from 'ag-grid-ng2/main';
import { ViewsService }  from '.././../services/views.service';
import {AppSharedModule } from '../../shared/shared.module';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import { ModelMarketingComponent } from './marketing/marketing.component';
import { ModelCommentaryComponent } from './marketing/commentary/commentary.component';
import { ModelAdvertisementComponent } from './marketing/advertisement/advertisement.component';
import { ModelMarketingDownloadComponent } from './marketing/downloads/downloads.component';
import { ModelPerformanceComponent } from './marketing/performance/performance.component';
import { ModelSearchComponent } from './marketing/shared/model.search.component';
import { MarketingTabNavComponent } from './marketing/shared/marketing.tabnav.component';
import {EditorModule} from 'primeng/components/editor/editor';
import {SharedModule} from 'primeng/components/common/shared';
import {CalendarModule} from 'primeng/components/calendar/calendar';
// import { DatePicker } from 'ng2-datepicker/ng2-datepicker';

@NgModule({
  imports: [FormsModule, CommonModule, MODEL_ROUTING, AgGridModule.forRoot(), DialogModule,AppSharedModule,AutoCompleteModule, EditorModule,SharedModule,CalendarModule],
  declarations: [ModelComponent, ModelTabNavComponent, ModelListComponent, ModelViewComponent, ModelDetailsComponent, ModelBreadcrumbComponent,
                 ModelMarketingComponent, ModelCommentaryComponent, ModelSearchComponent, MarketingTabNavComponent, ModelAdvertisementComponent,
                 ModelMarketingDownloadComponent, ModelPerformanceComponent],
  providers: [ModelService,ViewsService,AutoCompleteModule,ModelMarketingService]
})

export class ModelModule { }

