import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { IPortfolioDetails, IEditPortfolio, IPortfolioGeneralInfo, IPortfolioTeam, IIssuesSummary, IPortfolioSummary, IAUMsummary, ITotalCashSummary,
    IRealizedSummary, IPortfolioAccounts, IAccount } from '../../../models/portfolio';
import { ICommunityModel, ICommunityStrategist } from "../../../models/community";
import { ITeamModel, ITeam } from '../../../models/team';
import { PortfolioService } from '../../../services/portfolio.service';
import { CommunityService } from '../../../services/community.service'
import { ModelService } from '../../../services/model.service';
import { TeamService } from '../../../services/team.service';
import { DonutChartService } from '../../../services/donutchart.service';
import { ITabNav, PortfolioTabNavComponent } from '../shared/portfolio.tabnav.component';

@Component({
    selector: 'eclipse-portfolio-detail',
    templateUrl: './app/components/portfolio/detail/portfoliodetail.component.html',
    directives: [AutoComplete, AgGridNg2, Dialog, PortfolioTabNavComponent],
    providers: [PortfolioService, CommunityService, ModelService, TeamService, DonutChartService]
})
export class PortfolioDetailComponent extends BaseComponent {
    private tabsModel: ITabNav;
    portfolio: IPortfolioDetails;
    editPortfolio: IEditPortfolio;
    sleevedOptions: any;
    modelSuggestions: ITeamModel[] = [];
    gridOptions: {
        regular: GridOptions,
        sma: GridOptions,
        sleeved: GridOptions
    };
    private columnDefs: ColDef[];
    regularAccounts: IAccount[];
    smaAccounts: IAccount[];
    sleevedAccounts: IAccount[];
    portfolioId: number;
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    private portfolioTeams: IPortfolioTeam[] = [];
    nameValidation: boolean = false;
    portfolioDetailsGroup: ControlGroup;
    displayCommunityModel: boolean = false;
    submitCategory: boolean = false;
    Strategist: any;
    strategistList: ICommunityStrategist[] = [];
    modelList: ICommunityModel[] = [];
    Community: any;
    /** flags for div change if any -ve values occurs for short/long terms */
    shortermflag: boolean;
    longtermflag: boolean;
    totalflag: boolean;
    unassignAccountIds:number[]=[];

    constructor(private activateRoute: ActivatedRoute, private _router: Router, private builder: FormBuilder,
        private strategistService: CommunityService, private _portfolioService: PortfolioService,
        private _modelService: ModelService, private _teamService: TeamService,
        private _donutChartService: DonutChartService) {
        super(PRIV_PORTFOLIOS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        this.editPortfolio = <IEditPortfolio>{ isSleevePortfolio: false, teamIds: [] };
        this.portfolio = <IPortfolioDetails>{};
        this.portfolio.general = <IPortfolioGeneralInfo>{};
        this.portfolio.teams = <IPortfolioTeam[]>[];
        this.portfolio.issues = <IIssuesSummary>{ outOfTolerance: 0, cashNeed: 0, setForAutoRebalance: true, contributions: 0, distribution: 0, modelAssociation: true, blocked: false, TLHOpportunity: false, dataErrors: 90, pendingsTrades: 100 };
        this.portfolio.summary = <IPortfolioSummary>{
            AUM: <IAUMsummary>{ total: 0, managedValue: 0, excludedValue: 0, totalCash: <ITotalCashSummary>{ total: 0, reserve: 0, cash: 0 } },
            realized: <IRealizedSummary>{ shortTerm: 0, longTerm: 0, total: 0 }
        };
        this.portfolio.accounts = <IPortfolioAccounts>{ regular: <IAccount[]>[], sma: <IAccount[]>[], sleeved: <IAccount[]>[] };
        this.gridOptions = { regular: <GridOptions>{}, sma: <GridOptions>{}, sleeved: <GridOptions>{} }
        this.createColumnDefs();
        this.createProtfolioControl();
        this.portfolioId = Util.getRouteParam<number>(this.activateRoute);
        // if (!Util.isNull(this.portfolioId)) {
        if (this.portfolioId != undefined && this.portfolioId > 0) {
            this.tabsModel.id = this.portfolioId;
            this.tabsModel.action = 'E';
        }
    }

    ngOnInit() {
        this.getSleevePortfolio();
        this.getStrategists();
        if (this.portfolioId != undefined && this.portfolioId > 0) {
            this.getPortfolioDetailsById(this.portfolioId);
        }
        else {
            this.getTeams();
        }
    }

    /**
     * To Get portfolio details by Id
     */
    getPortfolioDetailsById(portfolioId: number) {
        let portfolioDetails = [];
        portfolioDetails.push(this._portfolioService.getPortfolioById(portfolioId)
            .map((response: Response) => response.json()));
        portfolioDetails.push(this._portfolioService.getRegularAccountsById(portfolioId)
            .map((response: Response) => response.json()));
        portfolioDetails.push(this._portfolioService.getSmaAccountsById(portfolioId)
            .map((response: Response) => response.json()));
        portfolioDetails.push(this._portfolioService.getSleevedAccountsById(portfolioId)
            .map((response: Response) => response.json()));

        Observable.forkJoin(portfolioDetails)
            .subscribe(model => {
                this.portfolio = model[0];
                console.log("Portfolio Details by ID:", this.portfolio.summary.AUM);

                this.editPortfolio.name = this.portfolio.general.portfolioName;
                this.editPortfolio.isSleevePortfolio = this.portfolio.general.sleevePortfolio;
                this.editPortfolio.modelId = this.portfolio.general.modelId;
                this.editPortfolio.tags = this.portfolio.general.tags;
                this.portfolioTeams = this.portfolio.teams;

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

                // To get primary team id and teamids list
                this.portfolioTeams.forEach(element => {
                    //to get team ids of selected portfolio
                    this.editPortfolio.teamIds.push(element.id);
                });
                
                // To get isPrimary flag for teams
                let team = this.portfolioTeams.find(x => x.isPrimary == true);
                if (team != undefined)
                    this.editPortfolio.primaryTeamId = team.id;

                this.regularAccounts = model[1];
                this.smaAccounts = model[2];
                this.sleevedAccounts = model[3];

                let portfolioSummary = this.portfolio.summary.AUM;
                let data = [];
                for (var item in portfolioSummary) {
                    if (item == "managedValue") {
                        data.push({ "label": "Managed", "value": portfolioSummary[item] });
                    }
                    else if (item == "excludedValue") {
                        data.push({ "label": "Excluded", "value": portfolioSummary[item] });
                    }
                    else if (item == "totalCash") {
                        data.push({ "label": "Reserve", "value": portfolioSummary[item]['reserve'] });
                        data.push({ "label": "Cash", "value": portfolioSummary[item]['cash'] });
                    }
                }
                let color = ["#286598", "#3284b5", "#4c4e9b", "#9593c4"];
                this._donutChartService.renderDonutChart("#donut", data, color, "portfolio");


                console.log("Relugar Grid:", model[1]);
                console.log("SMA Grid:", model[2]);
                console.log("Sleeved Grid:", model[3]);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /* To get static Sleeve portfolio*/
    private getSleevePortfolio() {
        this.sleevedOptions = this._portfolioService.getSleevedPortfolio();
    }

    /* To get teams in add mode*/
    private getTeams() {
        this.ResponseToObjects<ITeamModel>(this._teamService.getTeamData())
            .subscribe(model => {
                let teams = model.filter(a => a.status == 1);
                if (teams.length > 0) {
                    // this.portfolioTeams = <IPortfolioTeam[]>[];
                    teams.forEach(element => {
                        this.editPortfolio.teamIds.push(element.id);
                        this.portfolioTeams.push(<IPortfolioTeam>{ id: element.id, name: element.name, isPrimary: false });
                    })
                    this.portfolioTeams[0].isPrimary = true;
                    this.editPortfolio.primaryTeamId = this.portfolioTeams[0].id;
                }
                //console.log("portfolio teams", this.portfolioTeams);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search by ModelName */
    autoModelSearch(event) {
        this.ResponseToObjects<ITeamModel>(this._modelService.getModelSearch(event.query.toLowerCase()))
            .subscribe(model => {
                this.modelSuggestions = model;
            });
    }


    /** Model auto complete on select method*/
    onModelSelect(model) {
        this.editPortfolio.modelId = model.id;
    }
    /** Model auto complete on keyup method*/
    onModelUnSelect(model) {
        if (model.srcElement.value.trim() == "")
            this.editPortfolio.modelId = undefined;

    }

    /**
     * create column headers for  accounts agGrid
     */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Account ID", field: "accountId", width: 80, cellClass: 'text-center' },
            <ColDef>{ headerName: "Name", field: "accountName", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 135, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Type", field: "accountType", width: 125 },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 120, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Total Value", field: "totalValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Pending Value", field: "pendingValue", width: 120, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer },
            <ColDef>{ headerName: "Delete", field: "", width: 110, cellClass: 'text-center', cellRenderer: this.deleteRenderer }
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
        return result;
    }

    /*** renders delete for row data */
    private deleteRenderer(params) {
        var result = '<span>';
        result += '<i class="material-icons text-danger"  id =' + params.data.accountId + ' title="Delete">delete</i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        console.log('targetElement: ', targetElement);
        if (targetElement.title === "Delete") {
            let accountId = parseInt(targetElement.id);
            this.unassignAccountIds.push(accountId);

            // regular accounts grid
            let index = this.regularAccounts.findIndex(x => x.accountId == accountId);
            if (index >= 0) {
                this.regularAccounts.splice(index, 1);
                this.gridOptions.regular.api.setRowData(this.regularAccounts);
            }

            // sma accounts grid
            index = this.smaAccounts.findIndex(a => a.accountId == accountId);
            if (index >= 0) {
                this.smaAccounts.splice(index, 1);
                this.gridOptions.sma.api.setRowData(this.smaAccounts);
            }

            // sleeved accounts grid
            index = this.sleevedAccounts.findIndex(x => x.accountId == accountId);
            if (index >= 0) {
                this.sleevedAccounts.splice(index, 1);
                this.gridOptions.sleeved.api.setRowData(this.sleevedAccounts);
            }
        }
        if (targetElement.innerText === "View Details") {
            window.open('#/eclipse/account/view/' + targetElement.id);
            //this._router.navigate(['/eclipse/account/view', +targetElement.id]);
        }
    }

    /** Used to Redirect to model management */
    gotoModel() {
        window.open('#/eclipse/model');
    }

    /** FindCommunityModel button click to open popup */
    openCommunityPopup() {
        this.displayCommunityModel = true;
    }

    /** To bind the Strategist names for dropdown */
    private getStrategists() {
        this.ResponseToObjects<ICommunityStrategist>(this.strategistService.getCommunityStrategist())
            .subscribe(model => {
                this.strategistList = model;
                // console.log("List is:", this.strategistList)
            });
    }

    /** To bind the Community Model names */
    private getCommunityModel(id: number) {
        if (id <= 0) {
            this.modelList = <ICommunityModel[]>[];
            return;
        }
        this.ResponseToObjects<ICommunityModel>(this.strategistService.getCommunityModelByStrategistId(id))
            .subscribe(model => {
                this.modelList = model;
                // console.log("Community Model", this.modelList);
            });
        // return this.modelList;
    }

    /** To get primary team value */
    getValue(teamId) {
        this.portfolioTeams.forEach(element => {
            if (element.id == teamId)
                element.isPrimary = true;
            else
                element.isPrimary = false;
        });

        this.editPortfolio.primaryTeamId = teamId;
    }

    /** FindCommunityModel button click to open popup */
    private savePortfolio(form) {
        if (form.valid) {
            //this.resetForm(form);
        }
        else {
            this.submitCategory = true
        }
    }

    /** Save View As Portfolio */
    private createProtfolioControl() {
        this.portfolioDetailsGroup = this.builder.group({
            Strategist: new Control('', Validators.required),
            Community: new Control('', Validators.required)
        });
    }

    /** Get account ids to check if any unassigned */
    getUnassignedAccounts() {
        let accountIds = [];
        this.regularAccounts.forEach(element => {
            accountIds.push(element.accountId);
        });
        this.smaAccounts.forEach(element => {
            accountIds.push(element.accountId);
        });
        this.sleevedAccounts.forEach(element => {
            accountIds.push(element.accountId);
        });
        return accountIds;
    }

    isAccountsUnassigned() {
        let prevAccountIds = [];
        let accountIds = this.getUnassignedAccounts();
        this.portfolio.accounts.regular.forEach(element => {
            // To get regular account ids of selected portfolio
            prevAccountIds.push(element.accountId);
        });
        this.portfolio.accounts.sma.forEach(element => {
            // To get sma account ids of selected portfolio
            prevAccountIds.push(element.accountId);
        });
        this.portfolio.accounts.sleeved.forEach(element => {
            // To get sleeved account ids of selected portfolio
            prevAccountIds.push(element.accountId);
        });
        return (prevAccountIds.length != accountIds.length);
    }

    /**
     * Used to save portfolio details
     */
    onSave() {
        if (this.editPortfolio.name == undefined || this.editPortfolio.name == "") {
            this.nameValidation = true;
            return;
        }
        this.editPortfolio.name = this.editPortfolio.name.trim();

        /**for Add/Edit API call */
        if (this.portfolioId > 0) {
            let accountIds = this.getUnassignedAccounts();
            let portfolioData = [];
            portfolioData.push(this._portfolioService.updatePortfolio(this.portfolioId, this.editPortfolio)
                .map((response: Response) => response.json()));
            portfolioData.push(this._portfolioService.updateAccounts(this.portfolioId, {"accountIds":this.unassignAccountIds })
                .map((response: Response) => response.json()));

            // execute all requests one by one
            Observable.forkJoin(portfolioData)
                .subscribe(data => {
                    console.log("Unassign Accounts:", data[1]);
                    this._router.navigate(['/eclipse/portfolio/list']);
                }, error => {
                    console.log(error);
                    throw error;
                });
        }
        else {
            console.log("Add Portfolios:", JSON.stringify(this.editPortfolio));
            this._portfolioService.createPortfolio(this.editPortfolio)
                .subscribe(model => {
                    this._router.navigate(['/eclipse/portfolio/list']);
                }, error => {
                    console.log(error);
                    throw error;
                });
        }
    }

    /** To delete team */
    deleteTeam(id) {
        let index = this.portfolioTeams.findIndex(x => x.id == id);
        /** If primary team and selected team are equal */
        this.portfolioTeams.forEach(element => {
            if (this.editPortfolio.primaryTeamId == id && index != 0) {
                this.portfolioTeams[0].isPrimary = true;
                this.editPortfolio.primaryTeamId = this.portfolioTeams[0].id;
            }
            else if (this.editPortfolio.primaryTeamId == id && index == 0) {
                this.portfolioTeams[1].isPrimary = true;
                this.editPortfolio.primaryTeamId = this.portfolioTeams[1].id;
            }
        });
        if (index != -1) {
            this.portfolioTeams.splice(index, 1);
            this.editPortfolio.teamIds.splice(index, 1);
        }
    }

    /**To hide error on keyup for portfolio name */
    hideError() {
        if (this.editPortfolio.name != undefined && this.editPortfolio.name.trim() != "")
            this.nameValidation = false;
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        window.open('#/eclipse/account/view/' + event.data.accountId);
    }

    /*** method to display context menu on accounts agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        contextResult.push({ name: '<hidden id=' + params.node.data.accountId + '>View Details</hidden>' });
        return contextResult;
    }

       /** Fires when action menu item clicked */
    showPopup(event) {
        switch (event) {
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.id]);
                break;
            default:
        }
        return;
    }

}
