import { Component, HostListener, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions, ColDef } from 'ag-grid/main';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import {
    IPortfolioDetails, IPortfolioGeneralInfo, IPortfolioTeam, IIssuesSummary, IPortfolioSummary, IAUMsummary, ITotalCashSummary,
    IRealizedSummary, IPortfolioAccounts, IAccount, IPortfolioSimple, IPortfolio
} from '../../../models/portfolio';
import { ITeamModel, ITeam } from '../../../models/team';
import { PortfolioService } from '../../../services/portfolio.service';
import { ModelService } from '../../../services/model.service';
import { TeamService } from '../../../services/team.service';
import { DonutChartService } from '../../../services/donutchart.service';
import { ITabNav, PortfolioTabNavComponent } from '../shared/portfolio.tabnav.component';
import { Accounts } from '../../../shared/accounts/assign.accounts';
import { AccountService } from '../../../services/account.service';

@Component({
    selector: 'eclipse-portfolio-view',
    templateUrl: './app/components/portfolio/view/portfolioview.component.html',
    providers: [PortfolioService, ModelService, TeamService, DonutChartService, AccountService]
})

export class PortfolioViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    portfolioId: number;
    portfolio: IPortfolioDetails = <IPortfolioDetails>{};
    gridOptions: {
        account: GridOptions
    }

    private accColumnDefs: ColDef[];

    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    accounts: IAccount[];
    selectedPortfolio: string;
    portfolioSuggestions: IPortfolioSimple[] = [];
    showAssignPopup: boolean;
    isSleevedPortfolio: boolean = false;

    /** flags for div change if any -ve values occurs for short/long terms */
    shortermflag: boolean;
    longtermflag: boolean;
    totalflag: boolean;

    @ViewChild(Accounts) assignComponent: Accounts;

    constructor(private _router: Router, private activateRoute: ActivatedRoute,
        private _portfolioService: PortfolioService, private _donutChartService: DonutChartService,
        private _modelService: ModelService, private _teamService: TeamService) {
        super(PRIV_PORTFOLIOS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.portfolio = <IPortfolioDetails>{};
        this.portfolio.general = <IPortfolioGeneralInfo>{};
        this.portfolio.issues = <IIssuesSummary>{};
        this.portfolio.summary = <IPortfolioSummary>{ AUM: <IAUMsummary>{ totalCash: <ITotalCashSummary>{} }, realized: <IRealizedSummary>{} };
        this.portfolio.accounts = <IPortfolioAccounts>{ regular: <IAccount[]>[], sleeved: <IAccount[]>[] };
        this.gridOptions = { account: <GridOptions>{} }

        //get param value when we clicked on edit portfolio/add portfolio
        this.portfolioId = Util.getRouteParam<number>(this.activateRoute);
        //if (this.portfolioId > 0) this.tabsModel.id = this.portfolioId;
        (this.portfolioId > 0) ? this.tabsModel.id = this.portfolioId : this.portfolioId = undefined;
    }

    ngOnInit() {
        if (this.portfolioId > 0) {
            this.getPortfolioDetailsById(this.portfolioId);
        }
    }

    /** AutoComplete Search portfolios by name */
    loadPortfolioSuggestions(event) {
        Util.responseToObjects<IPortfolioSimple>(this._portfolioService.searchPortfolioSimple(event.query.toLowerCase()))
            .subscribe(model => {
                this.portfolioSuggestions = model;
            });
    }

    /** Fires on select portfolio from search portfolio */
    onPortfolioSelect(params: any) {
        this.getPortfolioDetailsById(params.id);
        this._router.navigate(['/eclipse/portfolio/search', params.id]);
    }
    public count = 0;
    /** To Get portfolio details by Id */
    getPortfolioDetailsById(portfolioId: number) {
        Util.responseToObject<IPortfolioDetails>(this._portfolioService.getPortfolioById(portfolioId))
            .subscribe(model => {
                this.portfolio = model;
                this.isSleevedPortfolio = this.portfolio.general.sleevePortfolio;
                this.tabsModel.typeId = this.isSleevedPortfolio ? 1 : 0;

                this.getPortfolioAccounts(this.portfolioId);

                // To display up and down arrows for short term
                this.portfolio.summary.realized.shortTermStatus === "high" ? this.isShortTermGain = true : this.isShortTermGain = false;

                // To display up and down arrows for long term
                this.portfolio.summary.realized.longTermStatus === "high" ? this.isLongTermGain = true : this.isLongTermGain = false;

                // CHANGE SHORT TERM AND LONG TERM div if any -ve values
                this.portfolio.summary.realized.shortTerm < 0 ? this.shortermflag = true : this.shortermflag = false;
                this.portfolio.summary.realized.longTerm < 0 ? this.longtermflag = true : this.longtermflag = false;
                this.portfolio.summary.realized.total < 0 ? this.totalflag = true : this.totalflag = false;

                // To display up and down arrows for total
                if (this.isShortTermGain || this.isLongTermGain)
                    this.isTotalGain = true;
                else if (!this.isShortTermGain && !this.isLongTermGain)
                    this.isTotalGain = false;
                this.createRegularAccColumnDefs();
                // render portfolio summary donut chart
                let data = [];
                for (var item in this.portfolio.summary.AUM) {
                    if (item == "managedValue") {
                        data.push({ "label": "Managed", "value": this.portfolio.summary.AUM[item], color: '#286598' });
                    }
                    else if (item == "excludedValue") {
                        data.push({ "label": "Excluded", "value": this.portfolio.summary.AUM[item], color: '#3284b5' });
                    }
                    else if (item == "totalCash") {
                        data.push({ "label": "Reserve", "value": this.portfolio.summary.AUM[item]['reserve'], color: '#4c4e9b' });
                        data.push({ "label": "Cash", "value": this.portfolio.summary.AUM[item]['cash'], color: '#9b9dc7' });
                        data.push({ "label": "Set Aside Cash", "value": this.portfolio.summary.AUM[item]['setAsideCash'], color: '#6c6ead' });
                        // data.push({ "label": "total", "value": this.portfolio.summary.AUM[item]['total'], color: '#27308b' });
                    }
                }

            let plotchart = this.count++;
                let color = ["#286598", "#3284b5", "#4c4e9b", "#9593c4"];
                if(plotchart == 0)
                this._donutChartService.renderDonutChart("#donut", data, color, "portfolio");
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /**To get Portfolio Accounts Grid Data */
    getPortfolioAccounts(portfolioId: number) {
        if (portfolioId != undefined) {
            Util.responseToObjects<IAccount>(this._portfolioService.getPortfolioAccounts(portfolioId))
                .subscribe(m => {
                    this.accounts = m;
                });
        }
    }

    /** Create column headers for regular accounts agGrid */
    private createRegularAccColumnDefs() {

        this.accColumnDefs = [
            <ColDef>{ headerName: "Account ID", field: "accountId", width: 100, cellClass: 'text-center' },
            <ColDef>{ headerName: "Name", field: "name", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 145, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Type", field: "accountType", width: 125 },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Total Value", field: "totalValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Pending Value", field: "pendingValue", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Sleeve Type", field: "sleeveType", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer }

        ];
        if (this.isSleevedPortfolio == true) {
            this.accColumnDefs.push(<ColDef>{ headerName: "Sleeve Target", field: "sleeveTarget", width: 120, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Sleeve Contribution %", field: "sleeveContributionPercent", width: 180, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Sleeve Distribution %", field: "sleeveDistributionPercent", width: 180, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Sleeve Tolerance Lower", field: "sleeveToleranceLower", width: 180, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Sleeve Tolerance Upper", field: "sleeveToleranceUpper", width: 180, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Model", field: "model", width: 100, cellClass: 'text-center' });
            this.accColumnDefs.push(<ColDef>{ headerName: "Management Style", field: "managementStyle", width: 180, cellClass: 'text-center' });
        }
    }


    /** Currency format */
    formatCurrencyCellRenderer(params) {
        if (params.value != null || params.value != undefined) {
            let currencyFormat = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
            return currencyFormat.format(params.value);
        }
        return null;
    }

    /*** renders status for row data */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == "Ok")
            result += '<i class="material-icons text-success">check_circle</i>';
        else if (params.value == "Error")
            result += ' <i class="material-icons text-erorr-warning">warning</i>';
        else if (params.value == "Blocked")
            result += '<i class="material-icons text-danger">cancel</i>';
        else
            return null;
        return result + '</span>';
    }

    /** Used to Redirect to model management */
    gotoModel() {
        window.open('#/eclipse/model/list');
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        window.open('#/eclipse/account/view/' + event.data.id);
    }

    /** method to display context menu on accounts agGrid */
    private getContextMenuItems(params) {
        let contextResult = [];
        contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' });
        return contextResult;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.innerText === "View Details") {
            window.open('#/eclipse/account/view/' + targetElement.id);
        }
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Assign":
                if (this.portfolioId == undefined) {
                    this.showAssignPopup = true;
                }
                else {
                    let assignTeam = this.portfolio.teams.find(m => m.isPrimary == true);
                    console.log("assignTeam: ", assignTeam);
                    // let cashresever = this.portfolio.accounts.regular.filter(m=>m.cashReserve);
                    // console.log("cash Reserve: ", cashresever);
                    let portfolio = <IPortfolio>{
                        id: this.portfolio.id,
                        name: this.portfolio.general.portfolioName,
                        team: assignTeam.name,
                        model: this.portfolio.general.modelName,
                        managedValue: this.portfolio.summary.AUM.managedValue,
                        excludedValue: this.portfolio.summary.AUM.excludedValue,
                        cash: this.portfolio.summary.AUM.totalCash.cash,
                        //cashReserve: cashresever
                    }
                    this.assignComponent.initFromPortfolio([portfolio]);
                    this.showAssignPopup = true;
                }
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;
            case "CashNeeds":
                this._router.navigate(['/eclipse/tradeorder/cashneed', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]); //|| this.tabsModel.ids.join()
                break;
            default:
        }
        return;
    }

}
