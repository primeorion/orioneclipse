import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import { FormsModule } from '@angular/forms';
import {MODEL_ROUTE_PROVIDERS} from './model.routes'

import { ModelComponent } from './model.component';
import { ModelDashboardComponent } from './dashboard/dashboard.component';
import { ModelListComponent } from './list/list.component';
import { ModelsFilterComponent } from './list/filter.component';
import { ModelDetailComponent } from './detail/detail.component';
import { ModelViewComponent } from './view/view.component';
import { ModelAddComponenet } from './information/add.component';
import { ModelInformationTabNavComponent } from './shared/modelInformation.tabnav.component';
import { ModelStructureComponenet } from './information/structure.component';
import { ModelViewStructureComponenet } from './information/viewstructure.component';
import { TreeComponent } from './information/sample.component';
import { ViewsService }  from '.././../services/views.service';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';
import { SharedModule } from '../../shared/shared.module';
import { ModelViewFilterComponent } from './view/viewfilter.component';
import { ModelTabNavComponent } from './shared/model.tabnav.component';
import { D3TreeChartComponent } from './shared/treechart/d3treechart.component';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, MODEL_ROUTE_PROVIDERS],
    declarations: [ModelTabNavComponent,D3TreeChartComponent, ModelComponent, ModelDashboardComponent, ModelListComponent, ModelsFilterComponent,
        ModelDetailComponent, ModelViewComponent, ModelAddComponenet, ModelInformationTabNavComponent, ModelStructureComponenet, TreeComponent,ModelViewStructureComponenet, ModelViewFilterComponent],
    providers: [ConfirmDeactivateGuard, ViewsService]

})

export class ModelModule { }