import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { securityRouting } from './security.routes';
import { SecurityService } from '../../services/security.service';
import { SecuritySetService } from '../../services/securityset.service';
import { CustodianService } from '../../services/custodian.service';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ButtonModule } from 'primeng/components/button/button';
import { ColorPickerModule } from '../../shared/colorPicker/color-picker/color-picker.module';
import {SharedModule} from '../../shared/shared.module';
import { AgGridModule } from 'ag-grid-ng2/main';


import { SecurityComponent } from './security.component';
import { SecurityLeftNavComponent } from '../../shared/leftnavigation/security.leftnav.component';
import { AssetMaintenanceTabNavComponent } from '../../shared/tabnavigation/asset.maintenance.tabnav.component';
import { AssetMaintenanceComponent } from './assetmaintenance/asset.maintenance.component';
import { CategoryMaintenanceComponent } from './assetmaintenance/categorymaintenance/category.maintenance.component';
import { ClassMaintenanceComponent } from './assetmaintenance/classmaintenance/class.maintenance.component';
import { SubClassMaintenanceComponent } from './assetmaintenance/subclassmaintenance/subclass.maintenance.component';
import { SecuritytDashboardComponent } from './dashboard/dashboard.component';
import { SecurityMaintenanceComponent } from './securitymaintenance/security.maintenance.component';
import { SecurityDetailComponent } from './securitymaintenance/detail/security.detail.component';
import { SecurityViewComponent } from './securitymaintenance/view/security.view.component';
import { SecurityViewFilterComponent } from './securitymaintenance/view/security.viewfilter.component';
import { SecurityTabNavComponent } from './securitymaintenance/shared/security.tabnav.component';
import { SecuritySetMaintenanceComponent } from './securitysetmaintenance/securityset.maintenance.component';
import { SecuritySetViewComponent } from './securitysetmaintenance/view/securityset.view.component';
import { SecuritySetDetailComponent } from './securitysetmaintenance/detail/securityset.detail.component';
import { SecuritySetTabNavComponent } from './securitysetmaintenance/shared/securityset.tabnav.component';
import { AlternativeComponent } from './securitysetmaintenance/detail/alternatives/alternative.component';
import { EquivalenceComponent } from './securitysetmaintenance/detail/equivalence/equivalence.component';
import { TLHComponent } from './securitysetmaintenance/detail/tlh/tlh.component';





let directives : any[] = [
  
  SecurityComponent,
  SecurityLeftNavComponent,
  AssetMaintenanceComponent,
  CategoryMaintenanceComponent,
  ClassMaintenanceComponent,
  SubClassMaintenanceComponent,
  SecuritytDashboardComponent,
  SecurityMaintenanceComponent,
  SecurityDetailComponent,
  SecurityViewComponent,
  SecurityViewFilterComponent,
  SecuritySetMaintenanceComponent,
  SecuritySetViewComponent,
  SecuritySetDetailComponent,
  AlternativeComponent,
  EquivalenceComponent,
  AssetMaintenanceTabNavComponent,
  TLHComponent,
  SecurityTabNavComponent,
  SecuritySetTabNavComponent,
  
]
  


@NgModule({
  imports: [FormsModule,CommonModule,securityRouting,AutoCompleteModule,DialogModule, ButtonModule,
            AgGridModule.forRoot(),ColorPickerModule, SharedModule],
  declarations: directives,
  providers: [SecurityService, SecuritySetService, CustodianService]
})
export class SecurityModule {}
