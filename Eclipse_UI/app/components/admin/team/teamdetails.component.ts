import { Component, ViewChild, Output, EventEmitter, HostListener} from '@angular/core';
import { Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { TeamUsersComponent1 } from './teamusers.component';
import { TeamPortfolioComponent1 } from './teamportfolio.component'
import { TeamAdvisorComponent1 } from './teamadvisor.component';
import { TeamModelComponent1 } from './teammodel.component';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import { TeamService } from '../../../services/team.service';
import { ITeam } from '../../../models/team';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
    selector: 'eclipse-teamdetails',
    templateUrl: './app/components/admin/team/teamdetails.component.html',
    directives: [AutoComplete, TabSet, Tab, TeamUsersComponent1, TeamPortfolioComponent1, TeamAdvisorComponent1, TeamModelComponent1],
    providers: [TeamService, PortfolioService]
})

export class TeamDetailsComponent {
    @ViewChild(TabSet) _objtabs: TabSet;
    selectedTeamId: number;
    teamName: string;
    team: ITeam = <ITeam>{};
    errorMessage: string;
    portfolioList: number[] = [];
    modelList: number[] = [];
    teamUsersList: number[] = [];
    teamAdvisorList: number[] = [];
    public showSaveBtn: boolean = true;
    autocompleteResults: any[] = [];
    public shwsearchTeams: boolean = false;
    teamnametxt: string;
    existingTeamsCount: number;
    matchingTeamsExists: boolean = false;
    isView: boolean = false;
    nameValidation: boolean = false;
    statusType: any[] = [];
    statusTypeId: number;
    isTypeDisabled: boolean = false;
    teamStatus: number;
    showPanel: string = "hidden";
    btnValue: string;

    @ViewChild(TeamUsersComponent1) teamUserDetails: TeamUsersComponent1;
    @ViewChild(TeamAdvisorComponent1) teamAdvisorDetails: TeamAdvisorComponent1;
    @ViewChild(TeamPortfolioComponent1) portfolioDetails: TeamPortfolioComponent1;
    @ViewChild(TeamModelComponent1) modelDetails: TeamModelComponent1;
    @Output() teamSaved = new EventEmitter();

    constructor(private _teamService: TeamService) { }

    ngOnInit() {
        this.setDefaults();
        this.getStatusTypes();
    }

    /** method to apply active flag to the selected tab */
    activeSelectedTab(tabname) {
        this.selectedTeamId = undefined;
        this._objtabs.deactivateAllTabsandActiveSelectedTab(tabname);
    }


    //AutoComplete Search by TeamName
    autoTeamSearch(event) {
        this._teamService.searchTeams(event.query.toLowerCase())
            .map((response: Response) => response.json())
            .subscribe(model => {
                this.autocompleteResults = model;
            });
    }
    selectedTeamSearch(params: any) {
        this.loadEditMode(params.id, params.modelAccess, params.portfolioAccess);
        this.shwsearchTeams = true;
        this.team = params;
        this.showPanel = "visible";
    }

    /**
     * To laod team details in add mode
     */
    loadAddMode() {
        this.toggleTabs('tabModel', 'show-tab');
        this.toggleTabs('tabPortfolio', 'show-tab');
        this.btnValue = "Add"
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabUsers");
        this.resetForm();
        this.resetTeamDetailsGrid();
        this.setDefaults();
        this.teamUserDetails.loadAddMode();
        this.portfolioDetails.loadAddMode();
        this.teamAdvisorDetails.loadAddMode();
        this.modelDetails.loadAddMode();
    }

    /**
     * To load Team details in edit mode
     */
    loadEditMode(teamId: number, modelflag?: number, portfolioflag?: number) {

        this.toggleTabs('tabModel', modelflag == 0 ? 'show-tab' : 'hide-tab');
        this.toggleTabs('tabPortfolio', portfolioflag == 0 ? 'show-tab' : 'hide-tab')
        this.btnValue = "Save"
        if (this.isView == true) {
            this.teamUserDetails.isViewUser = true;
            this.portfolioDetails.isViewPortfolio = true;
            this.teamAdvisorDetails.isViewAdvisor = true;
            this.modelDetails.isViewModel = true;
            this.isTypeDisabled = true;
        }
        else {
            this.teamUserDetails.isViewUser = false;
            this.portfolioDetails.isViewPortfolio = false;
            this.teamAdvisorDetails.isViewAdvisor = false;
            this.modelDetails.isViewModel = false;
            this.isTypeDisabled = false;
        }
        this.shwsearchTeams = false;
        this.resetTeamDetailsGrid();
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabUsers");
        this.selectedTeamId = teamId;
        this.getTeamDetailsById(teamId);
        this.teamUserDetails.loadEditMode(this.selectedTeamId);
        this.portfolioDetails.loadEditMode(this.selectedTeamId);
        this.teamAdvisorDetails.loadEditMode(this.selectedTeamId);
        this.modelDetails.loadEditMode(this.selectedTeamId);
    }

    resetTeamDetailsGrid() {
        //reset search controls in details tabs
        this.teamUserDetails.selecteduser = "";
        this.portfolioDetails.selectedPortfolio = "";
        this.teamAdvisorDetails.selectedadvisor = "";
        this.modelDetails.selectedmodel = "";

        // reset sorting in details tabs
        this.teamUserDetails.gridOptions.api.setSortModel(null);
        this.portfolioDetails.gridOptions.api.setSortModel(null);
        this.teamAdvisorDetails.gridAdvisorOptions.api.setSortModel(null);
        this.modelDetails.gridModelOptions.api.setSortModel(null);

        //to reset grid filters on team sub tabs
        this.teamUserDetails.gridOptions.api.setFilterModel(null);
        this.teamUserDetails.gridOptions.api.onFilterChanged();
        this.portfolioDetails.gridOptions.api.setFilterModel(null);
        this.portfolioDetails.gridOptions.api.onFilterChanged();
        this.teamAdvisorDetails.gridAdvisorOptions.api.setFilterModel(null);
        this.teamAdvisorDetails.gridAdvisorOptions.api.onFilterChanged();
        this.modelDetails.gridModelOptions.api.setFilterModel(null);
        this.modelDetails.gridModelOptions.api.onFilterChanged();

        //to reset grid column menu header icon
        this.teamUserDetails.gridOptions.columnApi.resetColumnState();
        this.portfolioDetails.gridOptions.columnApi.resetColumnState();
        this.teamAdvisorDetails.gridAdvisorOptions.columnApi.resetColumnState();
        this.modelDetails.gridModelOptions.columnApi.resetColumnState();

        //to reset tool panel in team sub tabs
        if (this.teamUserDetails.gridOptions.api.isToolPanelShowing() == true)
            this.teamUserDetails.gridOptions.api.showToolPanel(false);
        if (this.portfolioDetails.gridOptions.api.isToolPanelShowing() == true)
            this.portfolioDetails.gridOptions.api.showToolPanel(false);
        if (this.teamAdvisorDetails.gridAdvisorOptions.api.isToolPanelShowing() == true)
            this.teamAdvisorDetails.gridAdvisorOptions.api.showToolPanel(false);
        if (this.modelDetails.gridModelOptions.api.isToolPanelShowing() == true)
            this.modelDetails.gridModelOptions.api.showToolPanel(false);

        // to reset Filter text in grid column in sub tabs

        this.teamUserDetails.columnDefs.forEach(element => {
            this.teamUserDetails.gridOptions.api.destroyFilter(element.field)
        });
        this.portfolioDetails.columnDefs.forEach(element => {
            this.portfolioDetails.gridOptions.api.destroyFilter(element.field)
        });
        this.teamAdvisorDetails.columnAdvisorDefs.forEach(element => {
            this.teamAdvisorDetails.gridAdvisorOptions.api.destroyFilter(element.field)
        });
        this.modelDetails.columnModelDefs.forEach(element => {
            this.modelDetails.gridModelOptions.api.destroyFilter(element.field)
        });

    }
    /**
     * To Get selected team details by team Id
     */
    getTeamDetailsById(teamId: number) {
        this._teamService.getTeamById(teamId)
            .map((response: Response) => response.json())
            //.do(data => console.log('Team details :' + JSON.stringify(data)))
            .subscribe(teamDetails => {
                this.team = <ITeam>teamDetails;
                if (this.team.status == 1) {
                    this.teamStatus = 1;
                } else { this.teamStatus = 0 }
                console.log("from get team by id", this.team);
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**
     * To get Team Portfolio List
     */
    getTeamPortfolio() {
        this.portfolioList = [];
        this.portfolioDetails.teamPortfolio.forEach(element => {
            this.portfolioList.push(element.id);
        });
        if (this.team.portfolioAccess == 1) {
            this.portfolioList = [];
        }
        return this.portfolioList;
    }

    /**
     * To Get Team Model List
     */
    getTeamModel() {
        this.modelList = [];
        this.modelDetails.teamModel.forEach(element => {
            this.modelList.push(element.id);
        });
        if (this.team.modelAccess == 1) {
            this.modelList = [];
        }
        return this.modelList;
    }

    /**get team users data*/
    getTeamUsers() {
        this.teamUsersList = [];
        this.teamUserDetails.teamUsers.forEach(element => {
            this.teamUsersList.push(element.id);
        });
        return this.teamUsersList;
    }

    /**get team advisors data*/
    getTeamAdvisors() {
        this.teamAdvisorList = [];
        this.teamAdvisorDetails.teamAdvisors.forEach(element => {
            this.teamAdvisorList.push(element.id);
        });
        return this.teamAdvisorList;
    }

    /**
     * To save Team Details on clicking on save
     */
    onSave() {
        if (this.team.name == undefined || this.team.name.trim() == "") {
            this.nameValidation = true;
            return;
        }
        //this.team.status = parseFloat(this.team.status)
        if (this.teamStatus == 1) {
            this.team.status = 1;
        } else { this.team.status = 0 }
        this.team.name = this.team.name.trim();
        if (this.team.id > 0) {
            this._teamService.updateTeam(this.team).map((response: Response) => <ITeam>response.json())
                .subscribe(model => {
                    this.updateTeamData(model.id);
                    this.resetForm();
                });
        } else {
            this._teamService.createTeam(this.team).map((response: Response) => <ITeam>response.json())
                .subscribe(model => {
                    this.saveTeamData(model.id);
                    this.resetForm();

                }, error => {
                    //if (error.status == 422)
                    //this.errorMessage = "Team already exist with same name";
                });
        }
    }

    /** To get already team is existing or not with same team name*/
    teamAlreadyExist() {
        if (this.team.name == undefined || this.team.name.trim() == "") return;
        else {
            this.nameValidation = false;
            this._teamService.searchTeams(this.team.name.trim())
                .map((response: Response) => <ITeam[]>response.json())
                .subscribe(teams => {
                    let matchingTeams = teams.filter(r =>
                        r.name.toLowerCase().trim() == this.team.name.toLowerCase().trim()
                        && r.id != this.team.id);
                    console.log('team length :', matchingTeams.length);
                    this.matchingTeamsExists = matchingTeams.length > 0;
                });
        }
    }


    /** Save team users, portfolios, advisors and models */
    saveTeamData(teamId: number) {
        let saveteamsdata = [];
        let id = this.getTeamUsers();
        if (id.length > 0) {
            saveteamsdata.push(this._teamService.saveTeamUsers(teamId, { 'userIds': this.getTeamUsers() })
                .map((response: Response) => response.json()));
        }
        id = this.getTeamPortfolio();
        if (id.length > 0) {
            saveteamsdata.push(this._teamService.saveTeamPortfolios(teamId, { 'portfolioIds': this.getTeamPortfolio() })
                .map((response: Response) => response.json()));
        }
        id = this.getTeamAdvisors();
        if (id.length > 0) {
            saveteamsdata.push(this._teamService.saveTeamAdvisors(teamId, { 'advisorIds': this.getTeamAdvisors() })
                .map((response: Response) => response.json()));
        }
        id = this.getTeamModel();
        if (id.length > 0) {
            saveteamsdata.push(this._teamService.saveTeamModels(teamId, { 'modelIds': this.getTeamModel() })
                .map((response: Response) => response.json()));
        }
        if (saveteamsdata.length == 0)
            this.teamSaved.emit("Team saved");
        else {
            // execute all requests one by one
            Observable.forkJoin(saveteamsdata)
                .subscribe(data => {
                    this.teamSaved.emit("Team saved");
                });
        }

    }


    /** Update team users, portfolios, advisors and models */
    updateTeamData(teamId: number) {
        let individulTeamsData = [];
        individulTeamsData.push(this._teamService.updateTeamUsers(teamId, { 'userIds': this.getTeamUsers() })
            .map((response: Response) => response.json()));
        individulTeamsData.push(this._teamService.updateTeamPortfolios(teamId, { 'portfolioIds': this.getTeamPortfolio() })
            .map((response: Response) => response.json()));
        individulTeamsData.push(this._teamService.updateTeamAdvisors(teamId, { 'advisorIds': this.getTeamAdvisors() })
            .map((response: Response) => response.json()));
        individulTeamsData.push(this._teamService.updateTeamModels(teamId, { 'modelIds': this.getTeamModel() })
            .map((response: Response) => response.json()));
        // execute all requests one by one
        Observable.forkJoin(individulTeamsData)
            .subscribe(data => {
                this.teamSaved.emit("Team updated");
            });
    }

    /*** function to hide the  checked tab for portfolio and model */
    toggleTabs(tabName, tabClass) {
        if (this._objtabs.activeTab === tabName) {
            this._objtabs.deactivateAllTabsandActiveSelectedTab("tabUsers");
        }
        this._objtabs.deactiveselectedTab(tabName, tabClass);
    }

    /**To set default values */
    private setDefaults() {
        this.team.modelAccess = 0;
        this.team.portfolioAccess = 0;
    }

    /**  reset form */
    private resetForm() {
        this.selectedTeamId = undefined;
        this.team.name = '';
        this.isTypeDisabled = false;
        this.teamStatus = 1;
        this.teamnametxt = '';
        this.team = <ITeam>{};
        this.existingTeamsCount = 0;
        this.matchingTeamsExists = false;
        this.isView = false;
        this.showSaveBtn = true;
        this.teamUserDetails.isViewUser = false;
        this.portfolioDetails.isViewPortfolio = false;
        this.teamAdvisorDetails.isViewAdvisor = false;
        this.modelDetails.isViewModel = false;
        this.nameValidation = false;
        this.teamUserDetails.btnDisableUser = true;
        this.portfolioDetails.btnDisablePortfolio = true;
        this.teamAdvisorDetails.btnDisableAdvisor = true;
        this.modelDetails.btnDisableModel = true;

    }

    /**Get changed radio button value */
    PortfoiloPermissionRadioBtnChange(val) {
        this.team.portfolioAccess = val;
    }

    /**Get changed radio button value */
    ModelPermissionRadioBtnChange(val) {
        this.team.modelAccess = val;
    }

    /*** Redirect to All Teams on clicking on cancel*/
    onCancel() {
        this.resetForm();
        this.teamSaved.emit("Team Cancel");
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.innerHTML === "Users") {
            this.teamUserDetails.selecteduser = "";
            this.teamUserDetails.gridOptions.api.setSortModel(null);
            this.teamUserDetails.gridOptions.api.setFilterModel(null);
            this.teamUserDetails.gridOptions.api.onFilterChanged();
            this.teamUserDetails.gridOptions.columnApi.resetColumnState();
            if (this.teamUserDetails.gridOptions.api.isToolPanelShowing() == true)
                this.teamUserDetails.gridOptions.api.showToolPanel(false);
            this.teamUserDetails.columnDefs.forEach(element => {
                this.teamUserDetails.gridOptions.api.destroyFilter(element.field)
            });

        }
        else if (targetElement.innerHTML === "Portfolio") {
            this.portfolioDetails.selectedPortfolio = "";
            this.portfolioDetails.gridOptions.api.setSortModel(null);
            this.portfolioDetails.gridOptions.api.setFilterModel(null);
            this.portfolioDetails.gridOptions.api.onFilterChanged();
            this.portfolioDetails.gridOptions.columnApi.resetColumnState();
            if (this.portfolioDetails.gridOptions.api.isToolPanelShowing() == true)
                this.portfolioDetails.gridOptions.api.showToolPanel(false);
            this.portfolioDetails.columnDefs.forEach(element => {
                this.portfolioDetails.gridOptions.api.destroyFilter(element.field)
            });
        }
        else if (targetElement.innerHTML === "Advisor") {
            this.teamAdvisorDetails.selectedadvisor = "";
            this.teamAdvisorDetails.gridAdvisorOptions.api.setSortModel(null);
            this.teamAdvisorDetails.gridAdvisorOptions.api.setFilterModel(null);
            this.teamAdvisorDetails.gridAdvisorOptions.api.onFilterChanged();
            this.teamAdvisorDetails.gridAdvisorOptions.columnApi.resetColumnState();
            if (this.teamAdvisorDetails.gridAdvisorOptions.api.isToolPanelShowing() == true)
                this.teamAdvisorDetails.gridAdvisorOptions.api.showToolPanel(false);
            this.teamAdvisorDetails.columnAdvisorDefs.forEach(element => {
                this.teamAdvisorDetails.gridAdvisorOptions.api.destroyFilter(element.field)
            });
        }
        else if (targetElement.innerHTML === "Model") {
            this.modelDetails.selectedmodel = "";
            this.modelDetails.gridModelOptions.api.setSortModel(null);
            this.modelDetails.gridModelOptions.api.setFilterModel(null);
            this.modelDetails.gridModelOptions.api.onFilterChanged();
            this.modelDetails.gridModelOptions.columnApi.resetColumnState();
            if (this.modelDetails.gridModelOptions.api.isToolPanelShowing() == true)
                this.modelDetails.gridModelOptions.api.showToolPanel(false);
            this.modelDetails.columnModelDefs.forEach(element => {
                this.modelDetails.gridModelOptions.api.destroyFilter(element.field)
            });
        }
    }

    /* To get static status types*/
    private getStatusTypes() {
        this.statusType = this._teamService.getTeamStatus().sort((t1, t2) => {
            if (t1.typeName.trim() > t2.typeName.trim()) return 1;
            if (t1.typeName.trim() < t2.typeName.trim()) return -1;
            return 0
        });
    }

}



