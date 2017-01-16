import { Component, ViewChild, HostListener} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Response } from '@angular/http';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Router, ActivatedRoute } from '@angular/router';
import { CustodianService  } from '../../../services/custodian.service';
import { ICustodian, ICustodianAccounts } from '../../../models/custodian';
import { IAdminDashboard } from '../../../models/dashboard';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { CustodianDetailsComponent } from './custodiandetails.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../shared/leftnavigation/admin.leftnav';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb';

@Component({
    selector: 'eclipse-admin-custodian',
    templateUrl: './app/components/admin/custodian/custodianold.component.html',
    directives: [TabSet, Tab, AgGridNg2, Dialog, Button, CustodianDetailsComponent, AdminLeftNavComponent, BreadcrumbComponent],
    providers: [CustodianService]
})

export class CustodianComponent1 extends BaseComponent {
    private custodianGridOptions: GridOptions;
    private showGrid: boolean;
    private custodians: ICustodian[] = [];
    private custodianColumnDefs: ColDef[];
    private selectedacustodiantoDelete: number;
    private displayConfirm: boolean;
    private menuModel: IAdminLeftMenu;
    errorMessage: string;
    selectedCustodianId: number;
    isDeleted: boolean;
    deleteCheck: boolean;
    selectedCustAccountNumber: string;
    //showActionsMenu: boolean = true;
    queryStringVal: string;
    isEdit: boolean = false;
    isView: boolean = false;

    @ViewChild(TabSet) _objtabs: TabSet;
    @ViewChild(CustodianDetailsComponent) custodiandetails: CustodianDetailsComponent;

    constructor(private _router: Router, private _custodianService: CustodianService, private activateRoute: ActivatedRoute) {
        super();
        this.custodianGridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.showGrid = true;
        //this.getCustodianCounts();
        this.menuModel = <IAdminLeftMenu>{};

        this.activateRoute.params
            .map(params => params['queryStr'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
    }

    ngOnInit() {
        this.onCustodiansLoad();
        if (this.queryStringVal == "create") {
            this._objtabs.navigatetocreatetabfromDashboard();
            this.custodiandetails.showSearchCustodian = true;
            this.custodiandetails.showDetail = false;
            this.custodiandetails.showSaveBtn = false;
        }
    }

    /**Load on initilization */
    onCustodiansLoad() {
        this.errorMessage = '';
        // this.custodians = this._custodianService.getCustodians();
        this.ResponseToObjects<ICustodian>(this._custodianService.getCustodians())
            .subscribe(custodian => {
                this.custodians = custodian.filter(a => a.isDeleted == 0);
                this.getCustodianSummary();
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**Refresh the custodian form */
    refreshCustodianList() {
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab1");
        this.onCustodiansLoad();
        this.selectedCustodianId = undefined;
        //this.showActionsMenu = true;
    }

    /**Get Custodian summary */
    private getCustodianSummary() {
        this.responseToObject<IAdminDashboard>(this._custodianService.getCustodianSummary())
            .subscribe(custodianSummary => {
                this.menuModel.all = custodianSummary.totalCustodians;
                this.menuModel.existingOrActive = custodianSummary.activeCustodians;
            });
    }

    /** * create column headers for agGrid*/
    private createColumnDefs() {
        this.custodianColumnDefs = [
            <ColDef>{ headerName: "Custodian ID", field: "id", width: 130, cellClass: 'text-center' },
            <ColDef>{ headerName: "Custodian Name", field: "name", width: 135 },
            <ColDef>{ headerName: "Code", field: "code", width: 80, cellClass: 'text-center' },
            <ColDef>{ headerName: "Master Account Number", field: "accountNumber", width: 180, cellClass: 'text-center' },
            <ColDef>{ headerName: "Delete", field: "delete", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' },
        ];
    }

    /** function to render cross image in the options column of ag-grid*/
    private deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Delete"></i>';
        return result;
    }

    /**Delete check based on accounts length */
    private deleteConfirm(custodianId: number) {
        this.ResponseToObjects<ICustodianAccounts>(this._custodianService.getCustodianAccounts(custodianId))
            .subscribe(custAccounts => {
                this.selectedacustodiantoDelete = custodianId;
                if (custAccounts.length > 0)
                    this.deleteCheck = true;
                else
                    this.displayConfirm = true;
            });
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.innerText === "Edit") {
            //this.selectedacustodiantoDelete = targetElement.id;
            this.custodiandetails.selectedSecurityId = 0;
            this.custodiandetails.selectedTradeId = 0;
            this.custodiandetails.disableAddBtn = true;
            this.isView = false;
            this.isEdit = true;
            this.custodiandetails.codeErrorMsg = false;
            this.custodiandetails.nameErrorMsg = false;
            //this.showActionsMenu = false;
            this.custodiandetails.showSaveBtn = true;
            this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
            this.custodiandetails.loadEditMode(Number(this.getStringCustodianId(targetElement.outerHTML)));
            this.custodiandetails.showDetail = true;
        }

        if (targetElement.innerText === "View details") {
            this.custodiandetails.selectedSecurityId = 0;
            this.custodiandetails.selectedTradeId = 0;
            this.custodiandetails.disableAddBtn = true;
            this.isEdit = false;
            this.isView = true;
            this.custodiandetails.codeErrorMsg = false;
            this.custodiandetails.nameErrorMsg = false
            //this.showActionsMenu = false;
            this.custodiandetails.showSaveBtn = false;
            this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
            this.custodiandetails.loadEditMode(Number(this.getStringCustodianId(targetElement.outerHTML)));
            this.custodiandetails.showDetail = true;
        }

        if (targetElement.title === "Delete") {
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.deleteConfirm(id);
        }

        //From context menu delete
        if (targetElement.innerText === "Delete Custodian") {
            let custId = parseInt(targetElement.outerHTML.split('id=')[1].split('value=')[0].replace(/['"]+/g, '').toString());
            this.deleteConfirm(custId);
        }

        if (targetElement.innerHTML === "Custodian Details") {
            this.custodiandetails.showSearchCustodian = true;
            this.custodiandetails.codeErrorMsg = false;
            this.custodiandetails.nameErrorMsg = false;
            this.custodiandetails.resetForm();
            //this.showActionsMenu = false;
            this.custodiandetails.showSaveBtn = true;
            this.custodiandetails.selectedSecurityId = 0;
            this.custodiandetails.selectedTradeId = 0;
            this.custodiandetails.tradeExecutionVal = 1;
            this.custodiandetails.TradeType = false;
            this.custodiandetails.showDetail = false;
            this.custodiandetails.showSaveBtn = false;
        }

        if (targetElement.innerHTML === "All Custodian") {
            //this.showActionsMenu = true;
            this.isEdit = false;
            this.isView = false;
        }
    }

    /** split the string which we get from Context menu (targetElement.outerHTML) */
    getStringCustodianId(param) {
        return param.split("<hidden id=")[1].split(">")[0].replace(/['"]+/g, '').toString();
    }

    /*** method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        var result = [
            {
                name: '<hidden id =' + params.node.data.id + '>View details</hidden>'
            },
            {
                name: '<hidden id =' + params.node.data.id + '>Edit</hidden>'
            },
            // {
            //     name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>'
            // },
            {
                name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + '>Delete Custodian</hidden>',
            }
        ];
        return result;
    }

    /**Delete action click */
    onDeleteAction() {
        this.deleteConfirm(this.selectedCustodianId);
    }

    /*** Used to redirect to custodian details  to View & Edit selected custodian details */
    private viewandEditCustodianDetails(param) {
        if (param == "view") {
            //this.custodiandetails.isView = true;
            //this.custodiandetails.isEdit = false;
            this.isEdit = false;
            this.isView = true;
            this.custodiandetails.showSaveBtn = false;
            //this.showActionsMenu = false;
        }
        else if (param == "edit") {
            this.isView = false;
            this.isEdit = true;
            this.custodiandetails.showSaveBtn = true;
            //this.custodiandetails.isView = false;
            //this.custodiandetails.isEdit = true;
            //this.showActionsMenu = false;
        }

        this.custodiandetails.selectedSecurityId = 0;
        this.custodiandetails.selectedTradeId = 0;
        this.custodiandetails.disableAddBtn = true;
        this.custodiandetails.showDetail = true;
        this.custodiandetails.codeErrorMsg = false;
        this.custodiandetails.nameErrorMsg = false;
        this.custodiandetails.showSearchCustodian = false;
        //this.activeSelectedTab("tab2");
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
        this.custodiandetails.loadEditMode(this.selectedCustodianId);
    }

    /*** method to apply active flag to the selected tab*/
    activeSelectedTab(tabname) {
        this.custodiandetails.showSearchCustodian = false;
        this._objtabs.deactivateAllTabsandActiveSelectedTab(tabname);
        this.custodiandetails.resetForm();
    }

    /*** To delete custodian and make dialog to close*/
    deleteCustodian() {
        //this.RemoveRecord(this.selectedacustodiantoDelete);
        //this.displayConfirm = false;
        this._custodianService.deleteCustodian(this.selectedCustodianId).map((response: Response) => response.json())
            .subscribe(model => {
                this.refreshCustodianList();
                this.displayConfirm = false;
            })
    }

    /**Row double click event */
    private onRowDoubleClicked($event) {
        this.custodiandetails.selectedSecurityId = 0;
        this.custodiandetails.selectedTradeId = 0;
        this.custodiandetails.disableAddBtn = true;
        this.isEdit = true;
        this.isView = false;
        this.custodiandetails.loadEditMode($event.data.id);
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
        //this.showActionsMenu = false;
        this.custodiandetails.codeErrorMsg = false;
        this.custodiandetails.nameErrorMsg = false;
        this.custodiandetails.showSaveBtn = true;
        this.custodiandetails.showDetail = true;
    }

    /*** function removes the record from grid after confirming*/
    private RemoveRecord(indexval) {
        // one index splice
        this.custodianGridOptions.rowData.splice(this.custodianGridOptions.rowData.findIndex(x => x.id == parseInt(indexval)), 1);
        // overwrite row data
        this.custodianGridOptions.api.setRowData(this.custodianGridOptions.rowData);
    }

    /* Grid Selected Row Event*/
    private onrowClicked($event) {
        this.isEdit = false;
        this.isView = false;
        this.selectedCustodianId = $event.data.id;
        this.isDeleted = $event.data.isDeleted;
        this.selectedCustAccountNumber = $event.data.accountNumber;
    }

}