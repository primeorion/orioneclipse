import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { administratorRouting } from './administrator.routes';
import { AdministratorService } from '../../services/administrator.service';
import { StrategistService } from '../../services/strategist.service';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ButtonModule } from 'primeng/components/button/button';
import {FileUploadModule} from 'primeng/components/fileupload/fileupload';
import {EditorModule} from 'primeng/components/editor/editor';
import {SharedModule} from 'primeng/components/common/shared';
import {AgGridModule} from 'ag-grid-ng2/main';
import {AppSharedModule } from '../../shared/shared.module';


import { AdministratorComponent } from './administrator.component';
import { StrategistTabNavComponent } from './shared/strategist.tabnav.component';
import { UserTabNavComponent } from './shared/user.tabnav.component';
import { AdministratorLeftNavComponent } from '../../shared/leftnavigation/administrator.leftnav.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb';

import { StrategistDetailComponent } from './strategist/detail/strategist.detail.component';
import { StrategistViewComponent } from './strategist/view/strategist.view.component';
import { StrategistGeneralInfoComponent } from './strategist/detail/generalInfo/strategist.general.info.component';
import { StrategistCommentaryComponent } from './strategist/detail/commentary/commentary.component';
import { StrategistSalesComponent } from './strategist/detail/sales/sales.component';
import { StrategistSupportComponent } from './strategist/detail/support/support.component';
import { StrategistAgreementComponent } from './strategist/detail/legalAgreement/legalAgreement.component';
import { StrategistAdvertisementComponent } from './strategist/detail/advertisement/advertisement.component';
import { StrategistDownloadComponent } from './strategist/detail/downloads/download.component';
import { AdministratorDashboardComponent } from './dashboard/dashboard.component';
import { StrategistComponent } from './strategist/strategist.component';
import { UserComponent } from './user/user.component';
import { UserDetailComponent } from './user/detail/user.detail.component';
import { UserViewComponent } from './user/view/user.view.component';
import { ViewsService }  from '.././../services/views.service';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';


let directives : any[] = [
  
  AdministratorComponent,
  AdministratorDashboardComponent,
  AdministratorLeftNavComponent,
  BreadcrumbComponent,
  StrategistDetailComponent,
  StrategistViewComponent,
  StrategistGeneralInfoComponent,
  StrategistCommentaryComponent,
  StrategistComponent,
  StrategistSalesComponent,
  StrategistSupportComponent,
  StrategistAgreementComponent,
  StrategistAdvertisementComponent,
  StrategistDownloadComponent,
  UserComponent,
  UserViewComponent,
  UserDetailComponent,
  //SavedViewComponent,
  StrategistTabNavComponent,
  UserTabNavComponent
]
  


@NgModule({
  imports: [FormsModule,CommonModule,administratorRouting,AutoCompleteModule,DialogModule, ButtonModule,
            EditorModule,SharedModule,AgGridModule.forRoot(),FileUploadModule, AppSharedModule],
  declarations: directives,
  providers: [AdministratorService, StrategistService, ViewsService, ConfirmDeactivateGuard]
})
export class AdministratorModule {}

