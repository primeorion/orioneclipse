import { Component, ViewChild, HostListener, Output, EventEmitter} from '@angular/core';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../core/base.component';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Router } from '@angular/router';
import { CustodianService } from '../../../services/custodian.service';
import { ICustodian, ISecurity, ITradeExecutionType, ISecurityTradeExeType } from '../../../models/custodian';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';

@Component({
    selector: 'eclipse-admin-custodiandetails',
    templateUrl: './app/components/admin/custodian/custodiandetails.component.html',
    directives: [TabSet, Tab, AgGridNg2, Dialog, Button, AutoComplete],
    providers: [CustodianService]
})
export class CustodianDetailsComponent extends BaseComponent {
    private selectedSecurityTradeExeType: number;
    private deleteConfirm: boolean;
    private showGrid: boolean;
    public TradeType: boolean;
    private selectTradeType: boolean;
    isEdit: boolean = false;
    selectedSecurity: ISecurity;
    selectedSecurityId: number = 0;
    FilteredSecurityresults: ISecurity[] = [];
    securityTypes: ISecurity[] = [];
    private selectedSecuritytoDelete: number;
    private gridCustodianOptions: GridOptions;
    private CustodianDefs: ColDef[];
    private CustodianRowData: any[] = [];
    selectedTrade: ITradeExecutionType;
    selectedTradeId: number = 0;
    FileteredTraderesults: ITradeExecutionType[] = [];
    autocompleteTradeResults: ITradeExecutionType[] = [];
    private selectedTradetoDelete: number;
    custodian: ICustodian = <ICustodian>{};
    errorMessage: string;
    public showSaveBtn: boolean = true;
    selectedCustodianId: number;
    isView: boolean = false;
    tradeExeTypes: ITradeExecutionType[] = [];
    tradeExetypeId: any;
    tradeExecutionVal: number;
    selectedTradeExeType: any;
    disableAddBtn: boolean = true;
    public showSearchCustodian: boolean = false;
    txtCustodianName: string;
    autocompleteCustodianResults: ICustodian[] = [];
    custodians: ICustodian[] = [];
    FileteredCustodianRsults: any[] = [];
    nameErrorMsg: boolean = false;
    codeErrorMsg: boolean = false;
    showDetail: boolean = true;
    disableSaveBtn: boolean = false;

    @ViewChild(TabSet) _objtabs: TabSet;
    @Output() custodianEmitter = new EventEmitter();

    constructor(private _router: Router, private _custodianService: CustodianService) {
        super();
        this.gridCustodianOptions = <GridOptions>{};
        this.columnCustodianDefs();
        this.showGrid = false;
        this.TradeType = false;
    }

    ngOnInit() {
        this.getTradeExeTypes();
        this.getCustodians();
    }

    /**To save custodian */
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

        if (this.tradeExecutionVal == 1 && this.custodian.tradeExecutionTypeId == 0) {
            return;
        }
        
        let custodian;
        this.selectedTradeExeType = this.custodian.tradeExecutionTypeId;
        //console.log('edited custodian:', this.custodian);
        if (this.custodian.accountNumber == null || this.custodian.accountNumber == undefined) this.custodian.accountNumber = '';
        if (this.tradeExecutionVal == 1)
            custodian = { externalId: this.custodian.externalId, name: this.custodian.name, code: this.custodian.code, accountNumber: this.custodian.accountNumber, tradeExecutionTypeId: parseInt(this.selectedTradeExeType) }
        else
            custodian = { externalId: this.custodian.externalId, name: this.custodian.name, code: this.custodian.code, accountNumber: this.custodian.accountNumber, tradeExecutions: this.CustodianRowData }

        if (this.custodian.id > 0) {
            this._custodianService.updateCustodian(this.custodian.id, custodian)
                .map((response: Response) => <ICustodian>response.json())
                .subscribe(custodian => {
                    this.resetForm();
                    this.custodianEmitter.emit("Custodian updated");
                });
        }
    }

    /**To check validation */
    checkValidation() {
        if (this.custodian.name != undefined) {
            if (this.custodian.name.trim() == "") this.nameErrorMsg = true; else this.nameErrorMsg = false;
        }
        if (this.custodian.code != undefined) {
            if (this.custodian.code.trim() == "") this.codeErrorMsg = true; else this.codeErrorMsg = false;
        }
    }

    /** get selected value on drop down change*/
    onDropDownChange(selectedVal) {
        if (selectedVal != 0)
            this.disableSaveBtn = false;
        else
            this.disableSaveBtn = true;

        this.custodian.tradeExecutionTypeId = parseInt(selectedVal);
    }

    /**Column headers for CustodianDetails AgGrid */
    private columnCustodianDefs() {
        this.CustodianDefs = [
            <ColDef>{ headerName: "Security Type", field: "securityTypeName", cellClass: 'text-center', width: 175 },
            <ColDef>{ headerName: "Trade Execution Type", field: "tradeExecutionTypeName", cellClass: 'text-center', width: 175 },
            <ColDef>{ headerName: "Option", field: "", width: 100, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' }
        ]
    }

    /*** To load custodian details for editing a selected custodian*/
    loadEditMode(custodianId: number) {
        this.CustodianRowData = [];
        this.isEdit = true;
        this.isView = false;
        this.selectedCustodianId = custodianId;
        this.showSearchCustodian = false;
        this.getCustodianDetailsById(custodianId);
    }

    /*** To load custodian details for view */
    loadViewMode(custodianId: number) {
        //this.isView = true;
        //this.isEdit = false;
        this.selectedCustodianId = custodianId
        this.getCustodianDetailsById(custodianId);
    }

    /*** To Get selected custodian details by Id*/
    getCustodianDetailsById(custodianId: number) {
        //this.custodian = this._custodianService.getCustodianById(custodianId);
        this._custodianService.getCustodianById(custodianId)
            .map((response: Response) => response.json())
            .subscribe(custodianDetails => {
                this.custodian = <ICustodian>custodianDetails;
                //Bind form based on trade execution 
                if (custodianDetails.tradeExecutionTypeId == undefined) {
                    this.tradeExecutionVal = 0;
                    this.selectTradeType = true;
                    this.TradeType = true;
                    this.showGrid = true;
                    this.custodian.tradeExecutionTypeId = 0;

                    //Adding data to grid on edit mode
                    this.CustodianRowData = [];
                    this.CustodianRowData = this.custodian.tradeExecutions;
                }
                else {
                    //To bind dropdown on edit
                    this.tradeExetypeId = this.custodian.tradeExecutionTypeId;

                    this.tradeExecutionVal = 1;
                    this.selectTradeType = false;
                    this.TradeType = false;
                    this.showGrid = false;
                }
                this.getSecurityTypes();
                this.disableSave();
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /*get trade execution types to bind drop down*/
    getTradeExeTypes() {
        //this.tradeExeTypes = this._custodianService.getTradeExecutionTypes();
        this._custodianService.getTradeExecutionTypes()
            .map((response: Response) => response.json())
            .subscribe(tradeExeTypes => {
                this.tradeExeTypes = tradeExeTypes;
                this.tradeExeTypes.sort((t1, t2) => {
                    if (t1.name.trim() > t2.name.trim()) return 1;
                    if (t1.name.trim() < t2.name.trim()) return -1;
                    return 0;
                });
            });
    }

    /**get custodians for custodian search from custodian details page */
    getCustodians() {
        this.ResponseToObjects<ICustodian>(this._custodianService.getCustodians())
            .subscribe(custodian => {
                this.custodians = custodian.filter(a => a.isDeleted == 0);
            });
    }

    /*AutoComplete Search by Custodian */
    autoCustodianSearch(event) {
        this.autocompleteCustodianResults = [];
        this.autocompleteCustodianResults = this.custodians;
        //this.FileteredCustodianRsults = this.filterCustodian(event.query, this.autocompleteCustodianResults);
        this.ResponseToObjects<ICustodian>(this._custodianService.custodianSearch(event.query))
            .subscribe(custodian => {
                this.FileteredCustodianRsults = custodian.filter(a => a.isDeleted == 0);
            });
    }

    /**Fires autocomplete on select */
    selectedCustodianSearch(params: any) {
        this.loadEditMode(params.id);
        this.showSearchCustodian = true;
        this.nameErrorMsg = false;
        this.codeErrorMsg = false;
        this.custodian = params;
        this.showDetail = true;
        this.showSaveBtn = true;
    }

    /**get Securities */
    getSecurityTypes() {
        this.securityTypes = [];
        this._custodianService.getSecurityTypes()
            .map((response: Response) => response.json())
            .subscribe(securityTypes => {
                this.securityTypes = securityTypes;
                this.CustodianRowData.forEach(element => {
                    this.securityTypes = this.securityTypes.filter(record => record.id != element.securityTypeId);
                });
                this.securityTypes.sort((s1, s2) => {
                    if (s1.name.trim() > s2.name.trim()) return 1;
                    if (s1.name.trim() < s2.name.trim()) return -1;
                    return 0;
                });
            });
    }

    /** get selected security on drop down change*/
    onSecurityDropDownChange(securityId) {
        this.selectedSecurityId = parseInt(securityId);
        for (var i = 0; i < this.securityTypes.length; i++) {
            if (this.securityTypes[i].id == securityId) {
                this.selectedSecurity = this.securityTypes[i];
            }
        }

        /** enable/disable Add button  */
        if ((this.selectedSecurityId != 0) && (this.selectedTradeId != 0))
            this.disableAddBtn = false
        else
            this.disableAddBtn = true;
    }

    /** get selected trade execution type on drop down change*/
    onTradeTypeDropDownChange(selectedTradeTypeId) {
        this.selectedTradeId = parseInt(selectedTradeTypeId);
        for (var i = 0; i < this.tradeExeTypes.length; i++) {
            if (this.tradeExeTypes[i].id == selectedTradeTypeId) {
                this.selectedTrade = this.tradeExeTypes[i];
            }
        }

        /** enable/disable Add button  */
        if ((this.selectedSecurityId != 0) && (this.selectedTradeId != 0))
            this.disableAddBtn = false;
        else
            this.disableAddBtn = true;
    }

    /**function to add trde type and security to agGrid */
    addCustodian() {
        this.CustodianRowData.push({ securityTypeId: this.selectedSecurity.id, securityTypeName: this.selectedSecurity.name, tradeExecutionTypeId: this.selectedTrade.id, tradeExecutionTypeName: this.selectedTrade.name });
        this.gridCustodianOptions.api.setRowData(this.CustodianRowData);
        this.selectedTradeId = 0;
        this.selectedSecurityId = 0;
        this.disableAddBtn = true;
        this.getSecurityTypes();
        this.disableSave();
    }

    /** function to render cross image in the options column of ag-grid*/
    private deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.securityTypeId + ' title="SecurityTradeExeDelete"></i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "SecurityTradeExeDelete") {
            this.deleteConfirm = true;
            this.selectedSecurityTradeExeType = targetElement.id;
        }
    }

    /*** method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        var result = [
            {
                name: 'Delete',
            }
        ];
        return result;
    }

    /*** function to pass record index value to delete and make dialog to close*/
    deleterCustodianDetails() {
        this.RemoveRecord(this.selectedSecurityTradeExeType)
        this.deleteConfirm = false;
        this.getSecurityTypes();
        this.disableSave();
    }

    /*** function removes the record from grid after confirming*/
    private RemoveRecord(indexval) {
        // one index splice
        this.gridCustodianOptions.rowData.splice(this.gridCustodianOptions.rowData.findIndex(x => x.securityTypeId == parseInt(indexval)), 1);
        // overwrite row data
        this.gridCustodianOptions.api.setRowData(this.gridCustodianOptions.rowData);
    }

    /*** Redirect to all custodians on clicking on cancel*/
    onCancel() {
        this.resetForm();
        this.custodianEmitter.emit("Custodian Cancel");
    }

    /**  reset form */
    public resetForm() {
        this.selectedCustodianId = undefined;
        this.custodian.name = '';
        this.custodian.accountNumber = '';
        this.custodian.code = '';
        this.CustodianRowData = [];
        this.txtCustodianName = '';
        this.codeErrorMsg = false;
        this.nameErrorMsg = false;
        this.custodian = <ICustodian>{};
        this.showSaveBtn = true;
        this.custodian.tradeExecutionTypeId = 0;
        this.selectedSecurity = null;
        this.selectedTrade = null;
        this.disableAddBtn = true;
        this.selectedSecurityId = 0;
        this.selectedTradeId = 0;
    }

    /**To disable save button  */
    disableSave() {
        if (this.tradeExecutionVal == 0 || this.tradeExecutionVal == undefined) {
            if (this.CustodianRowData.length > 0)
                this.disableSaveBtn = false;
            else
                this.disableSaveBtn = true;
        }
        else
            this.disableSaveBtn = false;
    }

    /***To get value on radio button change */
    sameForAllRadioBtnChange(val) {
        this.TradeType = false;
        this.showGrid = false;
        this.selectTradeType = false;
        this.tradeExecutionVal = val;
        this.selectedSecurityId = 0;
        this.selectedTradeId = 0;
        this.disableAddBtn = true;
        if (this.tradeExecutionVal == 1 && this.custodian.tradeExecutionTypeId == 0)
            this.disableSaveBtn = true;
        else
            this.disableSaveBtn = false;
    }

    /**To get value on radio button change */
    securityTypeRadioBtnChange(val) {
        this.TradeType = true;
        this.showGrid = true;
        this.selectTradeType = true;
        this.tradeExecutionVal = val;
        this.disableSave();
    }

}