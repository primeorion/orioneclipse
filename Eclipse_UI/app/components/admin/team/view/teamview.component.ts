import { Component, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { TabSet } from '../../../../shared/tabs/tabset';
import { Tab } from '../../../../shared/tabs/tab';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { ITeam } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';
import { PortfolioService } from '../../../../services/portfolio.service';
import { TeamUsersComponent } from '../shared/teamusers.component';
import { TeamPortfoliosComponent } from '../shared/teamportfolio.component';
import { IAdminDashboard } from '../../../../models/dashboard';
import { TeamAdvisorsComponent } from '../shared/teamadvisor.component';
import { TeamModelsComponent } from '../shared/teammodel.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, TeamTabNavComponent } from '../shared/team.tabnav.component';

@Component({
    selector: 'eclipse-admin-team-view',
    templateUrl: './app/components/admin/team/view/teamview.component.html',
    directives: [AdminLeftNavComponent, TeamTabNavComponent, AutoComplete, TabSet, Tab, TeamUsersComponent, TeamPortfoliosComponent, TeamAdvisorsComponent, TeamModelsComponent],
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
    }

    ngOnInit() {
        if (this.teamId > 0) {
            this.getTeamDetailsById();
        }
         this.getTeamSummary();
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
                this.teamUsersChild.initTeamUsers(this.tabsModel.action, this.teamId);
                if (model.portfolioAccess == 0)
                    this.portfolioChild.initTeamPortfolios(this.tabsModel.action, this.teamId);
                this.teamAdvisorsChild.initTeamAdvisors(this.tabsModel.action, this.teamId);
                if (model.modelAccess == 0)
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

}
