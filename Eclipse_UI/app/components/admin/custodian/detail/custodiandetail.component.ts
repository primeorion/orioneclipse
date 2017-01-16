import { Component, ViewChild, HostListener } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { ICustodian, ISecurity, ITradeExecutions, ITradeExecutionType, ISecurityTradeExeType } from '../../../../models/custodian';
import { CustodianService } from '../../../../services/custodian.service';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, CustodianTabNavComponent } from '../shared/custodian.tabnav.component';

@Component({
    selector: 'eclipse-admin-custodian-detail',
    templateUrl: './app/components/admin/custodian/detail/custodiandetail.component.html',
    directives: [AgGridNg2, Dialog, Button, AutoComplete, AdminLeftNavComponent, CustodianTabNavComponent],
    providers: [CustodianService]
})
export class CustodianDetailComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    custodianId: number;
    custodian: ICustodian = <ICustodian>{};
    custodianSuggestions: any[] = [];
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    securityTypes: ISecurity[] = [];
    tradeExecutionTypes: ITradeExecutionType[] = [];
    tradeExecution: ITradeExecutions = <ITradeExecutions>{};
    private sameForAllSelected: boolean = true;
    tradeExecutionVal: number;
    selectedTradeExeType: any;
    private securityTradeExecutionId: number;
    private deleteConfirm: boolean;
    nameErrorMsg: boolean = false;
    codeErrorMsg: boolean = false;
    disableSaveBtn: boolean = false;

    constructor(private _router: Router, private activatedRoute: ActivatedRoute,
        private _custodianService: CustodianService) {
        super(PRIV_CUSTODIANS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        this.menuModel = <IAdminLeftMenu>{};
        this.gridOptions = <GridOptions>{};
        this.columnCustodianDefs();
        this.tradeExecution = <ITradeExecutions>{ securityTypeId: 0, tradeExecutionTypeId: 0 }
        this.custodianId = Util.getRouteParam<number>(this.activatedRoute);
        if (this.custodianId > 0) {
            this.tabsModel.id = this.custodianId;
            this.tabsModel.action = 'E';
        }
    }

    ngOnInit() {
        this.getTradeExecutionTypes();
        this.getCustodianSummary();
        if (this.custodianId > 0)
            this.getCustodianDetailsById(this.custodianId);
    }

    /** Get Custodian summary */
    private getCustodianSummary() {
        this.responseToObject<any>(this._custodianService.getCustodianSummary())
            .subscribe(summary => {
                this.menuModel.all = summary.totalCustodians;
                this.menuModel.existingOrActive = summary.activeCustodians;
            });
    }

    /** Save custodian */
    saveCustodian() {
        if (this.custodian.name == undefined || this.custodian.code == undefined) return;
        this.custodian.code = this.custodian.code.trim();
        this.custodian.name = this.custodian.name.trim();
        this.custodian.accountNumber = this.custodian.accountNumber.trim();
        if (this.custodian.name == "" || this.custodian.code == "") {
            if (this.custodian.code == "") this.codeErrorMsg = true;
            if (this.custodian.name == "") this.nameErrorMsg = true;
            return;
        };
        if (this.custodian.tradeExecutionTypeId != undefined) {
            this.custodian.tradeExecutionTypeId = +this.custodian.tradeExecutionTypeId;
        }
        if (this.tradeExecutionVal == 1 && this.custodian.tradeExecutionTypeId == 0) {
            return;
        }
        if (Util.isNull(this.custodian.accountNumber)) this.custodian.accountNumber = '';
        // console.log('edited custodian:', JSON.stringify(this.custodian));
        if (this.tradeExecutionVal == 0) {
            this.custodian.tradeExecutionTypeId = undefined;
            this.custodian.tradeExecutionTypeName = undefined;
        } else {
            this.custodian.tradeExecutions = undefined;
        }
        // console.log('edited custodian:', JSON.stringify(this.custodian));
        if (this.custodian.id > 0) {
            this.responseToObject<ICustodian>(this._custodianService.updateCustodian(this.custodian.id, this.custodian))
                .subscribe(custodian => {
                    this._router.navigate(['/eclipse/admin/custodian/list']);
                });
        }
    }

    /** Check validation */
    checkValidation() {
        if (this.custodian.name != undefined) {
            this.nameErrorMsg = (this.custodian.name.trim() == "");
        }
        if (this.custodian.code != undefined) {
            this.codeErrorMsg = (this.custodian.code.trim() == "");
        }
    }

    /** Column headers for Trade Execution Types ag-grid */
    private columnCustodianDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Security Type", field: "securityTypeName", cellClass: 'text-center', width: 175 },
            <ColDef>{ headerName: "Trade Execution Type", field: "tradeExecutionTypeName", cellClass: 'text-center', width: 175 },
            <ColDef>{ headerName: "Option", field: "", width: 100, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' }
        ]
    }

    /** Get selected custodian details by Id */
    getCustodianDetailsById(custodianId: number) {
        this.responseToObject<ICustodian>(this._custodianService.getCustodianById(custodianId))
            .subscribe(model => {
                this.custodian = model;
                // Bind form based on trade execution 
                if (this.custodian.tradeExecutions == undefined) {
                    this.custodian.tradeExecutions = [];
                    this.tradeExecutionVal = 1;
                    this.sameForAllSelected = true;
                }
                else {
                    // To bind dropdown on edit
                    this.tradeExecutionVal = 0;
                    this.sameForAllSelected = false;
                }
                if (Util.isNull(this.custodian.tradeExecutionTypeId))
                    this.custodian.tradeExecutionTypeId = 0;
                this.getSecurityTypes();
                this.disableSave();
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search by Custodian */
    loadCustodianSuggestions(event) {
        this.ResponseToObjects<ICustodian>(this._custodianService.custodianSearch(event.query))
            .subscribe(custodians => {
                this.custodianSuggestions = custodians.filter(a => a.isDeleted == 0);
            });
    }

    /** Fires autocomplete on select */
    onCustodianSelect(params: any) {
        this._router.navigate(['/eclipse/admin/custodian/view', params.id]);
    }

    /** Get Securities */
    getSecurityTypes() {
        this.securityTypes = [];
        this.ResponseToObjects<ISecurity>(this._custodianService.getSecurityTypes())
            .subscribe(securityTypes => {
                let typeIds = this.custodian.tradeExecutions.map(m => +m.securityTypeId);
                securityTypes = securityTypes.filter(m => typeIds.indexOf(m.id) < 0);
                this.securityTypes = Util.sortBy(securityTypes);
            });
    }

    /** Get trade execution types to bind drop down */
    getTradeExecutionTypes() {
        this.ResponseToObjects<ITradeExecutionType>(this._custodianService.getTradeExecutionTypes())
            .subscribe(tradeExecutionTypes => {
                this.tradeExecutionTypes = Util.sortBy(tradeExecutionTypes);
            });
    }

    /** Get selected value on drop down change */
    onTradeExecutionTypesChange(value: number) {
        this.disableSaveBtn = (value == 0);
    }

    /** Get selected security on drop down change */
    onSecurityTypeChange(typeId: number) {
        let type = this.securityTypes.find(m => m.id == +typeId);
        if (type != undefined) {
            this.tradeExecution.securityTypeName = type.name;
        }
    }

    /** Get selected trade execution type on drop down change */
    onTradeExecutionTypeChange(typeId: number) {
        let type = this.tradeExecutionTypes.find(m => m.id == +typeId)
        if (type != undefined) {
            this.tradeExecution.tradeExecutionTypeName = type.name;
        }
    }

    /** Add trde type and security to agGrid */
    addTradeExecution() {
        this.tradeExecution.securityTypeId = +this.tradeExecution.securityTypeId;
        this.tradeExecution.tradeExecutionTypeId = +this.tradeExecution.tradeExecutionTypeId;
        this.custodian.tradeExecutions.push(this.tradeExecution);
        this.gridOptions.api.setRowData(this.custodian.tradeExecutions);
        this.tradeExecution = <ITradeExecutions>{ securityTypeId: 0, tradeExecutionTypeId: 0 }
        this.getSecurityTypes();
        this.disableSave();
    }

    /** Render cross image in the options column of ag-grid */
    private deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i class="fa fa-times red" aria-hidden="true" id=' + params.node.data.securityTypeId + ' title="SecurityTradeExeDelete"></i></span>';
        return result;
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "SecurityTradeExeDelete") {
            this.deleteConfirm = true;
            this.securityTradeExecutionId = targetElement.id;
        }
    }

    /** Method to display context menu on ag-grid */
    private getContextMenuItems(params) {
        let contextMenu = [
            { name: 'Delete' }
        ];
        return contextMenu;
    }

    /** Pass record index value to delete and make dialog to close */
    deleteTradeExecution() {
        this.RemoveRecord(this.securityTradeExecutionId)
        this.deleteConfirm = false;
        this.getSecurityTypes();
        this.disableSave();
    }

    /** Removes the record from grid after confirming */
    private RemoveRecord(indexval) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.securityTypeId == parseInt(indexval)), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /** To disable save button */
    disableSave() {
        if (Util.isNull(this.tradeExecutionVal)) {
            //if (!Util.isNull(this.custodian.tradeExecutions))
            if (this.custodian.tradeExecutions.length > 0)
                this.disableSaveBtn = false;
            else
                this.disableSaveBtn = true;
        }
        else
            this.disableSaveBtn = false;
    }

    /** To get value on radio button change */
    sameForAllRadioBtnChange(val) {
        this.sameForAllSelected = true;
        this.tradeExecutionVal = val;
        this.tradeExecution = <ITradeExecutions>{ securityTypeId: 0, tradeExecutionTypeId: 0 }
        if (this.tradeExecutionVal == 1 && this.custodian.tradeExecutionTypeId == 0)
            this.disableSaveBtn = true;
        else
            this.disableSaveBtn = false;
    }

    /** To get value on radio button change */
    securityTypeRadioBtnChange(val) {
        this.sameForAllSelected = false;
        this.tradeExecutionVal = val;
        this.disableSave();
    }

    /** Acction menu events */
    showPopup(event){
        switch(event)
        {
         case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/custodian', this.tabsModel.id]);
                break;
         default:
        }
    }

}
