import { Component, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { TabSet } from '../../../../shared/tabs/tabset';
import { Tab } from '../../../../shared/tabs/tab';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { ITeam } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';
import { PortfolioService } from '../../../../services/portfolio.service';
import { TeamUsersComponent } from '../shared/teamusers.component';
import { TeamPortfoliosComponent } from '../shared/teamportfolio.component'
import { IAdminDashboard } from '../../../../models/dashboard';
import { TeamAdvisorsComponent } from '../shared/teamadvisor.component';
import { TeamModelsComponent } from '../shared/teammodel.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, TeamTabNavComponent } from '../shared/team.tabnav.component';

@Component({
    selector: 'eclipse-admin-team-detail',
    templateUrl: './app/components/admin/team/detail/teamdetail.component.html',
    directives: [AdminLeftNavComponent, TeamTabNavComponent, TabSet, Tab, TeamUsersComponent, TeamPortfoliosComponent, TeamAdvisorsComponent, TeamModelsComponent],
    providers: [TeamService, PortfolioService]
})

export class TeamDetailComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    teamId: number;
    team: ITeam = <ITeam>{};
    portfolioList: number[] = [];
    modelList: number[] = [];
    matchingTeamsExists: boolean = false;
    nameValidation: boolean = false;
    statusTypes: any[] = [];

    @ViewChild(TabSet) tabSetComp: TabSet;
    @ViewChild(TeamUsersComponent) teamUsersChild: TeamUsersComponent;
    @ViewChild(TeamPortfoliosComponent) portfolioChild: TeamPortfoliosComponent;
    @ViewChild(TeamAdvisorsComponent) teamAdvisorsChild: TeamAdvisorsComponent;
    @ViewChild(TeamModelsComponent) teamModelsChild: TeamModelsComponent;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _teamService: TeamService) {
        super(PRIV_TEAMS);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = VIEWA;
        this.activeRoute = Util.activeRoute(this.activateRoute);
        this.team = <ITeam>{ status: 1, modelAccess: 0, portfolioAccess: 0 };
        this.teamId = Util.getRouteParam<number>(this.activateRoute);
        if (this.teamId > 0) {
            this.tabsModel.action = VIEWE;
            this.tabsModel.id = this.teamId;
        }
    }

    ngOnInit() {
        this.getStatusTypes();
        if (this.teamId > 0) {
            this.getTeamDetailsById();
        }
        this.teamUsersChild.initTeamUsers(this.tabsModel.action, this.teamId);
        this.portfolioChild.initTeamPortfolios(this.tabsModel.action, this.teamId);
        this.teamAdvisorsChild.initTeamAdvisors(this.tabsModel.action, this.teamId);
        this.teamModelsChild.initTeamModels(this.tabsModel.action, this.teamId);
        this.getTeamSummary();
    }

    resetTeamDetailsGrid() {
        // reset sorting in details tabs
        /*this.teamUsersChild.gridOptions.api.setSortModel(null);
        this.portfolioChild.gridOptions.api.setSortModel(null);
        this.teamAdvisorsChild.gridOptions.api.setSortModel(null);
        this.teamModelsChild.gridOptions.api.setSortModel(null);

        //to reset grid filters on team sub tabs
        this.teamUsersChild.gridOptions.api.setFilterModel(null);
        this.teamUsersChild.gridOptions.api.onFilterChanged();
        this.portfolioChild.gridOptions.api.setFilterModel(null);
        this.portfolioChild.gridOptions.api.onFilterChanged();
        this.teamAdvisorsChild.gridOptions.api.setFilterModel(null);
        this.teamAdvisorsChild.gridOptions.api.onFilterChanged();
        this.teamModelsChild.gridOptions.api.setFilterModel(null);
        this.teamModelsChild.gridOptions.api.onFilterChanged();

        //to reset grid column menu header icon
        this.teamUsersChild.gridOptions.columnApi.resetColumnState();
        this.portfolioChild.gridOptions.columnApi.resetColumnState();
        this.teamAdvisorsChild.gridOptions.columnApi.resetColumnState();
        this.teamModelsChild.gridOptions.columnApi.resetColumnState();

        //to reset tool panel in team sub tabs
        if (this.teamUsersChild.gridOptions.api.isToolPanelShowing() == true)
            this.teamUsersChild.gridOptions.api.showToolPanel(false);
        if (this.portfolioChild.gridOptions.api.isToolPanelShowing() == true)
            this.portfolioChild.gridOptions.api.showToolPanel(false);
        if (this.teamAdvisorsChild.gridOptions.api.isToolPanelShowing() == true)
            this.teamAdvisorsChild.gridOptions.api.showToolPanel(false);
        if (this.teamModelsChild.gridOptions.api.isToolPanelShowing() == true)
            this.teamModelsChild.gridOptions.api.showToolPanel(false);

        // to reset Filter text in grid column in sub tabs
        this.teamUsersChild.columnDefs.forEach(element => {
            this.teamUsersChild.gridOptions.api.destroyFilter(element.field)
        });
        this.portfolioChild.columnDefs.forEach(element => {
            this.portfolioChild.gridOptions.api.destroyFilter(element.field)
        });
        this.teamAdvisorsChild.columnDefs.forEach(element => {
            this.teamAdvisorsChild.gridOptions.api.destroyFilter(element.field)
        });
        this.teamModelsChild.columnDefs.forEach(element => {
            this.teamModelsChild.gridOptions.api.destroyFilter(element.field)
        });*/
    }

    /** Get teams summary */
    private getTeamSummary() {
        this.responseToObject<IAdminDashboard>(this._teamService.getTeamSummary())
            .subscribe(model => {
                // console.log("team summary", model);
                this.menuModel.all = model.totalTeams;
                this.menuModel.existingOrActive = model.existingTeams;
                this.menuModel.newOrPending = model.newTeams;
            });
    }

    /** Get selected team details by team Id */
    getTeamDetailsById() {
        this.responseToObject<ITeam>(this._teamService.getTeamById(this.teamId))
            .subscribe(model => {
                this.team = model;
                console.log("from get team by id", this.team);
                /** Hide the checked tab for portfolio and model */
                if (model.portfolioAccess == 1)
                    this.toggleTabs('tabPortfolio', 'hide-tab');
                if (model.modelAccess == 1)
                    this.toggleTabs('tabModel', 'hide-tab');
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** Get Team Portfolio List */
    getTeamPortfolios() {
        return (this.team.portfolioAccess == 1) ? []
            : this.portfolioChild.teamPortfolios.map(m => m.id);;
    }

    /** Get team model list */
    getTeamModels() {
        return (this.team.modelAccess == 1) ? []
            : this.teamModelsChild.teamModels.map(m => m.id);
    }

    /** Get team users data */
    getTeamUsers() {
        return this.teamUsersChild.teamUsers.map(m => m.id);
    }

    /** Get team advisors data */
    getTeamAdvisors() {
        return this.teamAdvisorsChild.teamAdvisors.map(m => m.id);
    }

    /** Save team details on clicking on save */
    onSave() {
        if (this.team.name == undefined || this.team.name.trim() == "") {
            this.nameValidation = true;
            return;
        }
        this.team.name = this.team.name.trim();
        this.team.status = parseInt(this.team.status.toString());
        if (this.team.id > 0) {
            this.responseToObject<ITeam>(this._teamService.updateTeam(this.team))
                .subscribe(model => {
                    this.updateTeamData(model.id);
                });
        } else {
            this.responseToObject<ITeam>(this._teamService.createTeam(this.team))
                .subscribe(model => {
                    this.saveTeamData(model.id);
                }, error => {
                    //if (error.status == 422)
                    //this.errorMessage = "Team already exist with same name";
                });
        }
    }

    /** Save team users, portfolios, advisors and models */
    saveTeamData(teamId: number) {
        let saveTeamsData = [];
        let selectedIds = this.getTeamUsers();
        if (selectedIds.length > 0) {
            saveTeamsData.push(this.responseToObject<any>(this._teamService.saveTeamUsers(teamId, { 'userIds': selectedIds })));
        }
        selectedIds = this.getTeamPortfolios();
        if (selectedIds.length > 0) {
            saveTeamsData.push(this.responseToObject<any>(this._teamService.saveTeamPortfolios(teamId, { 'portfolioIds': selectedIds })));
        }
        selectedIds = this.getTeamAdvisors();
        if (selectedIds.length > 0) {
            saveTeamsData.push(this.responseToObject<any>(this._teamService.saveTeamAdvisors(teamId, { 'advisorIds': selectedIds })));
        }
        selectedIds = this.getTeamModels();
        if (selectedIds.length > 0) {
            saveTeamsData.push(this.responseToObject<any>(this._teamService.saveTeamModels(teamId, { 'modelIds': selectedIds })));
        }
        if (saveTeamsData.length > 0) {
            // execute all requests one by one
            Observable.forkJoin(saveTeamsData)
                .subscribe(data => {
                    this._router.navigate(['/eclipse/admin/team/list']);
                });
        }
        else
            this._router.navigate(['/eclipse/admin/team/list']);
    }

    /** Update team users, portfolios, advisors and models */
    updateTeamData(teamId: number) {
        let individulTeamsData = [
            this.responseToObject<any>(this._teamService.updateTeamUsers(teamId, { 'userIds': this.getTeamUsers() })),
            this.responseToObject<any>(this._teamService.updateTeamPortfolios(teamId, { 'portfolioIds': this.getTeamPortfolios() })),
            this.responseToObject<any>(this._teamService.updateTeamAdvisors(teamId, { 'advisorIds': this.getTeamAdvisors() })),
            this.responseToObject<any>(this._teamService.updateTeamModels(teamId, { 'modelIds': this.getTeamModels() }))
        ];
        // execute all requests one by one
        Observable.forkJoin(individulTeamsData)
            .subscribe(data => {
                this._router.navigate(['/eclipse/admin/team/list']);
            });
    }

    /** Get already team is existing or not with same team name */
    teamAlreadyExist() {
        if (this.team.name == undefined || this.team.name.trim() == "") return;
        else {
            this.nameValidation = false;
            this.ResponseToObjects<ITeam>(this._teamService.searchTeams(this.team.name.trim()))
                .subscribe(teams => {
                    let matchingTeams = teams.filter(r =>
                        r.name.toLowerCase().trim() == this.team.name.toLowerCase().trim()
                        && r.id != this.team.id);
                    console.log('team length :', matchingTeams.length);
                    this.matchingTeamsExists = matchingTeams.length > 0;
                });
        }
    }

    /** Hide the checked tab for portfolio and model */
    toggleTabs(tabName, tabClass) {
        if (this.tabSetComp.activeTab === tabName) {
            this.tabSetComp.deactivateAllTabsandActiveSelectedTab("tabUsers");
        }
        this.tabSetComp.deactiveselectedTab(tabName, tabClass);
    }

    /** Hide portfolio tab on portfolio permission change */
    portfoiloPermissionChange(val) {
        this.team.portfolioAccess = val;
        this.toggleTabs('tabPortfolio', val == 1 ? 'hide-tab' : 'show-tab');
    }

    /** Hide model tab on model permission change */
    modelPermissionChange(val) {
        this.team.modelAccess = val;
        this.toggleTabs('tabModel', val == 1 ? 'hide-tab' : 'show-tab');
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.innerHTML === "Users") {
            this.teamUsersChild.selectedUser = undefined;
            this.teamUsersChild.gridOptions.api.setSortModel(null);
            this.teamUsersChild.gridOptions.api.setFilterModel(null);
            this.teamUsersChild.gridOptions.api.onFilterChanged();
            this.teamUsersChild.gridOptions.columnApi.resetColumnState();
            if (this.teamUsersChild.gridOptions.api.isToolPanelShowing() == true)
                this.teamUsersChild.gridOptions.api.showToolPanel(false);
            this.teamUsersChild.columnDefs.forEach(element => {
                this.teamUsersChild.gridOptions.api.destroyFilter(element.field)
            });
        }
        else if (targetElement.innerHTML === "Portfolio") {
            this.portfolioChild.selectedPortfolio = undefined;
            this.portfolioChild.gridOptions.api.setSortModel(null);
            this.portfolioChild.gridOptions.api.setFilterModel(null);
            this.portfolioChild.gridOptions.api.onFilterChanged();
            this.portfolioChild.gridOptions.columnApi.resetColumnState();
            if (this.portfolioChild.gridOptions.api.isToolPanelShowing() == true)
                this.portfolioChild.gridOptions.api.showToolPanel(false);
            this.portfolioChild.columnDefs.forEach(element => {
                this.portfolioChild.gridOptions.api.destroyFilter(element.field)
            });
        }
        else if (targetElement.innerHTML === "Advisor") {
            this.teamAdvisorsChild.selectedAdvisor = undefined;
            this.teamAdvisorsChild.gridOptions.api.setSortModel(null);
            this.teamAdvisorsChild.gridOptions.api.setFilterModel(null);
            this.teamAdvisorsChild.gridOptions.api.onFilterChanged();
            this.teamAdvisorsChild.gridOptions.columnApi.resetColumnState();
            if (this.teamAdvisorsChild.gridOptions.api.isToolPanelShowing() == true)
                this.teamAdvisorsChild.gridOptions.api.showToolPanel(false);
            this.teamAdvisorsChild.columnDefs.forEach(element => {
                this.teamAdvisorsChild.gridOptions.api.destroyFilter(element.field)
            });
        }
        else if (targetElement.innerHTML === "Model") {
            this.teamModelsChild.selectedModel = undefined;
            this.teamModelsChild.gridOptions.api.setSortModel(null);
            this.teamModelsChild.gridOptions.api.setFilterModel(null);
            this.teamModelsChild.gridOptions.api.onFilterChanged();
            this.teamModelsChild.gridOptions.columnApi.resetColumnState();
            if (this.teamModelsChild.gridOptions.api.isToolPanelShowing() == true)
                this.teamModelsChild.gridOptions.api.showToolPanel(false);
            this.teamModelsChild.columnDefs.forEach(element => {
                this.teamModelsChild.gridOptions.api.destroyFilter(element.field)
            });
        }
    }

    /** Get static status types */
    private getStatusTypes() {
        this.statusTypes = Util.sortBy(this._teamService.getTeamStatus(), 'typeName');
    }

     /** Acction menu events */
    showPopup(event) {
        switch (event) {
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/team', this.tabsModel.id]);
                break;
            default:
        }
    }
}
