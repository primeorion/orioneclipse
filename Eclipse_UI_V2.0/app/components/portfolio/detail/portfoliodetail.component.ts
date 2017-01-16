import { Component, HostListener, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SessionHelper } from '../../../core/session.helper';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import {
    IPortfolioDetails, IEditPortfolio, IPortfolioGeneralInfo, IPortfolioTeam, IIssuesSummary, IPortfolioSummary, IAUMsummary, ITotalCashSummary,
    IRealizedSummary, IPortfolioAccounts, IAccount, IPortfolio
} from '../../../models/portfolio';
import { IApprovedCommunityStrategist, IApprovedCommunityModel, ICommunityModel, ICommunityStrategist } from "../../../models/community";
import { ITeamModel, ITeam } from '../../../models/team';
import { PortfolioService } from '../../../services/portfolio.service';
import { CommunityService } from '../../../services/community.service'
import { ModelService } from '../../../services/model.service';
import { TeamService } from '../../../services/team.service';
import { DonutChartService } from '../../../services/donutchart.service';
import { Accounts } from '../../../shared/accounts/assign.accounts';
import { ITabNav, PortfolioTabNavComponent } from '../shared/portfolio.tabnav.component';
import { TagInputComponent } from '../../../shared/tags/tag-input.component'; 

@Component({
    selector: 'eclipse-portfolio-detail',
    templateUrl: './app/components/portfolio/detail/portfoliodetail.component.html',
    providers: [PortfolioService, CommunityService, ModelService, TeamService, DonutChartService]
})
export class PortfolioDetailComponent extends BaseComponent {
    private tabsModel: ITabNav;
    portfolio: IPortfolioDetails;
    editPortfolio: IEditPortfolio;
    sleevedOptions: any;
    modelSuggestions: ITeamModel[] = [];
    gridOptions: {
        regular: GridOptions
    };
    private columnDefs: ColDef[];
    regularAccounts: IAccount[];
    portfolioId: number;
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    private portfolioTeams: IPortfolioTeam[] = [];
    nameValidation: boolean = false;
    displayCommunityModel: boolean = false;
    submitCategory: boolean = false;
    Strategist: any;
    strategistList: IApprovedCommunityStrategist[] = [];
    modelList: IApprovedCommunityModel[] = [];
    Community: any;
    private communityPortalNavigation: string;
    /** flags for div change if any -ve values occurs for short/long terms */
    shortermflag: boolean;
    longtermflag: boolean;
    totalflag: boolean;
    unassignAccountIds: number[] = [];
    selectedStrategist: number = 0;
    selectedCommunityModel: number = 0;
    strategistValidation: boolean = false;
    communityValidation: boolean = false;
    showAssignPopup: boolean;
    tagsArray: string[] = [];
    displayConfirm: boolean;
    selectedAccountId: number;

    @ViewChild(Accounts) assignComponent: Accounts;
    @ViewChild(TagInputComponent) taginputComponent: TagInputComponent;
    constructor(private activateRoute: ActivatedRoute, private _router: Router,
        private _communityService: CommunityService, private _portfolioService: PortfolioService,
        private _modelService: ModelService, private _teamService: TeamService,
        private _donutChartService: DonutChartService,
        @Inject('CommunityUrl') private _communityUrl: string) {
        super(PRIV_PORTFOLIOS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        this.editPortfolio = <IEditPortfolio>{ isSleevePortfolio: false, teamIds: [] };
        this.portfolio = <IPortfolioDetails>{};
        this.portfolio.general = <IPortfolioGeneralInfo>{};
        this.portfolio.teams = <IPortfolioTeam[]>[];
        this.portfolio.issues = <IIssuesSummary>{ outOfTolerance: 0, cashNeed: 0, setForAutoRebalance: true, contributions: 0, distribution: 0, modelAssociation: true, doNotTrade: 0, TLHOpportunity: false, dataErrors: 90, pendingTrades: 100 };
        this.portfolio.summary = <IPortfolioSummary>{
            AUM: <IAUMsummary>{ total: 0, managedValue: 0, excludedValue: 0, totalCash: <ITotalCashSummary>{ total: 0, reserve: 0, cash: 0 } },
            realized: <IRealizedSummary>{ shortTerm: 0, longTerm: 0, total: 0 }
        };
        this.portfolio.accounts = <IPortfolioAccounts>{ regular: <IAccount[]>[] };
        this.gridOptions = { regular: <GridOptions>{} }
        this.createColumnDefs();
        this.portfolioId = Util.getRouteParam<number>(this.activateRoute);
        // if (!Util.isNull(this.portfolioId)) {
        if (this.portfolioId != undefined && this.portfolioId > 0) {
            this.tabsModel.id = this.portfolioId;
            this.tabsModel.action = 'E';
        }
        this.editPortfolio.doNotTrade = 0;
    }

    ngOnInit() {
        this.getSleevePortfolio();
        this.getStrategists();
        if (this.portfolioId != undefined && this.portfolioId > 0)
            this.getPortfolioDetailsById(this.portfolioId);
        else
            this.getTeams();
    }

    /** To Get portfolio details by Id */
    getPortfolioDetailsById(portfolioId: number) {
        let portfolioDetails = [];
        portfolioDetails.push(this._portfolioService.getPortfolioById(portfolioId)
            .map((response: Response) => response.json()));
        portfolioDetails.push(this._portfolioService.getPortfolioAccounts(portfolioId)
            .map((response: Response) => response.json()));

        Observable.forkJoin(portfolioDetails)
            .subscribe((model: any[]) => {
                this.portfolio = model[0];
                this.editPortfolio.name = this.portfolio.general.portfolioName;
                this.editPortfolio.isSleevePortfolio = this.portfolio.general.sleevePortfolio;
                this.editPortfolio.modelId = this.portfolio.general.modelId;
                this.editPortfolio.doNotTrade = this.portfolio.general.doNotTrade ? 1 : 0;
                if (this.portfolio.general.tags != null || this.portfolio.general.tags != undefined) {
                    this.portfolio.general.tags.split(",").forEach(tag => {
                        this.tagsArray.push(tag);
                    });
                   this.taginputComponent.setTagList(this.tagsArray);  //OEF-2071 fix
                }
                this.portfolioTeams = this.portfolio.teams;
                this.portfolioTeams = Util.sortBy(this.portfolioTeams);
                this.tabsModel.modelId = this.portfolio.general.modelId;

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
                let portfolioSummary = this.portfolio.summary.AUM;
                let data = [];
                for (var item in portfolioSummary) {
                    if (item == "managedValue") {
                        data.push({ "label": "Managed", "value": portfolioSummary[item], color: '#286598' });
                    }
                    else if (item == "excludedValue") {
                        data.push({ "label": "Excluded", "value": portfolioSummary[item],color: '#3284b5' });
                    }
                    else if (item == "totalCash") {
                        data.push({ "label": "Reserve", "value": portfolioSummary[item]['reserve'], color: '#4c4e9b' });
                        data.push({ "label": "Cash", "value": portfolioSummary[item]['cash'],color: '#9b9dc7' });
                        data.push({ "label": "Set Aside Cash", "value": this.portfolio.summary.AUM[item]['setAsideCash'], color: '#6c6ead' });
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
                    teams.forEach(element => {
                        this.editPortfolio.teamIds.push(element.id);
                        this.portfolioTeams.push(<IPortfolioTeam>{ id: element.id, name: element.name, isPrimary: false });
                    })
                    this.portfolioTeams = Util.sortBy(this.portfolioTeams);
                    this.portfolioTeams[0].isPrimary = true;
                    this.editPortfolio.primaryTeamId = this.portfolioTeams[0].id;
                }
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search by ModelName */
    autoModelSearch(event) {
        this.ResponseToObjects<any>(this._modelService.getModelSearch(event.query.toLowerCase())) //TODO: use strict type
            .subscribe(model => {
                this.modelSuggestions = model.filter(a => a.isDeleted == 0 && a.statusId == 1);
            });
    }

    /** Model auto complete on select method*/
    onModelSelect(model) {
        this.editPortfolio.modelId = model.id;
        this.tabsModel.modelId = this.editPortfolio.modelId;
    }

    /** Model auto complete on keyup method*/
    onModelUnSelect(model) {
        if (model.srcElement.value.trim() == "")
            this.editPortfolio.modelId = undefined;
    }

    /** Create column headers for  accounts agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Account ID", field: "accountId", width: 100, cellClass: 'text-center' },
            <ColDef>{ headerName: "Name", field: "name", width: 140, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 135, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Type", field: "accountType", width: 125 },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 140, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Total Value", field: "totalValue", width: 120, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer },
            <ColDef>{ headerName: "Pending Value", field: "pendingValue", width: 120, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 80, cellClass: 'text-center', cellRenderer: this.statusRenderer },
            <ColDef>{ headerName: "Delete", field: "", width: 80, cellClass: 'text-center', cellRenderer: this.deleteRenderer }
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

    /*** Renders status for row data */
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
        return result;
    }

    /*** Renders delete for row data */
    private deleteRenderer(params) {
        var result = '<span>';
        result += '<i id=' + params.data.id + ' title="Delete" class="material-icons text-danger">delete</i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) { return; }
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, deleteval = 0] = matches;
        if (targetElement.title === "Delete") {
            this.selectedAccountId = id;
            this.displayConfirm = true;
        }
        else if (targetElement.innerText === "View Details") {
            window.open('#/eclipse/account/view/' + targetElement.id);
            //this._router.navigate(['/eclipse/account/view', +targetElement.id]);
        }
        else if (targetElement.innerText === "Assign Portfolio") {
            this.showAssignPopup = true;
        }
    }

    /** Delete Account in Selected portfolio Account section */
    deleteAccounts() {
        let id = +this.selectedAccountId;
        this.unassignAccountIds.push(id);
        // regular accounts grid
        let index = this.regularAccounts.findIndex(x => x.id == id);
        if (index >= 0) {
            this.regularAccounts.splice(index, 1);
            this.gridOptions.regular.api.setRowData(this.regularAccounts);
            this.displayConfirm = false;
        }
    }

    /** Used to Redirect to model management */
    gotoModel() {
        window.open('#/eclipse/model/list');
    }

    /** FindCommunityModel button click to open popup */
    openCommunityPopup() {
        this.selectedCommunityModel = 0;
        this.selectedStrategist = 0;
        this.displayCommunityModel = true;
    }

    /** To bind the Strategist names for dropdown */
    private getStrategists() {
        this.strategistList = [];
        Util.responseToObjects<IApprovedCommunityStrategist>(this._communityService.getCommunityStrategist())
            .subscribe(model => {
                this.strategistList = model;
            });
    }

    /** To bind the Community Model names */
    private onStrategistSelection(id: number) {
        if (id != 0) this.strategistValidation = false;
        this.selectedStrategist = +id;
        let sessionHelper = new SessionHelper();
        let eclipseToken = sessionHelper.getAccessToken("accessTokenInfo");
        this.communityPortalNavigation = this._communityUrl + "#/authorize/" + eclipseToken.orion_access_token + "/strategist/" + this.selectedStrategist;
        this.modelList = [];
        Util.responseToObjects<IApprovedCommunityModel>(this._communityService.getCommunityModelByStrategistId(+id))
            .subscribe(model => {
                this.modelList = model;
            }, error => {
                console.log('error @ strategist selection : ', error);
            });
    }

    /** Fires on Community model dropdown change*/
    communityChange(id: number) {
        if (id != 0) this.communityValidation = false;
        this.selectedCommunityModel = +id;
    }

    /** FindCommunityModel button click to open popup */
    findCommunity() {
        this.importModelValidation();
        if ((this.strategistValidation) || (this.communityValidation)) return;

        Util.responseToObject<any>(this._communityService.importCommunityModel(+this.selectedCommunityModel))
            .subscribe(m => {
                this.displayCommunityModel = false;
            }, error => {
                console.log('import community model error : ', error);
            });
    }

    /** To cancel find community model */
    cancelFindCommunityModel() {
        this.displayCommunityModel = false;
        this.strategistValidation = false;
        this.communityValidation = false;
    }

    /** To check validations on import community model  */
    importModelValidation() {
        if (this.selectedStrategist == 0)
            this.strategistValidation = true;
        else
            this.strategistValidation = false;

        if (this.selectedCommunityModel == 0)
            this.communityValidation = true;
        else
            this.communityValidation = false;
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

    /** Get account ids to check if any unassigned */
    getUnassignedAccounts() {
        let accountIds = [];
        this.regularAccounts.forEach(element => {
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
        return (prevAccountIds.length != accountIds.length);
    }

    /** Used to save portfolio details */
    onSave() {
        if (this.editPortfolio.name == undefined || this.editPortfolio.name == "") {
            this.nameValidation = true;
            return;
        }
        this.editPortfolio.doNotTrade = +this.editPortfolio.doNotTrade;
        this.editPortfolio.name = this.editPortfolio.name.trim();
        this.editPortfolio.tags = (this.tagsArray.length > 0) ? this.tagsArray.join(",") : "";
        /**for Add/Edit API call */
        if (this.portfolioId > 0) {
            let accountIds = this.getUnassignedAccounts();
            let portfolioData = [];
            if (this.editPortfolio.modelId == undefined) this.editPortfolio.modelId = 0;
            portfolioData.push(this._portfolioService.updatePortfolio(this.portfolioId, this.editPortfolio)
                .map((response: Response) => response.json()));
            if (this.unassignAccountIds.length > 0) {
                portfolioData.push(this._portfolioService.updateAccounts(this.portfolioId, { "accountIds": this.unassignAccountIds })
                    .map((response: Response) => response.json()));
            }

            // execute all requests one by one
            Observable.forkJoin(portfolioData)
                .subscribe(data => {
                    this._router.navigate(['/eclipse/portfolio/list']);
                }, error => {
                    console.log(error);
                    throw error;
                });
        }
        else {
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
        window.open('#/eclipse/account/view/' + event.data.id);
    }

    /*** method to display context menu on accounts agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' });
        return contextResult;
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Assign":
                let assignTeam = this.portfolio.teams.find(m => m.isPrimary);
                let portfolio = <IPortfolio>{
                    id: this.portfolio.id,
                    name: this.portfolio.general.portfolioName,
                    team: assignTeam.name,
                    model: this.portfolio.general.modelName,
                    managedValue: this.portfolio.summary.AUM.managedValue,
                    excludedValue: this.portfolio.summary.AUM.excludedValue,
                    cash: this.portfolio.summary.AUM.totalCash.cash,
                    //cashReserve: cashreserve
                }
                this.assignComponent.initFromPortfolio([portfolio]);
                this.showAssignPopup = true;
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.id]);
                break;
            case "CashNeeds":
                this._router.navigate(['/eclipse/tradeorder/cashneed', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]); //|| this.tabsModel.ids.join()
                break;
            default:
        }
        return;
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
    }

}
