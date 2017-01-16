import { Component, Input, Output, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import * as Util from '../../../core/functions';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import { ISecurtySearch, ISecurities, Istatus, IModelList } from '../../../models/model';
import { ModelService } from '../../../services/model.service';
import { CustomValidator } from '../../../shared/validator/CustomValidator';
import { ICommunityUser } from '../../../models/community.user';

@Component({
    selector: 'community-model-details',
    templateUrl: './app/components/model/detail/modeldetails.component.html'
})

export class ModelDetailsComponent extends BaseComponent {
    private tabsModel: ITabNav;
    private modelId: number;
    private securtiesSuggestions: ISecurtySearch[] = [];
    private securities: ISecurities[] = [];
    private searchSecurityString: string;
    private securityGridOptions: GridOptions;
    private securityColumnDefs: ColDef[];
    private selectedSecurity: any;
    private modelStatus: Istatus;
    private model: IModelList = <IModelList>{};
    //private loggedInUserId: number;
    private totalAllocation: number;
    private checkAllocation: boolean = false;
    private checkUperLowerTolerance: boolean = false;
    private checkCastodian: boolean = false;
    private matchingmodelsExists: boolean = false;
    private checkRiskUpperRange: boolean = false;
    private checkRiskLowerRange: boolean = false;
    private checkCurrentRiskRange: boolean = false;
    private checkNumberRange: boolean = false;

    constructor(private activatedRoute: ActivatedRoute, private _modelService: ModelService,
        private _router: Router) {
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        this.modelId = Util.getRouteParam<number>(this.activatedRoute);
        this.securityGridOptions = <GridOptions>{};
        this.initSecurityColumnDefs();
        if (this.modelId > 0) {
            this.tabsModel.id = this.modelId;
            this.tabsModel.action = 'E';
        }
        this.totalAllocation = 2;
        this.getModelStatus();
        this.model.status = 1;
        //this.checkEditable = false;
        // /this.intialloadSecurities();
    }
    ngOnInit() {
        if (this.modelId > 0) {
            this.getModelInfo(this.modelId);
        }
        else {
            this.intialloadSecurities();
        }

    }
    getModelInfo(modelId) {
        this._modelService.getModelView(modelId)
            .map((response: Response) => <IModelList>response.json())
            .subscribe(model => {
                this.model = model;
                this.securities = model.securities;
                this.totalAllocation = 0;
                for (var i = 0; i < this.securities.length; i++) {
                    if (this.securities[i].allocation >= 0)
                        this.totalAllocation = this.totalAllocation + (+ this.securities[i].allocation);
                    // if (this.securities[i].lowerTolerancePercent >= 0 && this.securities[i].upperTolerancePercent >= 0)
                    //     this.checkUperLowerTolerance = true;
                    // else
                    //     this.checkUperLowerTolerance = false;
                    if (this.securities[i].symbol == "CCASH")
                        this.checkCastodian = true;
                }
                if (this.totalAllocation == 100)
                    this.checkAllocation = true;
            })
    }

    getModelStatus() {
        this._modelService.modelStatus()
            .map((response: Response) => <Istatus>response.json())
            .subscribe(status => {
                this.modelStatus = status;
            });
    }

    /** Search by model securities Name */
    autoSecurtySearch(event) {
        Util.responseToObjects<ISecurtySearch>(this._modelService.securitySearch(event.query.toLowerCase()))
            .subscribe(model => {
                this.securtiesSuggestions = model;
                this.securities.forEach(element => {
                    this.securtiesSuggestions = this.securtiesSuggestions.filter(record => record.id != element.id);
                });
                // console.log("Serach Accounts: ", this.securtiesSuggestions);
            });
    }

    /** selected item display in grid*/
    onSecuritySelect(params: any) {
        this.selectedSecurity = params;

    }

    intialloadSecurities() {
        this.selectedSecurity = [{
            "id": 13, "name": "CUSTODIAL_CASH", "symbol": "CCASH", "company": null, "category": "0", "type": "custodialCash", "assetClass": "Cash",
            "subclass": "Cash", "allocation": 2
        }]
        this.securities = this.selectedSecurity;
        this.selectedSecurity = "";
    }

    addSecurity() {
        this.searchSecurityString = '';
        if (this.selectedSecurity != "") {
            this.selectedSecurity.allocation = 0;
            this.securities.push(this.selectedSecurity);
            this.securityGridOptions.api.setRowData(this.securities);
            this.securityGridOptions.api.selectAll();
            this.selectedSecurity = "";
        }
    }

    deleteSecurity(id) {
        this.securities = this.securities.filter(record => record.id != id);
        this.securityGridOptions.api.setRowData(this.selectedSecurity);
        this.checkCastodian = false;
        for (var i = 0; i < this.securities.length; i++) {
            if (this.securities[i].symbol == "CCASH")
                this.checkCastodian = true;
        }

    }
    /** initialize Security Grid options */
    initSecurityColumnDefs() {
        let self = this;
        this.securityColumnDefs = [
            <ColDef>{ headerName: "SecurityId", field: "id", hide: true },
            <ColDef>{ headerName: "SECURITY NAME", field: "name" },
            <ColDef>{ headerName: "SYMBOL", field: "symbol", cellClass: 'text-center' },
            <ColDef>{ headerName: "SECURITY TYPE", field: "type", cellClass: 'text-center' },
            <ColDef>{ headerName: "CATEGORY", field: "category", cellClass: 'text-center' },
            <ColDef>{ headerName: "ASSET CLASS", field: "assetClass", cellClass: 'text-center' },
            <ColDef>{ headerName: "SUB CLASS", field: "subclass", cellClass: 'text-center' },
            <ColDef>{
                headerName: "ALLOCATION %", field: "allocation", cellClass: 'text-center', cellRenderer: function (params) {
                    return self.percentCellRenderer(params, self);
                }
            },
            <ColDef>{
                headerName: "UPPER TOLERANCE", field: "upperTolerancePercent", cellClass: 'text-center', cellRenderer: function (params) {
                    return self.percentCellRenderer(params, self);
                }
            },
            <ColDef>{
                headerName: "LOWER TOLERANCE", field: "lowerTolerancePercent", cellClass: 'text-center', cellRenderer: function (params) {
                    return self.percentCellRenderer(params, self);
                }
            },
            <ColDef>{ headerName: "", field: "actions", cellClass: 'text-center', cellRenderer: this.actionsRender }
        ];
    }

    /** To render percentage cell */
    percentCellRenderer(params, self) {
        var eInput = document.createElement("input");
        eInput.className = "form-control grid-input";
        eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
        eInput.addEventListener('blur', function (event) {
            if (!self.isValidPercentage(eInput.value, self))
                eInput.value = params.data[params.colDef.field];
            else {
                params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
            }
            self.securityGridOptions.api.setRowData(self.securities);
        });
        eInput.addEventListener('keypress', function (event) {
            if (event.which == 8 || event.which == 0) {
                return true;
            }
            if (event.which == 46 && eInput.value.indexOf('.') != -1) {
                event.preventDefault();
                return false;
            }
            if (event.which <= 47 || event.which >= 59) {
                if (event.which != 46) {
                    event.preventDefault();
                    return false;
                }
            }
            if (parseInt(eInput.value + event.key) > 100) {
                event.preventDefault();
                return false;
            }
        });

        return eInput;
    }
    private isValidPercentage(n, self) {
        if (n >= 0 && n <= 100) {
            return true;
        }
        return false;
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.className == "ag-body-viewport" || targetElement.className == "form-control grid-input") {
            this.totalAllocation = 0;
            this.checkAllocation = false;
            this.checkCastodian = false;
            this.checkUperLowerTolerance = false;
            for (var i = 0; i < this.securities.length; i++) {
                if (this.securities[i].allocation >= 0)
                    this.totalAllocation = this.totalAllocation + (+ this.securities[i].allocation);
                // if (this.securities[i].lowerTolerancePercent >= 0 && this.securities[i].upperTolerancePercent >= 0)
                //     this.checkUperLowerTolerance = true;
                // else
                //     this.checkUperLowerTolerance = false;
                if (this.securities[i].symbol == "CCASH")
                    this.checkCastodian = true;

            }
            if (this.totalAllocation == 100)
                this.checkAllocation = true;
        }
        if (targetElement.title === "Delete Security") {
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.deleteSecurity(id);

        }
        // if (targetElement.title === "Edit Security") {
        //     let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
        //     this.securityGridOptions.api.setFocusedCell(id, 'allocation');
        //     this.securityGridOptions.api.startEditingCell({
        //         rowIndex: id,
        //         colKey: 'allocation'
        //     })
        //     this.securityGridOptions.api.startEditingCell({
        //         rowIndex: id,
        //         colKey: 'upperTolerancePercent'
        //     })
        //     this.securityGridOptions.api.startEditingCell({
        //         rowIndex: id,
        //         colKey: 'lowerTolerancePercent'
        //     })
        // }
    }
    @HostListener('keypress', ['$event.target'])
    keyboardInput(event: any) {
        debugger;
        if (event.className == "form-control grid-input") {
            // this.
            this.totalAllocation = 0;
            this.checkAllocation = false;
            this.checkCastodian = false;
            // this.checkUperLowerTolerance = false;
            for (var i = 0; i < this.securities.length; i++) {
                if (this.securities[i].allocation >= 0)
                    this.totalAllocation = this.totalAllocation + (+ this.securities[i].allocation);
                // if (this.securities[i].lowerTolerancePercent >= 0 && this.securities[i].upperTolerancePercent >= 0)
                //     this.checkUperLowerTolerance = true;
                // else
                //     this.checkUperLowerTolerance = false;
                if (this.securities[i].symbol == "CCASH")
                    this.checkCastodian = true;
            }
            if (this.totalAllocation == 100)
                this.checkAllocation = true;
            this.totalAllocation = this.totalAllocation;
        }

    }

    private actionsRender(params) {
        //var checkEditable = false;
        // let editableLink = !checkEditable ? '<span> <i class="fa fa-pencil-square-o" aria-hidden="true" id ="' + params.rowIndex + '" value="' + params.rowIndex +  '" title="Edit Security"></i></span>&nbsp;'
        //                         :'<span><i class="fa fa-pencil-square-o" aria-hidden="true" id ="' + params.rowIndex + '" value="' + params.rowIndex + '" title="save Security"></i></span>&nbsp;';
        // let deleteLink = '<span><i class="fa fa-times text-danger " aria-hidden="true" id ="' + params.node.data.id + '" value="' + params.node.data.id + '" title="Delete Security"></i></span>';
        // return editableLink+deleteLink;
        return '<i class="fa fa-times text-danger " aria-hidden="true" id ="' + params.node.data.id + '" value="' + params.node.data.id + '" title="Delete Security"></i>';
    }
    /** check model name already exist or not */
    modelAlreadyExist() {
        if (this.model.name == undefined || this.model.name.trim() == "") return;
        else {

            Util.responseToObjects<IModelList>(this._modelService.searchModel(this.model.name.trim()))
                .subscribe(models => {
                    let matchingmodel = models.filter(m =>
                        m.name.toLowerCase().trim() == this.model.name.toLowerCase().trim()
                        && m.id != this.model.id);
                    this.matchingmodelsExists = matchingmodel.length > 0;
                });
        }

    }
    private riskRange(targetRisk, event) {
        if (targetRisk < 0 || targetRisk > 100) {
            this.checkNumberRange = true;
            switch (event.target.name) {
                case "targetRiskUpper":
                    this.checkRiskUpperRange = true;
                    break;
                case "currentRisk":
                    this.checkCurrentRiskRange = true;
                    break;
                case "targetRiskLower":
                    this.checkRiskLowerRange = true;
                    break;
                default:
            }
        }
        else {
            if (this.model.targetRiskUpper >= 0 && this.model.targetRiskUpper <= 100)
                this.checkRiskUpperRange = false;
            if (this.model.currentRisk >= 0 && this.model.currentRisk <= 100)
                this.checkCurrentRiskRange = false;
            if (this.model.targetRiskLower >= 0 && this.model.targetRiskLower <= 100)
                this.checkRiskLowerRange = false;
        }
        if (!this.checkRiskUpperRange && !this.checkCurrentRiskRange && !this.checkRiskLowerRange)
            this.checkNumberRange = false;
    }
    /** save model */
    private saveModel() {
        this.model.style = (this.model.style) ? this.model.style : "";
        this.model.targetRiskLower = (this.model.targetRiskLower > 0) ? + this.model.targetRiskLower : 0;
        this.model.targetRiskUpper = (this.model.targetRiskUpper > 0) ? + this.model.targetRiskUpper : 0;
        this.model.currentRisk = (this.model.currentRisk > 0) ? + this.model.currentRisk : 0;
        this.model.advisorFee = (this.model.advisorFee > 0) ? + this.model.advisorFee : 0;
        this.model.currentRisk = (this.model.currentRisk > 0) ? + this.model.currentRisk : 0;
        this.model.weightedAvgNetExpense = (this.model.weightedAvgNetExpense > 0) ? + this.model.weightedAvgNetExpense : 0;
        this.model.minimumAmount = (this.model.minimumAmount > 0) ? + this.model.minimumAmount : 0;
        this.model.securities = this.securities;
        for (var i = 0; i < this.model.securities.length; i++) {
            this.model.securities[i].allocation = + this.model.securities[i].allocation;
            this.model.securities[i].upperTolerancePercent = (this.model.securities[i].upperTolerancePercent > 0) ? + this.model.securities[i].upperTolerancePercent : 0;
            this.model.securities[i].lowerTolerancePercent = (this.model.securities[i].lowerTolerancePercent > 0) ? + this.model.securities[i].lowerTolerancePercent : 0;
        }
        if (this.modelId > 0) {
            this.responseToObject<IModelList>(this._modelService.updateModel(this.modelId, this.model))
                .subscribe(model => {
                    // console.log("suceess", model);
                    this._router.navigate(['/community/model/list/']);
                },
                err => {
                    console.log("Error", err);
                });
        }
        else {
            this.responseToObject<IModelList>(this._modelService.createModel(this.model))
                .subscribe(model => {
                    // console.log("suceess", model);
                    this._router.navigate(['/community/model/list/']);
                },
                err => {
                    console.log("Error", err);
                });
        }

    }

}