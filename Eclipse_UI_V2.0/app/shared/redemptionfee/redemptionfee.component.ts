import { Component, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { SecurityService } from '../../services/security.service';
import { SecuritySetService } from '../../services/securityset.service';
import { ISecurity } from '../../models/security';
import { ISecurityPreference, ISecuritySimple, ISecurityPreferencesGet } from '../../models/Preferences/securityPreference';
import { IRedemptionFeePreference, IRedemptionFeePreferencesGet } from '../../models/Preferences/redemptionfeepreference';
import { BaseComponent } from '../../core/base.component';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';

import { Dialog } from 'primeng/components/dialog/dialog';


@Component({
    selector: 'RedemptionFee-DataGrid',
    templateUrl: './app/shared/redemptionfee/redemptionfee.component.html',
    providers: [SecurityService, SecuritySetService]
})

export class RedemptionFeeComponent extends BaseComponent {

    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    securityName: string;
    securityId: number;
    securityType: string;
    securityTypes: any[];

    securitySymbol: string;
    security: ISecurity = <ISecurity>{};
    private allSecurities: ISecurity[];
    private securityData: ISecurity[];

    private PrefrowData: IRedemptionFeePreference[] = [];
    filteredSecurityResult: any[] = [];
    private selectedSecurity: any;
    private selectedSecurityType: string;
    //tax alternates auto complete
    selectedExempt: any;
    private selectedTax: any;//ISecuritySimple = <ISecuritySimple>{};
    selectedDeffered: any;

    //end of tax alternates auto complete
    btnDisableSetPref: boolean = true;
    displayRedemptionFeePref: boolean = false;
    // securityPref: ISecurityPreference = <ISecurityPreference>{};
    redemptionfeePref: IRedemptionFeePreference = <IRedemptionFeePreference>{};
    type: string = "$";
    // custodianFeetype: string = "$";
    // filteredAlternates: any[] = [];
    // filteredTaxExempts: any[] = [];
    // filteredTaxDeffered: any[] = [];
    canShow: boolean = true;
    canRead: boolean = false;
    yesOrNOoData: any[] = [];
    // buyPriorityList: any[] = [];
    // sellPriorityList: any[] = [];

    @Input() displaypermission: string;
    @Input() fromParent: ISecurityPreferencesGet; /** TODO: CHANGE IT TO REDEMPTION GET */
    fromParentPrefLevel: string;

    constructor(private _securityService: SecurityService, private _securitySetService: SecuritySetService) {
        super();
        this.gridOptions = <GridOptions>{};

        // this.securityPref = <ISecurityPreference>{
        //     taxableDivReInvest: null,
        //     taxDefDivReinvest: null,
        //     taxExemptDivReinvest: null,
        //     capGainReinvestTaxable: null,
        //     capGainsReinvestTaxDef: null,
        //     capGainsReinvestTaxExempt: null,
        //     excludeHolding: null,
        //     sellPriority: null,
        //     buyPriority: null

        // };

        console.log("pref level from constructor", this.fromParentPrefLevel);
    }

    ngOnInit() {
        // this.getSecurities();
        this.getYesOrNoOptions();
        this.PrefrowData = this.fromParent.securityPreferences;/** TODO: CHANGE IT TO REDEMPTION FEE PREFERENCES */
        this.fromParentPrefLevel = this.fromParent.levelName.toLowerCase()
        console.log("fromParentPrefLevel data:", this.fromParentPrefLevel);
        this.createColumnDefs();
        // this.getProrities();
        this.getSecurityTypes();

    }

    /** Get Security Types */
    getSecurityTypes() {
        this._securityService.getSecurityType()
            .map((response: Response) => <any[]>response.json())
            .subscribe(securitieTypesResult => {
                this.securityTypes = securitieTypesResult;
            });
    }

    /**
     * Security Type on Dropdown selection changed event
     */
    handleSelectedSecurityType(securityTypeId) {
        if (parseInt(""+securityTypeId)) {
            this.btnDisableSetPref = false;
            this.securityType = securityTypeId;
        }
        else
            this.btnDisableSetPref = true;
    }

    /**
     * Security Auto Complete
     */
    autoSecuritySearch(event) {
        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                this.filteredSecurityResult = securitiesResult;
                this.PrefrowData.forEach(element => {
                    this.filteredSecurityResult = this.filteredSecurityResult.filter(record => record.id != element.id);
                    this.btnDisableSetPref = true;
                });
            });

    }

    /**
     * Security on selection changed event
     */
    handleSelectedSecurity(security) {
        if (security.id > 0) {
            this.btnDisableSetPref = false;
            this.security = security;
        }
        else
            this.btnDisableSetPref = true;
    }



    //to open preferences popup
    setPrefPopup(securityType) {
        /** TODO: NEED TO HAVE SECURITY DETAILS TO SEND THE DATA TO POPUP */

        this.displayRedemptionFeePref = true;
        this.type = "$";
        // this.custodianFeetype = "$";
        // this.securityName = security.name;
        // this.securityId = security.id;
        this.securityType = securityType;
        // this.securitySymbol = security.symbol;
        // security.name = "";
        this.resetForm();
        // this.bindSecurityEmptyData(security);
        // this.getProrities();
    }

    //Find index of expanded row /
    findExpandedRowIndex(array, key, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == val) {
                return i;
            }
        }
        return null;
    }
    /**
     * To Reset Form
     */
    resetForm() {
        this.redemptionfeePref = <IRedemptionFeePreference>{};
        this.selectedSecurity = [];
        this.btnDisableSetPref = true;
        this.selectedSecurity = "";
    }

    bindSecurityEmptyData(security) {

        this.redemptionfeePref = <IRedemptionFeePreference>{
            id: security.id,
            securityName: security.name,
            securityType: security.securityType,
            symbol: security.symbol,
            redemptionFeeTypeId: null,
            redemptionFeeAmount: null,
            redemptionFeeDays: null
        }
    }

    rowSelected(event) {
        // this.selectedSecurity = event;
        // this.securityPref = this.selectedSecurity.data;
        this.selectedSecurity = "";
    }


    /**
     * Redemption Fee Type Change event
     */
    onFeeTypeChange(event) {
        if (event.srcElement.value == "%") {
            this.type = "%";
            if (this.redemptionfeePref.redemptionFeeAmount != undefined && this.redemptionfeePref.redemptionFeeAmount != "" && this.redemptionfeePref.redemptionFeeAmount > 100)
                this.redemptionfeePref.redemptionFeeAmount = 100;
        }
        else
            this.type = "$";

    }

    /**
     * Custodian Redemption Fee Type Change event
     */
    // oncustodianFeeTypeChangee(event) {
    //     if (event.srcElement.value == "%") {
    //         this.custodianFeetype = "%";
    //         if (this.securityPref.custodianRedemptionFeeAmount != undefined && this.securityPref.custodianRedemptionFeeAmount != "" && this.securityPref.custodianRedemptionFeeAmount > 100)
    //             this.securityPref.custodianRedemptionFeeAmount = 100;
    //     }
    //     else
    //         this.custodianFeetype = "$";

    // }


    /**     
        * create column headers for agGrid
        */
    private createColumnDefs() {
        console.log("coldef", this.fromParentPrefLevel)
        // this.PrepareColdef(this.fromParentPrefLevel)
        this.PrepareColdef();

    }

    /**Prepare colDefs based on Preference level */
    PrepareColdef() {
        this.columnDefs = [
            // <ColDef>{
            //     // headerName: "Security Details", cellStyle: { text: 'center' },
            //     children: [
            // <ColDef>{ headerName: "Security Id", field: "id", width: 150, cellClass: 'text-center', filter:'number' },
            // <ColDef>{ headerName: "Security Name", field: "securityName", width: 150, cellClass: 'text-center', filter:'text' },
            <ColDef>{ headerName: "Security Type", field: "securityType", width: 150, cellClass: 'text-center', filter: 'text' },
            // <ColDef>{ headerName: "Symbol", field: "symbol", width: 150, cellClass: 'text-center', filter:'text' },
            <ColDef>{ headerName: "Redemption Fee Type", field: "redemptionFeeTypeId", width: 110, cellClass: 'text-center', cellRenderer: this.feeTypeRenderer, filter: 'text' },
            <ColDef>{ headerName: "Redemption Fee Amount", field: "redemptionFeeAmount", width: 180, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Redemption Fee Days", field: "redemptionFeeDays", width: 110, cellClass: 'text-center', filter: 'number' },
            //     ]
            // }
        ]

    }


    // /**Yes no Renderer */
    // yesOrNoRenderer(params) {
    //     let col = params.column.colId;
    //     let obj = params.data[col];
    //     return obj == true ? "Yes" : obj == false ? "No" : '';
    // }

    /**Yes no Renderer */
    feeTypeRenderer(params) {
        let col = params.column.colId;
        let obj = params.data[col];
        return obj == 1 ? "$" : "%";
    }

    /**buy priority Renderer */
    buyPriorityRenderer(params) {
        let col = params.column.colId;
        let obj = params.data[col];
        return obj == 1 ? "Do Not Buy" : obj == 2 ? "Hard To Buy" : obj == 3 ? "Can Buy" : obj == 4 ? "Buy To Target" : obj == 5 ? "Priority Buy" : '';
    }


    /**sell priority Renderer */
    sellPriorityRenderer(params) {
        let col = params.column.colId;
        let obj = params.data[col];
        return obj == 1 ? "Do Not Sell" : obj == 2 ? "Hard To Sell" : obj == 3 ? "Sell If No Gain" : obj == 4 ? "Can Sell" : obj == 5 ? "Sell To Target" : obj == 6 ? "Priority Sell" : '';
    }

    /*** method to display context menu on accounts agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        contextResult.push({ name: '<hidden id=' + params.node.data.id + ' title="Edit Preferences">Edit Preferences</hidden>' });
        contextResult.push({ name: '<hidden id=' + params.node.data.id + ' title="Delete Preferences">Delete Preferences</hidden>' });

        return contextResult;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {

        if (targetElement.title === "Edit Preferences") {
            this.displayRedemptionFeePref = true;

            this.redemptionfeePref = Object.create(this.PrefrowData.find(x => x.id == targetElement.id));

            //Assiging security properties
            this.securityName = this.redemptionfeePref.securityName;
            this.securityId = this.redemptionfeePref.id;
            this.securityType = this.redemptionfeePref.securityType;
            this.securitySymbol = this.redemptionfeePref.symbol;

            //Assiging preferences because to get all fields in edit.(getting only changed fields because of object.create)(object.create is for clearing the fields on cancel)

            this.redemptionfeePref.redemptionFeeTypeId = this.redemptionfeePref.redemptionFeeTypeId;
            this.redemptionfeePref.redemptionFeeAmount = this.redemptionfeePref.redemptionFeeAmount;
            this.redemptionfeePref.redemptionFeeDays = this.redemptionfeePref.redemptionFeeDays;

            //Assigning redemption fee type ids
            if (this.redemptionfeePref.redemptionFeeTypeId == 1)
                this.type = "$";
            else
                this.type = "%";

        }
        if (targetElement.title === "Delete Preferences") {
            let selectedPrefToDelete = targetElement.id;
            this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == selectedPrefToDelete), 1);
            this.gridOptions.api.setRowData(this.gridOptions.rowData);

        }
    }

    getYesOrNoOptions() {
        this.yesOrNOoData = this._securityService.getYesOrNoValuesForPreferences();
    }

    cancel() {
        this.displayRedemptionFeePref = false;
        this.bindSecurityEmptyData(this.redemptionfeePref);
        this.securityName = null;
        this.securityId = null;
    }

    /** Fields */
    // redemptionFeeTypeId: number;
    redemptionFeeAmount: any;
    redemptionFeeDays: number;

    //To add data to grid
    addtoGrid() {
        let currentSecType = this.securityTypes.find(st=>st.id ==(parseInt(""+this.securityType))).name;;
        this.displayRedemptionFeePref = false;
        // this.securityPref = <ISecurityPreference>{};      
        this.redemptionfeePref.securityName = this.securityName;
        this.redemptionfeePref.id = parseInt(""+this.securityId);
        // if (this.redemptionfeePref.id != undefined) {

            this.redemptionfeePref.securityType = currentSecType;
            this.redemptionfeePref.symbol = this.securitySymbol;
            if (this.type == "$")
                this.redemptionfeePref.redemptionFeeTypeId = 1;
            else
                this.redemptionfeePref.redemptionFeeTypeId = 2;
            
            this.redemptionfeePref.redemptionFeeAmount = this.redemptionFeeAmount;
            this.redemptionfeePref.redemptionFeeDays = this.redemptionFeeDays;

            let match = this.PrefrowData.filter(x => x.id == this.redemptionfeePref.id);
            if (match.length > 0) {
                match[0] = this.redemptionfeePref;
                let indexVal = this.findExpandedRowIndex(this.PrefrowData, "id", match[0].id);
                this.PrefrowData[indexVal] = match[0];
                this.gridOptions.api.setRowData(this.PrefrowData);
            }

            else {
                this.PrefrowData.push(this.redemptionfeePref);
                this.gridOptions.api.setRowData(this.PrefrowData);
            }

            this.resetForm();
        // }


    }
    // binding InheritedSecurity Preference to gridOptions
    bindSecurityData(securityResults) {
        this.resetForm();
        //this.fromParent.securityPreferences = securityResults;
        this.PrefrowData = this.fromParent.securityPreferences;
        this.createColumnDefs();

        this.redemptionfeePref = <IRedemptionFeePreference>{
            id: null,
            securityName: null,
            securityType: null,
            symbol: null,
            redemptionFeeTypeId: null,
            redemptionFeeAmount: null,
            redemptionFeeDays: null,
        }
    }

    validatePercent(value) {
        if (value.redemptionFeeAmount > 100)
            this.redemptionfeePref.redemptionFeeAmount = 100;
    }

}

