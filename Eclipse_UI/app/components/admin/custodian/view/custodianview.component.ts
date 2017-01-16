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
import { ICustodian } from '../../../../models/custodian';
import { CustodianService } from '../../../../services/custodian.service';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, CustodianTabNavComponent } from '../shared/custodian.tabnav.component';

@Component({
    selector: 'eclipse-admin-custodian-view',
    templateUrl: './app/components/admin/custodian/view/custodianview.component.html',
    directives: [AgGridNg2, Dialog, Button, AutoComplete, AdminLeftNavComponent, CustodianTabNavComponent],
    providers: [CustodianService]
})
export class CustodianViewComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    custodianId: number;
    custodian: ICustodian = <ICustodian>{};
    custodianSuggestions: any[] = [];
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private sameForAllSelected: boolean;
    private deleteConfirm: boolean;

    constructor(private _router: Router, private activatedRoute: ActivatedRoute,
        private _custodianService: CustodianService) {
        super(PRIV_CUSTODIANS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.menuModel = <IAdminLeftMenu>{};
        this.gridOptions = <GridOptions>{};
        this.columnCustodianDefs();
        this.custodianId = Util.getRouteParam<number>(this.activatedRoute);
        if (this.custodianId > 0) {
            this.tabsModel.id = this.custodianId;
        }
    }

    ngOnInit() {
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

    /** Column headers for Trade Execution Types ag-grid */
    private columnCustodianDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Security Type", field: "securityTypeName", cellClass: 'text-center', width: 175 },
            <ColDef>{ headerName: "Trade Execution Type", field: "tradeExecutionTypeName", cellClass: 'text-center', width: 175 }
        ]
    }

    /** Get selected custodian details by Id */
    getCustodianDetailsById(custodianId: number) {
        this.responseToObject<ICustodian>(this._custodianService.getCustodianById(custodianId))
            .subscribe(model => {
                this.custodian = model;
                console.log('custodian: ', model.tradeExecutions);
                console.log('custodian: ', JSON.stringify(model));
                // Bind form based on trade execution
                if (this.custodian.tradeExecutions == undefined) {
                    this.custodian.tradeExecutions = [];
                    this.sameForAllSelected = true;
                }
                else {
                    this.sameForAllSelected = false;
                }
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

    /** Fires when action menu item clicked */
    showPopup(event) {
        switch (event) {
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/custodian', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
          default:
        }
    }

}
