import { Component, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { TabSet } from '../../../../shared/tabs/tabset';
import { Tab } from '../../../../shared/tabs/tab';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IAdminDashboard } from '../../../../models/dashboard';
import { ITeam } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';
import { PortfolioService } from '../../../../services/portfolio.service';
import { TeamUsersComponent } from '../shared/teamusers.component';
import { TeamPortfoliosComponent } from '../shared/teamportfolio.component'
import { TeamAdvisorsComponent } from '../shared/teamadvisor.component';
import { TeamModelsComponent } from '../shared/teammodel.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, TeamTabNavComponent } from '../shared/team.tabnav.component';

@Component({
    selector: 'eclipse-admin-team-view',
    templateUrl: './app/components/admin/team/view/teamview.component.html',
    providers: [TeamService, PortfolioService]
})

export class TeamViewComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    teamId: number;
    team: ITeam = <ITeam>{};
    teamSuggestions: any[] = [];
    selectedTeam: string;

    @ViewChild(TabSet) tabSetComp: TabSet;
    @ViewChild(TeamUsersComponent) teamUsersChild: TeamUsersComponent;
    @ViewChild(TeamPortfoliosComponent) portfolioChild: TeamPortfoliosComponent;
    @ViewChild(TeamAdvisorsComponent) teamAdvisorsChild: TeamAdvisorsComponent;
    @ViewChild(TeamModelsComponent) teamModelsChild: TeamModelsComponent;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _teamService: TeamService) {
        super(PRIV_TEAMS);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = VIEWV;
        this.teamId = Util.getRouteParam<number>(this.activateRoute);
        if (this.teamId > 0) {
            this.tabsModel.id = this.teamId;
        }
        else { this.teamId = undefined; }
    }

    ngOnInit() {
        if (this.teamId > 0) {
            this.getTeamDetailsById();
        }
         this.getTeamSummary();
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


    /** AutoComplete Search by TeamName */
    autoTeamSearch(event) {
        this.ResponseToObjects<ITeam>(this._teamService.searchTeams(event.query.toLowerCase()))
            .subscribe(model => {
                this.teamSuggestions = model;
            });
    }

    onTeamSelect(params: any) {
        this._router.navigate(['/eclipse/admin/team/filter', params.id]);
    }

    /** Get selected team details by team Id */
    getTeamDetailsById() {
        this.responseToObject<ITeam>(this._teamService.getTeamById(this.teamId))
            .subscribe(model => {
                this.team = model;
                console.log("from get team by id", this.team);
                /** Hide the checked tab for portfolio and model */
                if (model.portfolioAccess == 0)
                    this.toggleTabs('tabPortfolio', 'hide-tab');
                if (model.modelAccess == 0)
                    this.toggleTabs('tabModel', 'hide-tab');
                this.teamUsersChild.initTeamUsers(this.tabsModel.action, this.teamId);
                if (model.portfolioAccess == 1)
                    this.portfolioChild.initTeamPortfolios(this.tabsModel.action, this.teamId);
                this.teamAdvisorsChild.initTeamAdvisors(this.tabsModel.action, this.teamId);
                if (model.modelAccess == 1)
                    this.teamModelsChild.initTeamModels(this.tabsModel.action, this.teamId);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** Hide the checked tab for portfolio and model */
    toggleTabs(tabName, tabClass) {
        if (this.tabSetComp.activeTab === tabName) {
            this.tabSetComp.deactivateAllTabsandActiveSelectedTab("tabUsers");
        }
        this.tabSetComp.deactiveselectedTab(tabName, tabClass);
    }

    /** Fires when action menu item clicked */
    showPopup(event) {
        switch (event) {
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/team', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
            default:

        }
    }
    
    /** Reset ag-gridOptions */
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
              this.teamUsersChild.gridOptions.api.sizeColumnsToFit(); 
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
             this.portfolioChild.gridOptions.api.sizeColumnsToFit(); 
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
             this.teamAdvisorsChild.gridOptions.api.sizeColumnsToFit(); 
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
             this.teamModelsChild.gridOptions.api.sizeColumnsToFit(); 
        }
    }

}
