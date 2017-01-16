import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BaseComponent } from '../../../core/base.component';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import * as Util from '../../../core/functions';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import { ModelService } from '../../../services/model.service';

/** Models import section */
import { IModel } from '../../../models/modeling/model';
import { IModelDetails } from '../../../models/modeling/modeldetails';
import { IModelStatus } from '../../../models/modeling/modelstatus';
import { IModelFilterTypes } from '../../../models/modeling/modelfiltertypes';
import { IModelingViewModel } from '../../../models/modeling/modelingviewmodel';

@Component({
    selector: 'eclipse-model-dashboard',
    templateUrl: './app/components/model/detail/detail.component.html',
    providers: [ModelService]

})
export class ModelDetailComponent extends BaseComponent {
    private tabsModel: ITabNav;
    modelingmModel: IModelDetails;
    // editModel: IEditmodel;
    sleevedOptions: any;
    // modelSuggestions: ITeamModel[] = [];
    gridOptions: {
        regular: GridOptions
    };
    private columnDefs: ColDef[];
    modelId: number;
    nameValidation: boolean = false;

    constructor(private activateRoute: ActivatedRoute, private _router: Router,
        private _modelService: ModelService) {
        super(PRIV_MODELS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        this.modelingmModel = <IModelDetails>{};
        this.gridOptions = { regular: <GridOptions>{} }
        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        // if (!Util.isNull(this.portfolioId)) {
        if (this.modelId != undefined && this.modelId > 0) {
            this.tabsModel.id = this.modelId;
            this.tabsModel.action = 'E';
        }

    }

    ngOnInit() {
        this.getModelDetailsById(this.modelId);
    }

    /** Get Model details by Id */
    getModelDetailsById(modelId: number) {        
        this.responseToObject<IModelDetails>(this._modelService.getModelDetail(1))
            .subscribe(modelDetails => {
                this.modelingmModel = modelDetails;
            });

    }
}