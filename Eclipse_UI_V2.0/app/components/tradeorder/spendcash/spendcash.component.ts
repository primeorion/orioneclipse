import { Component, HostListener, ViewChild} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
// import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { IExcelImport } from '../../../models/tradetools';
import { ISpendCashParentModel, ISpendFullAmount } from '../../../models/spendcash';
import { ITradeToolCalculationMethods, ICalculationMethod } from '../../../models/tradetoolcalculation';
import { SpendCashService } from '../../../services/spendcash.service';
import { TradeToolsService } from '../../../services/tradetools.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { AccountService } from '../../../services/account.service';
import { TradeOrderFilterComponent } from '../../tradeorder/shared/tradeorder.tradefilter.component';
import { TradeToolsBusinessObjects } from '../../../businessobjects/tradetools.businessobjects';

@Component({
    selector: 'eclipse-tradetools-spendcash',
    templateUrl: './app/components/tradeorder/spendcash/spendcash.component.html'
})

export class SpendCashComponent extends BaseComponent {
    private spendcashGridOptions: GridOptions;
    private emphasisGridOptions: GridOptions;
    private preSelectedEmphasizedGridOptions: GridOptions; //TODO: Need to change and remove
    private spendcashColDefs: ColDef[];
    private emphasisGridColDefs: ColDef[];
    viewName: string = "SelectionTab";
    selectedModelData: ISpendCashParentModel;
    uploadedFileRecordType: string;
    disableFilterNextBtn: boolean = true;
    disableCreateTradeNextBtn: boolean = false;
    calculationMethods: ICalculationMethod[] = [];
    filterdCalculationMethods: ICalculationMethod[] = [];
    selectedMethodId: number;
    isBuyRebalancewithEmphasis: boolean = false;
    modelNodes: any[];
    portfolioIdForEmphasis: number;
    isWithOutEmphasisTab: boolean = true;
    spendFullAmountOptions: ISpendFullAmount[] = [];
    // spendContribution: boolean = false;
    isSleevePortfolio: boolean = false;
    reasonNote: string;
    selectedSpendFullAmountOption: string;
    preSelectedEmphasizedAccounts: any[] = [];
    portfolioContributionItem: any;

    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;
    constructor(private _router: Router,
        private _tradeToolsService: TradeToolsService,
        private _portfolioService: PortfolioService,
        private _accountService: AccountService,
        private tradeToolsBo: TradeToolsBusinessObjects
        //private _spendCashService: SpendCashService //--------- MADE GENERIC
    ) {
        super();
        this.spendcashGridOptions = <GridOptions>{};
        this.emphasisGridOptions = <GridOptions>{};
        this.preSelectedEmphasizedGridOptions = <GridOptions>{};
        this.selectedModelData = <ISpendCashParentModel>{
            selectedFile: <IExcelImport>{}, selectedVal: '', selectedAccountsList: [], isSpendCash: true, portfolioId: "",
            displayFilterOptions: {
                showAccounts: true, showModel: false, showPortfolio: false, showExcelImport: true, showSleeves: false, showtradeGroupsForAccounts: false, showSleevePortfolio: false,
                showtradeGroupsForPortfolio: false, showExcelImportPortfolio: false, showExcelImportSleeves: false, showAmountInput: true, showCalculateAtSleevePf: true
            }
        }
        this.modelNodes = [];
        this.selectedSpendFullAmountOption = "Use Default";
    }

    ngOnInit() {
        this.getSpendCashCalculationMethods();
        this.getSpendFullCashOptions();
    }

    /** Go to selected tab view */
    getSelectedView(viewName: string) {
        this.viewName = viewName;
        this.valideOnBackNextBtnClicks();
        if (this.tradeOrderFilterComponent != undefined && this.tradeOrderFilterComponent.tradeFilterMethod != undefined) {
            this.selectedModelData.selectedVal = this.tradeOrderFilterComponent.tradeFilterMethod;
            this.selectedModelData.selectedFile = this.tradeOrderFilterComponent.file;
            this.isSleevePortfolio = this.tradeOrderFilterComponent.isSleevePortfolio;
            this.selectedModelData.isCalculateAtSleevePf = this.tradeOrderFilterComponent.isCalculateAtSleevePf;

            // If we get result from upload file
            if (this.tradeOrderFilterComponent.uploadResults.recordType == 'account' ||
                this.tradeOrderFilterComponent.uploadResults.recordType == 'portfolio') {
                this.selectedModelData.selectedAccountsList = this.tradeOrderFilterComponent.uploadResults.records.filter(v => v.isValid);
            }
            else
                this.selectedModelData.selectedAccountsList = this.tradeOrderFilterComponent.List;

            // To enable/disble next button in second step
            if (this.selectedModelData.selectedAccountsList.length > 0)
                this.disableCreateTradeNextBtn = false;
            else
                this.disableCreateTradeNextBtn = true;

            // To get uploaded file record type
            if (this.tradeOrderFilterComponent.uploadResults.recordType != undefined)
                this.uploadedFileRecordType = this.tradeOrderFilterComponent.uploadResults.recordType;

            // To remove calculationMethod 'Buy Rebalance with Emphasis' on sleevePortfolio selection 
            if (this.selectedModelData.selectedVal == 'sleevePortfolio' || this.uploadedFileRecordType == 'portfolio')
                this.calculationMethods = this.filterdCalculationMethods.filter(a => a.id != SpendCalculationMethods.BuyRebalancewithEmphasis);
            else
                this.calculationMethods = this.filterdCalculationMethods;

            this.createColDefs();
        }
    }

    /** Validate on back/next button clicks */
    valideOnBackNextBtnClicks() {
        if (this.viewName == "finalTab") {
            this.reasonNote = undefined;
            this.selectedSpendFullAmountOption = "Use Default";
        }

        if (this.viewName == "SelectionTab") {
            //To reset grid on back button click
            this.getSpendCashCalculationMethods();
            this.isBuyRebalancewithEmphasis = false;
            this.createColDefs();

            if (this.selectedModelData.selectedAccountsList.length > 0)
                this.disableFilterNextBtn = false;
            else
                this.disableFilterNextBtn = true;
        }
    }

    /** To Create ColDefs */
    createColDefs() {
        this.spendcashColDefs = [];
        let self = this;
        if (this.selectedModelData.selectedVal == 'sleevePortfolio' || this.uploadedFileRecordType == 'portfolio') {
            this.spendcashColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 180 });
            this.spendcashColDefs.push(<ColDef>{ headerName: "Portfolio Name", field: 'name', width: 300 });
            this.spendcashColDefs.push(<ColDef>{ headerName: "Number", field: 'number', width: 300 });
            this.spendcashColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 300, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.amountCellRenderer(params, self);
                }
            });
            this.spendcashColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 200, cellRenderer: this.deleteCellRenderer });
        }
        if (this.selectedModelData.selectedVal == 'account' || this.uploadedFileRecordType == 'account') {
            this.spendcashColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 160 });
            this.spendcashColDefs.push(<ColDef>{ headerName: "Account Name", field: 'name', width: 260 });
            this.spendcashColDefs.push(<ColDef>{ headerName: "Type", field: 'type', width: 150 });
            this.spendcashColDefs.push(<ColDef>{ headerName: "Account Number", field: 'accountNumber', width: 290 });
            this.spendcashColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 280, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.amountCellRenderer(params, self);
                }
            });
            this.spendcashColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 180, cellRenderer: this.deleteCellRenderer });
        }
    }

    /** To Create ColDefs for emphasized */
    createEmphasisGridColDefs() {
        this.emphasisGridColDefs = [];
        let self = this;
        if (this.selectedModelData.selectedVal == 'account' || this.uploadedFileRecordType == 'account') {
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Account Name", field: 'name', width: 220 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Type", field: 'type', width: 100 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Account Number", field: 'accountNumber', width: 220 });
            if (this.isBuyRebalancewithEmphasis) {
                if (this.isWithOutEmphasisTab) {
                    this.emphasisGridColDefs.push(<ColDef>{
                        headerName: "Emphasis", field: "emphasis", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                            return self.withOutEmphasisCellRenderer(params, self);
                        }
                    });
                }
                else {
                    this.emphasisGridColDefs.push(<ColDef>{
                        headerName: "Emphasis", field: "emphasis", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                            return self.withEmphasisCellRenderer(params, self);
                        }
                    });
                }
            }
            this.emphasisGridColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.amountCellRenderer(params, self);
                }
            });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "", field: 'portfolioId', width: 120, hide: true });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 120, cellRenderer: this.deleteCellRenderer });
        }
    }

    /** Delete cell renderer */
    deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i id =' + params.node.data.id + ' title="Delete" class="fa fa-times red" aria-hidden="true"></i></span>';
        return result;
    }

    /** To render amount cell */
    amountCellRenderer(params, self) {
        let result;
        if (params.data[params.colDef.field] == undefined) {
            result = document.createElement("label");
            return result;
        } else {
            var eInput = document.createElement("input");
            eInput.className = "form-control grid-input";
            eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
            eInput.addEventListener('blur', function (event) {
                params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
            });

            // To validate sleeve portfolio contribution amount on row level
            eInput.addEventListener('keyup', function (event) {
                if (self.selectedModelData.selectedVal == "sleevePortfolio") {
                    self.getPortfolioContributionAmount(params.data.id);
                    if (eInput.value > self.portfolioContributionItem.amount)
                        eInput.value = self.portfolioContributionItem.amount;
                }
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
            });
            return eInput;
        }
    }

    /** To render emphasis cell */
    withOutEmphasisCellRenderer(params, self) {
        //console.log('withOutEmphasisCellRenderer : ', self.portfolioIdForEmphasis);
        if (params.data['portfolioId'] != undefined)
            self.portfolioIdForEmphasis = params.data['portfolioId'];
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eSelect = document.createElement("select");

        var eOption = document.createElement("option");
        eOption.setAttribute("value", "0");
        eOption.innerHTML = 'Select';
        eSelect.appendChild(eOption);

        let list = self.modelNodes;
        if (list != undefined && list.length > 0) {
            list.forEach(function (item) {
                if (item.portfolioId == self.portfolioIdForEmphasis) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.subModelId);
                    eOption.innerHTML = 'Level ' + item.level + '( ' + item.subModelName + ' )';
                    eSelect.appendChild(eOption);
                }
            });
        }

        eSelect.value = params.data['subModelId'] == undefined ? "0" : params.data['subModelId'];
        eCell.appendChild(eSelect);
        eSelect.focus();

        eSelect.addEventListener('change', function () {
            var newValue = eSelect.value == undefined ? '' : eSelect.selectedOptions[0].textContent;
            params.data[params.colDef.field] = newValue;
            params.data['subModelId'] = eSelect.value;

            var updatedNodes = [];
            updatedNodes.push(params.node)
            self.emphasisGridOptions.api.refreshRows(updatedNodes);
            //To check nodes are seleceted or not
            self.nodeSelectionValidation();
        });
        return eCell;
    }

    /** To validate node selected or not  */
    nodeSelectionValidation() {
        let match = this.selectedModelData.selectedAccountsList.filter(u => u.subModelId == undefined || u.subModelId == "0");
        if (match.length > 0)
            this.disableCreateTradeNextBtn = true;
        else
            this.disableCreateTradeNextBtn = false;
    }

    /** To get portfolio contribution amount */
    getPortfolioContributionAmount(sleevePortfolioId: number) {
        Util.responseToObject<any>(this._portfolioService.getPortfolioContributionAmount(sleevePortfolioId))
            .subscribe(m => {
                this.portfolioContributionItem = m;
            });
    }

    /** To render emphasis cell */
    withEmphasisCellRenderer(params, self) {
        // self.portfolioIdForEmphasis = params.data['portfolioId'];
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eSelect = document.createElement("select");

        var eOption = document.createElement("option");
        eOption.setAttribute("value", "0");
        eOption.innerHTML = 'Test PreSelected Emphasis';
        eSelect.appendChild(eOption);

        eSelect.value = params.data['subModelId'] == undefined ? "0" : params.data['subModelId'];
        eCell.appendChild(eSelect);
        eSelect.focus();
        return eCell;
    }

    /** Hostlistener for ag-grid context menu actions */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) {
            return;
        }
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, val = 0] = matches;
        if (targetElement.title === "Delete") {
            this.DeleteItem(id);
        }
    }

    /** Fires on emphasis tabs click  */
    emphasisTabsClick(emphasisTab: string) {
        if (emphasisTab == "withOutEmphasisTab") {
            this.isWithOutEmphasisTab = true;
            this.createEmphasisGridColDefs();
        }
        else {
            this.isWithOutEmphasisTab = false;
            this.emphasisGridColDefs = [];
            // this.createEmphasisGridColDefs();
            this.preSelectedEmphasizedAccounts = [];
        }
    }

    /** Refresh the ag-grid after delete performed */
    private DeleteItem(id) {
        if (this.selectedMethodId == SpendCalculationMethods.BuyRebalancewithEmphasis) {
            this.emphasisGridOptions.rowData.splice(this.emphasisGridOptions.rowData.findIndex(x => x.id == parseInt(id)), 1);
            this.emphasisGridOptions.api.setRowData(this.emphasisGridOptions.rowData);
            this.emphasisGridOptions.api.refreshView();

            // if (this.emphasisGridOptions.rowData.length == 0)
            //     this.selectedModelData.selectedAccountsList = [];
        } else {
            this.spendcashGridOptions.rowData.splice(this.spendcashGridOptions.rowData.findIndex(x => x.id == parseInt(id)), 1);
            this.spendcashGridOptions.api.setRowData(this.spendcashGridOptions.rowData);
        }

        //To enable/disable button
        if ((this.spendcashGridOptions.rowData != undefined && this.spendcashGridOptions.rowData.length > 0) ||
            (this.emphasisGridOptions.rowData != undefined && this.emphasisGridOptions.rowData.length > 0))
            this.disableCreateTradeNextBtn = false;
        else
            this.disableCreateTradeNextBtn = true;
    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersData(event) {
        this.disableFilterNextBtn = event.value;
    }

    /** To spend cash calculation methods */
    getSpendCashCalculationMethods() {
        this.tradeToolsBo.getTradeToolCalculationMethods(TradeToolType.SpendCash)
            .subscribe(m => {
                this.selectedMethodId = m.selectedMethodId;
                this.calculationMethods = m.methods;
                this.filterdCalculationMethods = m.methods;
            },
            error => {
                console.log('getSpendCashCalculationMethods error : ', error);
            })
    }

    /** Fires on calculation method change */
    changeCalculateMethod(selectedMethod) {
        this.selectedMethodId = +selectedMethod;
        if (this.selectedMethodId == SpendCalculationMethods.BuyRebalancewithEmphasis) {
            this.isBuyRebalancewithEmphasis = true;
            this.isWithOutEmphasisTab = true;
            // To check nodes are seleceted or not
            this.nodeSelectionValidation();

            // If we get accounts from file upload
            if (this.uploadedFileRecordType == 'account') {
                this.getPortfolioIdByAccountId();
            }
            else {
                this.modelNodes = [];
                this.processForNodes(this.selectedModelData.selectedAccountsList);
            }
        }
        else {
            this.isBuyRebalancewithEmphasis = false;
            this.disableCreateTradeNextBtn = false;
            this.createColDefs();
        }
    }

    /** To get nodes for seleceted accounts based on portfolioId */
    processForNodes(list) {
        // To find distinct by portfolioId
        let distinctList = list.filter((pf, i) => {
            return list.findIndex(m => m.portfolioId == pf.portfolioId) == i;
        });

        let elements = [];
        distinctList.forEach(element => {
            if (element.portfolioId != undefined) {
                elements.push(this._portfolioService.getModelNodesOfPortfolio(element.portfolioId)
                    .map((response: Response) => response.json()));
            }
        });

        Observable.forkJoin(elements)
            .subscribe((model: any[]) => {
                model.forEach(e => {
                    this.getModelNodes(e);
                    // this.createEmphasisGridColDefs();
                });
                this.createEmphasisGridColDefs();
            });
    }

    /** To get portfolioid by accountId -- on accounts excel import */
    getPortfolioIdByAccountId() {
        let accounts = [];
        this.selectedModelData.selectedAccountsList.forEach(element => {
            accounts.push(this._accountService.getPortfolioIdByAccountId(element.id)
                .map((response: Response) => response.json()));
        });

        Observable.forkJoin(accounts)
            .subscribe((model: any[]) => {
                // To build new list for accounts excel import with portfolio id and again assigning back to selectedModelData.selectedAccountsList
                let newList = [];
                this.selectedModelData.selectedAccountsList.forEach(e => {
                    model.forEach(ap => {
                        if (e.id == ap.acountId)
                            newList.push({ id: e.id, name: e.name, accountId: e.accountId, amount: e.amount, accountNumber: e.accountNumber, portfolioId: ap.portfolioId });
                    })
                });
                this.selectedModelData.selectedAccountsList = [];
                this.selectedModelData.selectedAccountsList = newList;
                // console.log('new list : ', this.selectedModelData.selectedAccountsList);

                this.processForNodes(model);
            });
    }

    /** To alter nodes  */
    getModelNodes(data) {
        let self = this;
        self.portfolioIdForEmphasis = data['portfolioId'];
        if (data['levels'] != undefined && data['levels'].length != 0 && data['levels'] != []) {
            data['levels'].forEach(function (val, key) {
                val['subModels'].forEach(e => {
                    self.modelNodes.push({
                        level: val['level'],
                        subModelId: e['id'],
                        subModelName: e['subModelName'],
                        portfolioId: self.portfolioIdForEmphasis
                    });
                })
            });
        }
    }

    /** To get Spend full amount options */
    getSpendFullCashOptions() {
        this.spendFullAmountOptions = [];
        this.spendFullAmountOptions = this.tradeToolsBo.getSpendFullCashOptions();
    }

    /** To generate trades */
    generateTrade() {
        let filterType;
        let selectedPortfolios = null;
        if (this.selectedModelData.selectedVal == 'sleevePortfolio' || this.uploadedFileRecordType == 'portfolio') {
            selectedPortfolios = [];
            filterType = "SleevePortfolio";
            this.selectedModelData.selectedAccountsList.forEach(e => {
                selectedPortfolios.push({ id: e.id, amount: e.amount });
            });
        }

        let selecetedAccounts = null;
        let selectedEmphasiedAccounts = null;
        if (this.selectedModelData.selectedVal == 'account' || this.uploadedFileRecordType == 'account') {
            filterType = "Accounts";
            //TODO : Need to change logic 
            if (this.isBuyRebalancewithEmphasis) selectedEmphasiedAccounts = [];
            else selecetedAccounts = [];
            this.selectedModelData.selectedAccountsList.forEach(e => {
                if (e.emphasis == undefined)
                    selecetedAccounts.push({ id: e.id, amount: e.amount });
                else {
                    let levelId = e.emphasis.split('(')[0].split(' ')[1];
                    let node = { level: +levelId, id: +e.subModelId, amount: e.amount };
                    let emphasiedRecord = { id: e.id, node: node };
                    selectedEmphasiedAccounts.push(emphasiedRecord);
                }
            });
        }

        let amountOption = this.selectedSpendFullAmountOption == "Use Default" ? null : (this.selectedSpendFullAmountOption == "Yes" ? true : false);
        let generateTrade = <any>{ //TODO: Use strict type
            selectedMethodId: +this.selectedMethodId,
            spendFullAmount: amountOption,
            filterType: filterType,
            accounts: selecetedAccounts,
            sleevedPortfolios: selectedPortfolios,
            emphasiedAccounts: selectedEmphasiedAccounts,
            reason: this.reasonNote == undefined ? null : this.reasonNote
        }

        // console.log('spend cash generate trade input json : ', JSON.stringify(generateTrade));
        this.tradeToolsBo.spendCashGenerateTrade(generateTrade)
            .subscribe(m => {
                // console.log('spend cash generate trade success: ', m);
                this._router.navigate(['/eclipse/tradeorder/list']);
            },
            error => {
                console.log('spend cash generate trade error : ', error);
            })
    }

    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            if (this.emphasisGridOptions.api != undefined)
                this.emphasisGridOptions.api.sizeColumnsToFit();
            if (this.spendcashGridOptions.api != undefined)
                this.spendcashGridOptions.api.sizeColumnsToFit();
        }
    }

}
