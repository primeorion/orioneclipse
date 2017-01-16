import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rebalanceRouting } from './rebalance.routes';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ButtonModule } from 'primeng/components/button/button';
import { ColorPickerModule } from 'angular2-color-picker/lib/color-picker.module';
import {SharedModule} from '../../shared/shared.module';
import { AgGridModule } from 'ag-grid-ng2/main';
import { RebalanceComponent } from './rebalance.component';
import { RebalanceModelDetailComponent } from './model/detail/model.detail.component';
import { RebalanceModelListComponent } from './model/list/model.list.component';
import {PortfolioComponent} from './../rebalance/portfolio.component';
import {RebalancerComponent} from './../rebalance/rebalancer.component';
import 'ag-grid-enterprise/main';
import { PortfolioService } from '../../services/portfolio.service';
import { RebalanceModelService } from '../../services/rebalance.model.service'
import { RebalanceService } from '../../services/rebalance.service';
import { TradeService } from '../../services/trade.service';
import { OrderBy } from '../../pipes/FilterPipe';

let directives : any[] = [
  RebalanceComponent,
  RebalanceModelDetailComponent,
  RebalanceModelListComponent,
  PortfolioComponent,
  RebalancerComponent
]
  
let   pipes: any[]=[OrderBy]

@NgModule({
  imports: [FormsModule, CommonModule, rebalanceRouting, AutoCompleteModule, DialogModule, ButtonModule,
            AgGridModule.forRoot(), ColorPickerModule, SharedModule],
  declarations: [directives,pipes],

  providers: [PortfolioService, RebalanceModelService, RebalanceService, TradeService]
})
export class RebalanceModule {}
