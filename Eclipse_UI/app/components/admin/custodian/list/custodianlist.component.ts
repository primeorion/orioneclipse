import { Component, ViewChild, HostListener} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { ICustodian, ICustodianAccounts } from '../../../../models/custodian';
import { IAdminDashboard } from '../../../../models/dashboard';
import { CustodianService  } from '../../../../services/custodian.service';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, CustodianTabNavComponent } from '../shared/custodian.tabnav.component';

@Component({
    selector: 'eclipse-admin-custodian-list',
    templateUrl: './app/components/admin/custodian/list/custodianlist.component.html',
    directives: [AgGridNg2, Dialog, Button, AdminLeftNavComponent, CustodianTabNavComponent],
    providers: [CustodianService]
})

export class CustodianListComponent extends BaseComponent {
    private gridOptions: GridOptions;
    private custodians: ICustodian[] = [];
    private custodianColumnDefs: ColDef[];
    private displayConfirm: boolean;
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    selectedCustodianId: number;
    isDeleted: boolean;
    deleteCheck: boolean;
    selectedCustodian: any[] = [];

    constructor(private _router: Router, private activateRoute: ActivatedRoute,
        private _custodianService: CustodianService) {
        super(PRIV_CUSTODIANS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.menuModel = <IAdminLeftMenu>{};
    }

    ngOnInit() {
        this.onCustodiansLoad();
        this.getCustodiansSummary();
    }

    /** Load on initilization */
    onCustodiansLoad() {
        this.ResponseToObjects<ICustodian>(this._custodianService.getCustodians())
            .subscribe(custodians => {
                this.custodians = custodians.filter(a => a.isDeleted == 0);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** Refresh the custodian form */
    refreshCustodianList() {
        this.onCustodiansLoad();
        this.getCustodiansSummary();
        this.selectedCustodianId = undefined;
        this.tabsModel.id = undefined;
    }

    /** Get Custodian summary */
    private getCustodiansSummary() {
        this.responseToObject<IAdminDashboard>(this._custodianService.getCustodianSummary())
            .subscribe(summary => {
                this.menuModel.all = summary.totalCustodians;
                this.menuModel.existingOrActive = summary.activeCustodians;
            });
    }

    /** Create column headers for ag-grid */
    private createColumnDefs() {
        this.custodianColumnDefs = [
            <ColDef>{ headerName: "Custodian ID", field: "id", width: 130, cellClass: 'text-center' },
            <ColDef>{ headerName: "Custodian Name", field: "name", width: 135 },
            <ColDef>{ headerName: "Code", field: "code", width: 80, cellClass: 'text-center' },
            <ColDef>{ headerName: "Master Account Number", field: "accountNumber", width: 180, cellClass: 'text-center' },
            <ColDef>{ headerName: "Delete", field: "delete", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' },
        ];
    }

    /** Render cross image in the options column of ag-grid */
    private deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Delete" class="fa fa-times red" aria-hidden="true"></i></span>';
        return result;
    }

    /** Hostlistener for ag-grid context menu actions */

    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) {
            return;
        }
        let matches = targetElement.outerHTML.match(pattern);
        let [selectedCustodianId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View details") {
            this._router.navigate(['/eclipse/admin/custodian/view', selectedCustodianId]);
        }
        else if (targetElement.innerText === "Edit") {
            this._router.navigate(['/eclipse/admin/custodian/edit', selectedCustodianId]);
        }
        else if (targetElement.innerText === "Delete") {
            this.deleteConfirm(selectedCustodianId);
        }
        else if (targetElement.innerText === "Edit preferences") {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
                this._router.navigate(['/eclipse/admin/preferences/custodian', this.tabsModel.ids.join()]);
            else
                this._router.navigate(['/eclipse/admin/preferences/custodian', selectedCustodianId]);
        }

    }
    /** method to display context menu on ag-grid */
    private getContextMenuItems(params) {
        let permission = Util.getPermission(PRIV_ROLES);
        let contextMenu = [];
        let selectedRows = params.api.getSelectedRows();
        if (selectedRows.length > 1) {
            if (permission.canUpdate) {
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
            }
        }
        else {
            if (permission.canRead)
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>View details</hidden>' });
            if (permission.canUpdate) {
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit</hidden>' });
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
            }
            if (permission.canDelete) {
                contextMenu.push({
                    name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + '>Delete</hidden>'
                });
            }
        }
        return contextMenu;
    }

    /** Fires when action menu item clicked */
    showPopup(event) {
        switch (event) {
            case 'DELETE':
                this.deleteConfirm(this.selectedCustodianId);
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/custodian', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
          
        }
    }

    /** Delete check based on accounts length */
    private deleteConfirm(custodianId: number) {
        this.ResponseToObjects<ICustodianAccounts>(this._custodianService.getCustodianAccounts(custodianId))
            .subscribe(custAccounts => {
                this.selectedCustodianId = custodianId;
                if (custAccounts.length > 0)
                    this.deleteCheck = true;
                else
                    this.displayConfirm = true;
            });
    }

    /** Delete custodian and make dialog to close */
    deleteCustodian() {
        this.responseToObject<any>(this._custodianService.deleteCustodian(this.selectedCustodianId))
            .subscribe(model => {
                this.refreshCustodianList();
                this.displayConfirm = false;
            });
    }

    /* Grid Selected Row Event */
    private onRowClicked($event) {
        this.selectedCustodianId = $event.data.id;
        this.isDeleted = $event.data.isDeleted;
        this.tabsModel.id = +$event.data.id;
        console.log("onRowClicked: ", this.tabsModel.id);
    }

    /** MultiRow selected in Custodian for Edit preferences */
    private onRowSelected(event) {
        let custodians = <ICustodian[]>this.gridOptions.api.getSelectedRows();
        if (custodians.length > 1) {
            this.tabsModel.ids = custodians.map(m => m.id);
            this.tabsModel.id = undefined;
        }
        else if (custodians.length == 1) {
            this.tabsModel.id = custodians[0].id;
            this.tabsModel.ids = undefined;
        }
        console.log("onRowSelected: ", this.tabsModel.ids);
    }

    /** Row double click event */
    private onRowDoubleClicked($event) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/admin/custodian/view', $event.data.id]);
        else if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/admin/custodian/edit', $event.data.id]);
    }

}
