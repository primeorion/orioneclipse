import { Component, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import {Response} from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { IModelList, Istatus } from '../../../models/model';
import { ModelService } from '../../../services/model.service';
import { ITabNav, ModelTabNavComponent} from '../shared/model.tabnav.component';

@Component({
    selector: 'community-model-view',
    templateUrl: './app/components/model/view/modelview.component.html'
})

export class ModelViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    private modelId: number;
    private modelViewData: IModelList = <IModelList>{};
    private modelStatus: Istatus;
    private securityColumnDefs: ColDef[];
    private modelSuggestions: IModelList[] = [];
    private selectedModel: any;
    private searchModelString : string;
    private checkModelId : boolean = false;

    constructor(private activatedRoute: ActivatedRoute, private _modelService: ModelService) {
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.modelId = Util.getRouteParam<number>(this.activatedRoute);
        this.tabsModel.id = this.modelId;
        this.getModelStatus();
        this.initSecurityColumnDefs();

    }

    ngOnInit() {

        if (this.modelId > 0) {
            this.checkModelId = true;
            this.getModelViewInfo(this.modelId);
        }
    }
    getModelViewInfo(modelId) {
        this._modelService.getModelView(modelId)
            .map((response: Response) => <IModelList>response.json())
            .subscribe(model => {
                this.modelViewData = model;
            })
    }
    getModelStatus() {
        this._modelService.modelStatus()
            .map((response: Response) => <Istatus>response.json())
            .subscribe(status => {
                this.modelStatus = status;
            });
    }
    /** initialize Security Grid options */
    initSecurityColumnDefs() {
        this.securityColumnDefs = [
            <ColDef>{ headerName: "SECURITY NAME", field: "name" },
            <ColDef>{ headerName: "SYMBOL", field: "symbol", cellClass: 'text-center' },
            <ColDef>{ headerName: "SECURITY TYPE", field: "type", cellClass: 'text-center' },
            <ColDef>{ headerName: "CATEGORY", field: "category", cellClass: 'text-center' },
            <ColDef>{ headerName: "ASSET CLASS", field: "assetClass", cellClass: 'text-center' },
            <ColDef>{ headerName: "SUB CLASS", field: "subClass", cellClass: 'text-center' },
            <ColDef>{ headerName: "ALLOCATION %", field: "allocation", cellClass: 'text-center' },
            <ColDef>{ headerName: "UPPER TOLERANCE", field: "upperTolerancePercent", cellClass: 'text-center' },
            <ColDef>{ headerName: "LOWER TOLERANCE", field: "lowerTolerancePercent", cellClass: 'text-center' }
            //<ColDef>{ headerName: "", field: "actions", cellClass: 'text-center', cellRenderer: this.actionsRender }
        ];


    }
    //   private actionsRender(params) {
    //     return '<i class="fa fa-pencil-square-o" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Edit Security"></i> ' +
    //         ' <i class="fa fa-times text-danger " aria-hidden="true" title="Delete Security"></i>'
    // }

    /** Search by model Name or id */
    autoModelSearch(event) {
        Util.responseToObjects<IModelList>(this._modelService.searchModel(event.query.toLowerCase()))
            .subscribe(model => {
                this.modelSuggestions = model;
            });
    }

    /** selected item */
    onModelSelect(params: any) {
        this.selectedModel = params;
    }
    searchModel() {
        this.searchModelString = "";
        this.checkModelId = true;
        this.getModelViewInfo(this.selectedModel.id);
    }

}