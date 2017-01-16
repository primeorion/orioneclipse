import { Component, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { SecurityService } from '../../services/security.service';
import { SecuritySetService } from '../../services/securityset.service';
import { ISecurity } from '../../models/security';
import { ISecurityPreference, ISecuritySimple, ISecurityPreferencesGet } from '../../models/Preferences/securityPreference';
import { BaseComponent } from '../../core/base.component';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';

import { Dialog } from 'primeng/components/dialog/dialog';


@Component({
    selector: 'Security-DataGrid',
    templateUrl: './app/shared/security/security.preference.component.html',
    providers: [SecurityService, SecuritySetService]
})

export class SecurityPreferenceComponent extends BaseComponent {

    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    securityName: string;
    securityId: number;
    securityType: string;
    securitySymbol: string;
    security: ISecurity = <ISecurity>{};
    private allSecurities: ISecurity[];
    private securityData: ISecurity[];

    private PrefrowData: ISecurityPreference[] = [];
    filteredSecurityResult: any[] = [];
    private selectedSecurity: any;
    //tax alternates auto complete
    selectedExempt: any;
    private selectedTax: any;//ISecuritySimple = <ISecuritySimple>{};
    selectedDeffered: any;

    //end of tax alternates auto complete
    btnDisableSetPref: boolean = true;
    displaySecPref: boolean = false;
    securityPref: ISecurityPreference = <ISecurityPreference>{};
    type: string = "$";
    custodianFeetype: string = "$";
    filteredAlternates: any[] = [];
    filteredTaxExempts: any[] = [];
    filteredTaxDeffered: any[] = [];
    canShow: boolean = true;
    canRead: boolean = false;
    yesOrNOoData: any[] = [];
    buyPriorityList: any[] = [];
    sellPriorityList: any[] = [];

    @Input() displaypermission: string;
    @Input() fromParent: ISecurityPreferencesGet;
    fromParentPrefLevel: string;

    constructor(private _securityService: SecurityService, private _securitySetService: SecuritySetService) {
        super();
        this.gridOptions = <GridOptions>{};

        this.securityPref = <ISecurityPreference>{
            taxableDivReInvest: null,
            taxDefDivReinvest: null,
            taxExemptDivReinvest: null,
            capGainReinvestTaxable: null,
            capGainsReinvestTaxDef: null,
            capGainsReinvestTaxExempt: null,
            excludeHolding: null,
            sellPriority: null,
            buyPriority: null

        };

        console.log("pref level from constructor", this.fromParentPrefLevel);
    }

    ngOnInit() {
        // this.getSecurities();
        this.getYesOrNoOptions();
        this.PrefrowData = this.fromParent.securityPreferences;
        this.fromParentPrefLevel = this.fromParent.levelName.toLowerCase()
        console.log("fromParentPrefLevel data:", this.fromParentPrefLevel);
        this.createColumnDefs();
        this.getProrities();

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
    setPrefPopup(security) {

        this.displaySecPref = true;
        this.type = "$";
        this.custodianFeetype = "$";
        this.securityName = security.name;
        this.securityId = security.id;
        this.securityType = security.securityType;
        this.securitySymbol = security.symbol;
        security.name = "";
        this.resetForm();
        this.bindSecurityEmptyData(security);
        this.getProrities();
    }

    getProrities() {
        Observable.forkJoin(
            this._securitySetService.getBuyPriorityList().map((response: Response) => response.json()),
            this._securitySetService.getSellPriorityList().map((response: Response) => response.json())

        ).subscribe(data => {
            this.buyPriorityList = data[0];
            this.sellPriorityList = data[1];

        });
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
        this.securityPref = <ISecurityPreference>{};
        this.selectedSecurity = [];
        this.btnDisableSetPref = true;
        this.selectedSecurity = "";
        this.selectedTax = []
        this.selectedExempt = [];
        this.selectedDeffered = [];


    }

    bindSecurityEmptyData(security) {

        this.securityPref = <ISecurityPreference>{
            id: security.id,
            securityName: security.name,
            securityType: security.securityType,
            symbol: security.symbol,
            redemptionFeeTypeId: null,
            redemptionFeeAmount: null,
            redemptionFeeDays: null,
            sellTradeMinAmtBySecurity: null,
            sellTradeMinPctBySecurity: null,
            buyTradeMinAmtBySecurity: null,
            buyTradeMinPctBySecurity: null,
            buyTradeMaxAmtBySecurity: null,
            buyTradeMaxPctBySecurity: null,
            sellTradeMaxAmtBySecurity: null,
            sellTradeMaxPctBySecurity: null,
            taxableAlternate: null,
            taxDeferredAlternate: null,
            taxExemptAlternate: null,
            taxableDivReInvest: null,
            taxDefDivReinvest: null,
            taxExemptDivReinvest: null,
            capGainReinvestTaxable: null,
            capGainsReinvestTaxExempt: null,
            capGainsReinvestTaxDef: null,
            sellTransactionFee: null,
            buyTransactionFee: null,
            custodianRedemptionFeeTypeId: null,
            custodianRedemptionDays: null,
            custodianRedemptionFeeAmount: null,
            excludeHolding: null,
            sellPriority: null,
            buyPriority: null
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
            if (this.securityPref.redemptionFeeAmount != undefined && this.securityPref.redemptionFeeAmount != "" && this.securityPref.redemptionFeeAmount > 100)
                this.securityPref.redemptionFeeAmount = 100;
        }
        else
            this.type = "$";

    }

    /**
     * Custodian Redemption Fee Type Change event
     */
    oncustodianFeeTypeChangee(event) {
        if (event.srcElement.value == "%") {
            this.custodianFeetype = "%";
            if (this.securityPref.custodianRedemptionFeeAmount != undefined && this.securityPref.custodianRedemptionFeeAmount != "" && this.securityPref.custodianRedemptionFeeAmount > 100)
                this.securityPref.custodianRedemptionFeeAmount = 100;
        }
        else
            this.custodianFeetype = "$";

    }


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
            <ColDef>{
                headerName: "Security Details", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Security Id", field: "id", width: 150, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Security Name", field: "securityName", width: 150, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Type", field: "securityType", width: 150, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Symbol", field: "symbol", width: 150, cellClass: 'text-center', filter:'text' },
                ]
            },

            <ColDef>{
                headerName: "Redemption Fee", cellClass: 'text-center',
                children: [
                    <ColDef>{ headerName: "Type", field: "redemptionFeeTypeId", width: 110, cellClass: 'text-center', cellRenderer: this.feeTypeRenderer, filter:'text' },
                    <ColDef>{ headerName: "Amount", field: "redemptionFeeAmount", width: 180, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Days", field: "redemptionFeeDays", width: 110, cellClass: 'text-center', filter:'number' },
                ]
            },

            <ColDef>{
                headerName: "Trade MIN", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Sell Amount", field: "sellTradeMinAmtBySecurity", width: 90, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Sell Percent", field: "sellTradeMinPctBySecurity", width: 90, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Buy Amount", field: "buyTradeMinAmtBySecurity", width: 90, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Buy Percent", field: "buyTradeMinPctBySecurity", width: 90, cellClass: 'text-center', filter:'text' },

                ]
            },

            <ColDef>{
                headerName: "Trade MAX", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Sell Amount", field: "sellTradeMaxAmtBySecurity", width: 90, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Sell Percent", field: "sellTradeMaxPctBySecurity", width: 90, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Buy Amount", field: "buyTradeMaxAmtBySecurity", width: 90, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Buy Percent", field: "buyTradeMaxPctBySecurity", width: 90, cellClass: 'text-center', filter:'text' },

                ]
            },
            <ColDef>{
                headerName: "Tax Alternates", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Taxable", field: "taxableAlternate.name", width: 90, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Tax Deferred", field: "taxDeferredAlternate.name", width: 90, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Tax Exempt", field: "taxExemptAlternate.name", width: 90, cellClass: 'text-center', filter:'text' }


                ]
            },

            <ColDef>{
                headerName: "Tax Preference Dividend Reinvest", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Taxable", field: "taxableDivReInvest", width: 90, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                    <ColDef>{ headerName: "Tax Deferred", field: "taxDefDivReinvest", width: 110, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                    <ColDef>{ headerName: "Tax Exempt", field: "taxExemptDivReinvest", width: 110, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                ]
            },

            <ColDef>{
                headerName: "Capital Gain Reinvest", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Taxable", field: "capGainReinvestTaxable", width: 90, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                    <ColDef>{ headerName: "TaxDeferred", field: "capGainsReinvestTaxDef", width: 110, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                    <ColDef>{ headerName: "TaxExempt", field: "capGainsReinvestTaxExempt", width: 110, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },
                ]
            },

            <ColDef>{
                headerName: "Custodian Specific Redemption Fee", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Type", field: "custodianRedemptionFeeTypeId", width: 110, cellClass: 'text-center', cellRenderer: this.feeTypeRenderer, filter:'number' },
                    <ColDef>{ headerName: "Amount", field: "custodianRedemptionFeeAmount", width: 110, cellClass: 'text-center', filter:'number' },
                    <ColDef>{ headerName: "Days", field: "custodianRedemptionDays", width: 110, cellClass: 'text-center', filter:'number' },
                ]
            },

            <ColDef>{
                headerName: "Trading", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Exclude Holding", field: "excludeHolding", width: 90, cellClass: 'text-center', cellRenderer: this.yesOrNoRenderer, filter:'text' },

                ]
            },

            <ColDef>{
                headerName: "Transaction Fee", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Sell Transaction Fee", field: "sellTransactionFee", width: 90, cellClass: 'text-center', filter:'text' },
                    <ColDef>{ headerName: "Buy Transaction Fee", field: "buyTransactionFee", width: 110, cellClass: 'text-center', filter:'text' }
                ]
            },

            <ColDef>{
                headerName: "Trade Settings", cellStyle: { text: 'center' },
                children: [
                    <ColDef>{ headerName: "Sell Priority", field: "sellPriority", width: 90, cellClass: 'text-center', cellRenderer: this.sellPriorityRenderer, filter:'number' },
                    <ColDef>{ headerName: "Buy Priority", field: "buyPriority", width: 110, cellClass: 'text-center', cellRenderer: this.buyPriorityRenderer, filter:'number' }
                ]
            },

        ]

    }


    /**Yes no Renderer */
    yesOrNoRenderer(params) {
        let col = params.column.colId;
        let obj = params.data[col];
        return obj == true ? "Yes" : obj == false ? "No" : '';
    }

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
            this.displaySecPref = true;

            this.securityPref = Object.create(this.PrefrowData.find(x => x.id == targetElement.id));

            //Assiging security properties
            this.securityName = this.securityPref.securityName;
            this.securityId = this.securityPref.id;
            this.securityType = this.securityPref.securityType;
            this.securitySymbol = this.securityPref.symbol;

            //Assiging preferences because to get all fields in edit.(getting only changed fields because of object.create)(object.create is for clearing the fields on cancel)

            this.securityPref.redemptionFeeTypeId = this.securityPref.redemptionFeeTypeId;
            this.securityPref.redemptionFeeAmount = this.securityPref.redemptionFeeAmount;
            this.securityPref.redemptionFeeDays = this.securityPref.redemptionFeeDays;
            this.securityPref.sellTradeMinAmtBySecurity = this.securityPref.sellTradeMinAmtBySecurity;
            this.securityPref.sellTradeMinPctBySecurity = this.securityPref.sellTradeMinPctBySecurity;
            this.securityPref.buyTradeMinAmtBySecurity = this.securityPref.buyTradeMinAmtBySecurity;
            this.securityPref.buyTradeMinPctBySecurity = this.securityPref.buyTradeMinPctBySecurity;
            this.securityPref.sellTradeMaxAmtBySecurity = this.securityPref.sellTradeMaxAmtBySecurity;
            this.securityPref.sellTradeMaxPctBySecurity = this.securityPref.sellTradeMaxPctBySecurity;
            this.securityPref.buyTradeMaxAmtBySecurity = this.securityPref.buyTradeMaxAmtBySecurity;
            this.securityPref.buyTradeMaxPctBySecurity = this.securityPref.buyTradeMaxPctBySecurity;

            this.securityPref.taxableAlternate = this.securityPref.taxableAlternate;
            this.securityPref.taxDeferredAlternate = this.securityPref.taxDeferredAlternate;
            this.securityPref.taxExemptAlternate = this.securityPref.taxExemptAlternate;

            this.securityPref.taxableDivReInvest = this.securityPref.taxableDivReInvest;
            this.securityPref.taxDefDivReinvest = this.securityPref.taxDefDivReinvest;
            this.securityPref.taxExemptDivReinvest = this.securityPref.taxExemptDivReinvest;

            this.securityPref.capGainReinvestTaxable = this.securityPref.capGainReinvestTaxable;
            this.securityPref.capGainsReinvestTaxDef = this.securityPref.capGainsReinvestTaxDef;
            this.securityPref.capGainsReinvestTaxExempt = this.securityPref.capGainsReinvestTaxExempt;

            this.securityPref.custodianRedemptionFeeTypeId = this.securityPref.custodianRedemptionFeeTypeId;
            this.securityPref.custodianRedemptionFeeAmount = this.securityPref.custodianRedemptionFeeAmount;
            this.securityPref.custodianRedemptionDays = this.securityPref.custodianRedemptionDays;

            this.securityPref.excludeHolding = this.securityPref.excludeHolding;

            this.securityPref.sellPriority = this.securityPref.sellPriority;
            this.securityPref.buyPriority = this.securityPref.buyPriority;

            //Assigning redemption fee type ids
            if (this.securityPref.redemptionFeeTypeId == 1)
                this.type = "$";
            else
                this.type = "%";

            if (this.securityPref.custodianRedemptionFeeTypeId == 1)
                this.custodianFeetype = "$";
            else
                this.custodianFeetype = "%";

            //assiging auto complete selected values
            this.selectedTax = [];
            this.selectedDeffered = [];
            this.selectedExempt = [];
            if (this.securityPref.taxableAlternate != null && this.securityPref.taxableAlternate.id != undefined)
                this.selectedTax = this.securityPref.taxableAlternate ? this.securityPref.taxableAlternate : null;
            if (this.securityPref.taxDeferredAlternate != null && this.securityPref.taxDeferredAlternate.id != undefined)
                this.selectedDeffered = this.securityPref.taxDeferredAlternate ? this.securityPref.taxDeferredAlternate : null;
            if (this.securityPref.taxExemptAlternate != null && this.securityPref.taxExemptAlternate.id != undefined)
                this.selectedExempt = this.securityPref.taxExemptAlternate ? this.securityPref.taxExemptAlternate : null;


        }
        if (targetElement.title === "Delete Preferences") {
            let selectedPrefToDelete = targetElement.id;
            this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == selectedPrefToDelete), 1);
            this.gridOptions.api.setRowData(this.gridOptions.rowData);

        }
    }


    /**
     * Taxable Alternate auto complete
     */
    autoTaxAlternateSearch(event) {

        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {

                this.filteredAlternates = securitiesResult;

                // securitiesResult.forEach(element => {
                //     this.filteredAlternates.push(<ISecuritySimple>{ id: element.id, name: element.name })
                // })
            });


    }

    /**
     * Taxable Alternate on selection changed event
     */
    handleSelectedtax(tax) {
        this.selectedTax = tax;

    }


    /**
     * Tax Exempt Auto Complete
     */

    autoTaxExemptSearch(event) {
        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {

                this.filteredTaxExempts = securitiesResult;


                // securitiesResult.forEach(element => {
                //     this.filteredTaxExempts.push(<ISecuritySimple>{ id: element.id, name: element.name })
                // })
            });
    }

    /**
     * TTax Exempt on selection changed event
     */
    handleSelectedExempt(exempt) {
        this.selectedExempt = exempt;

    }

    /**
     * Tax Deffered Auto Complete
     */
    autoTaxDefferedSearch(event) {

        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {

                this.filteredTaxDeffered = securitiesResult;

                // securitiesResult.forEach(element => {
                //     this.filteredTaxDeffered.push(<ISecuritySimple>{ id: element.id, name: element.name })
                // })
            });

    }

    /**
     * TTax Deffered on selection changed event
     */
    handleSelectedDeffered(deffered) {
        this.selectedDeffered = deffered;

    }

    getYesOrNoOptions() {
        this.yesOrNOoData = this._securityService.getYesOrNoValuesForPreferences();

    }

    cancel() {
        this.displaySecPref = false;
        this.bindSecurityEmptyData(this.securityPref);
        this.securityName = null;
        this.securityId = null;
    }

    //To add data to grid
    addtoGrid() {
        this.displaySecPref = false;
        // this.securityPref = <ISecurityPreference>{};      
        this.securityPref.securityName = this.securityName;
        this.securityPref.id = this.securityId;
        if (this.securityPref.id != undefined) {

            this.securityPref.securityType = this.securityType;
            this.securityPref.symbol = this.securitySymbol;
            if (this.type == "$")
                this.securityPref.redemptionFeeTypeId = 1;
            else
                this.securityPref.redemptionFeeTypeId = 2;
            if (this.fromParentPrefLevel == "custodian") {
                if (this.custodianFeetype == "$")
                    this.securityPref.custodianRedemptionFeeTypeId = 1;
                else
                    this.securityPref.custodianRedemptionFeeTypeId = 2;
            }
            this.securityPref.buyPriority = this.securityPref.buyPriority;
            if (this.selectedTax != undefined)
                this.securityPref.taxableAlternate = <ISecuritySimple>{ id: this.selectedTax.id, name: this.selectedTax.name };
            if (this.selectedDeffered != undefined)
                this.securityPref.taxDeferredAlternate = <ISecuritySimple>{ id: this.selectedDeffered.id, name: this.selectedDeffered.name };
            if (this.selectedExempt != undefined)
                this.securityPref.taxExemptAlternate = <ISecuritySimple>{ id: this.selectedExempt.id, name: this.selectedExempt.name };

            let match = this.PrefrowData.filter(x => x.id == this.securityPref.id);
            if (match.length > 0) {
                match[0] = this.securityPref;
                let indexVal = this.findExpandedRowIndex(this.PrefrowData, "id", match[0].id);
                this.PrefrowData[indexVal] = match[0];
                this.gridOptions.api.setRowData(this.PrefrowData);
            }

            else {
                this.PrefrowData.push(this.securityPref);
                this.gridOptions.api.setRowData(this.PrefrowData);
            }

            this.resetForm();
        }


    }
    // binding InheritedSecurity Preference to gridOptions
    bindSecurityData(securityResults) {
        this.resetForm();
        //this.fromParent.securityPreferences = securityResults;
        this.PrefrowData = this.fromParent.securityPreferences;
        this.createColumnDefs();

        this.securityPref = <ISecurityPreference>{
            id: null,
            securityName: null,
            securityType: null,
            symbol: null,
            redemptionFeeTypeId: null,
            redemptionFeeAmount: null,
            redemptionFeeDays: null,
            sellTradeMinAmtBySecurity: null,
            sellTradeMinPctBySecurity: null,
            buyTradeMinAmtBySecurity: null,
            buyTradeMinPctBySecurity: null,
            buyTradeMaxAmtBySecurity: null,
            buyTradeMaxPctBySecurity: null,
            sellTradeMaxAmtBySecurity: null,
            sellTradeMaxPctBySecurity: null,
            taxableAlternate: null,
            taxDeferredAlternate: null,
            taxExemptAlternate: null,
            taxableDivReInvest: null,
            taxDefDivReinvest: null,
            taxExemptDivReinvest: null,
            capGainReinvestTaxable: null,
            capGainsReinvestTaxExempt: null,
            capGainsReinvestTaxDef: null,
            sellTransactionFee: null,
            buyTransactionFee: null,
            custodianRedemptionFeeTypeId: null,
            custodianRedemptionDays: null,
            custodianRedemptionFeeAmount: null,
            sellPriority: null,
            buyPriority: null
        }
    }



    validatePercent(value) {
        if (value.redemptionFeeAmount > 100)
            this.securityPref.redemptionFeeAmount = 100;

        else if (value.sellTradeMinPctBySecurity > 100)
            this.securityPref.sellTradeMinPctBySecurity = 100;

        else if (value.buyTradeMinPctBySecurity > 100)
            this.securityPref.buyTradeMinPctBySecurity = 100;

        else if (value.sellTradeMaxPctBySecurity > 100)
            this.securityPref.sellTradeMaxPctBySecurity = 100;

        else if (value.buyTradeMaxPctBySecurity > 100)
            this.securityPref.buyTradeMaxPctBySecurity = 100;

        else if (value.custodianRedemptionFeeAmount > 100)
            this.securityPref.custodianRedemptionFeeAmount = 100;

    }
    setDropdownSelectedOption(event, taxexemeptname) {
        console.log("setDropdownSelectedOption", event, " ", taxexemeptname)
        if (event == "0: null") {
            switch (taxexemeptname) {

                case "taxExemptDivReinvest":
                    this.securityPref.taxExemptDivReinvest = null;
                    break;

                case "taxDefDivReinvest":
                    this.securityPref.taxDefDivReinvest = null;
                    break;
                case "taxableDivReInvest":
                    this.securityPref.taxableDivReInvest = null;
                    break;

                case "capGainReinvestTaxable":
                    this.securityPref.capGainReinvestTaxable = null;
                    break;

                case "capGainsReinvestTaxDef":
                    this.securityPref.capGainsReinvestTaxDef = null;
                    break;

                case "capGainsReinvestTaxExempt":
                    this.securityPref.capGainsReinvestTaxExempt = null;
                    break;

                case 'excludeHolding':
                    this.securityPref.excludeHolding = null;
                    break;
            }
        }
    }
}

