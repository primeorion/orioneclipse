import { Component, HostListener, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { GridOptions, ColDef } from 'ag-grid/main';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { IPortfolioDetails, IPortfolioGeneralInfo, IPortfolioTeam, IIssuesSummary, IPortfolioSummary, IAUMsummary, ITotalCashSummary,
    IRealizedSummary, IPortfolioAccounts, IAccount, IPortfolioSimple } from '../../../models/portfolio';
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
    directives: [AutoComplete, AgGridNg2, Dialog, PortfolioTabNavComponent, Accounts],
    providers: [PortfolioService, ModelService, TeamService, DonutChartService, AccountService]
})
export class PortfolioViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    portfolioId: number;
    portfolio: IPortfolioDetails = <IPortfolioDetails>{};
    gridOptions: {
        regular: GridOptions,
        sma: GridOptions,
        sleeved: GridOptions
    };
    private columnDefs: ColDef[];
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    regularAccounts: IAccount[];
    smaAccounts: IAccount[];
    sleevedAccounts: IAccount[];
    selectedPortfolio: string;
    portfolioSuggestions: IPortfolioSimple[] = [];
    showAssignPopup: boolean;

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
        this.portfolio.accounts = <IPortfolioAccounts>{ regular: <IAccount[]>[], sma: <IAccount[]>[], sleeved: <IAccount[]>[] };
        this.gridOptions = { regular: <GridOptions>{}, sma: <GridOptions>{}, sleeved: <GridOptions>{} }
        this.createColumnDefs();
        //get param value when we clicked on edit portfolio/add portfolio
        this.portfolioId = Util.getRouteParam<number>(this.activateRoute);
        if (this.portfolioId > 0) this.tabsModel.id = this.portfolioId;
    }

    ngOnInit() {
        if (this.portfolioId > 0) {
            this.getPortfolioDetailsById(this.portfolioId);
            this.getPortfolioAccounts(this.portfolioId);
        }
    }

    /** AutoComplete Search portfolios by name */
    loadPortfolioSuggestions(event) {
        this.ResponseToObjects<IPortfolioSimple>(this._portfolioService.searchPortfolio(event.query.toLowerCase()))
            .subscribe(model => {
                this.portfolioSuggestions = model;
            });
    }

    onPortfolioSelect(params: any) {
        this._router.navigate(['/eclipse/portfolio/view', params.id]);
    }

    /**
     * To Get portfolio details by Id
     */
    getPortfolioDetailsById(portfolioId: number) {
        this.responseToObject<IPortfolioDetails>(this._portfolioService.getPortfolioById(portfolioId))
            .subscribe(model => {
                this.portfolio = model;

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

                // render portfolio summary donut chart
                let data = [];
                for (var item in this.portfolio.summary.AUM) {
                    if (item == "managedValue") {
                        data.push({ "label": "Managed", "value": this.portfolio.summary.AUM[item] });
                    }
                    else if (item == "excludedValue") {
                        data.push({ "label": "Excluded", "value": this.portfolio.summary.AUM[item] });
                    }
                    else if (item == "totalCash") {
                        data.push({ "label": "Reserve", "value": this.portfolio.summary.AUM[item]['reserve'] });
                        data.push({ "label": "Cash", "value": this.portfolio.summary.AUM[item]['cash'] });
                    }
                }
                let color = ["#286598", "#3284b5", "#4c4e9b", "#9593c4"];
                this._donutChartService.renderDonutChart("#donut", data, color, "portfolio");
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /**To get Portfolio Accounts Grid Data */
    getPortfolioAccounts(portfolioId: number) {
        let portfolioDetails = [
            this.ResponseToObjects<IAccount>(this._portfolioService.getRegularAccountsById(portfolioId)),
            this.ResponseToObjects<IAccount>(this._portfolioService.getSmaAccountsById(portfolioId)),
            this.ResponseToObjects<IAccount>(this._portfolioService.getSleevedAccountsById(portfolioId))
        ];
        Observable.forkJoin(portfolioDetails)
            .subscribe(model => {
                this.regularAccounts = model[0];
                this.smaAccounts = model[1];
                this.sleevedAccounts = model[2];
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /**
    * create column headers for  accounts agGrid
    */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Account ID", field: "accountId", width: 80, cellClass: 'text-center' },
            <ColDef>{ headerName: "Name", field: "accountName", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Type", field: "accountType", width: 125 },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 170, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Total Value", field: "totalValue", width: 150, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Pending Value", field: "pendingValue", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer },
        ];
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
        if (params.value == "ok")
            result += '<i class="material-icons text-success">check_circle</i>';
        else if (params.value == "Error")
            result += ' <i class="material-icons text-erorr-warning">warning</i>';
        else if (params.value == "Blocked")
            result += '<i class="material-icons text-danger">cancel</i>';
        else
            return null;
        return result + '</span>';
    }

    /**
     * Used to Redirect to model management
     */
    gotoModel() {
        window.open('#/eclipse/model');
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        window.open('#/eclipse/account/view/' + event.data.accountId);
    }

    /** method to display context menu on accounts agGrid */
    private getContextMenuItems(params) {
        let contextResult = [];
        contextResult.push({ name: '<hidden id=' + params.node.data.accountId + '>View Details</hidden>' });
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
                this.showAssignPopup = true;
                break;
             case 'PREFERENCES':
                 this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
            default:
        }
        return;
    }

}
