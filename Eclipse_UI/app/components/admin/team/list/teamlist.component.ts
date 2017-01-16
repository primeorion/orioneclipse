import { Component, ViewContainerRef, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { ITeam, IPortfolioPrimary} from '../../../../models/team';
import { IAdminDashboard } from '../../../../models/dashboard';
import { TeamService } from '../../../../services/team.service';
import { TeamReassignComponent } from '../shared/team.bulkreassign.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, TeamTabNavComponent } from '../shared/team.tabnav.component';

@Component({
    selector: 'eclipse-admin-team-list',
    templateUrl: './app/components/admin/team/list/teamlist.component.html',
    directives: [AdminLeftNavComponent, TeamTabNavComponent, AgGridNg2, Dialog, Button, TeamReassignComponent],
    providers: [TeamService]
})

export class TeamListComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private teams: ITeam[] = [];
    private selectedTeamId: number;
    isDeleted: boolean;
    private displayConfirm: boolean;
    private displayReassign: boolean;
    status: number;
    allTeamsData: any[] = [];
    portfolioAccess: number;
    modelAccess: number;
    noOfUsers: number;
    teamsCount: number;
    private displayPreCondition: boolean = false;
    selectedRadioVal: number;
    portfoliosCount: number;
    displayPrimryteamCndtn: boolean = false;

    @ViewChild(TeamReassignComponent) reassignTeamChild: TeamReassignComponent;

    /**
     * Contructor
     */
    constructor(private _router: Router, private activatedRoute: ActivatedRoute, private _teamService: TeamService) {
        super(PRIV_TEAMS);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = VIEWL;
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
    }

    ngOnInit() {
        this.onTeamLoad();
        this.getTeamSummary();
    }

    /**
     * default method for Teams load
     */
    onTeamLoad() {
        this.ResponseToObjects<ITeam>(this._teamService.getTeamData())
            .subscribe(model => {
                this.allTeamsData = model;
                this.teams = this.allTeamsData.filter(a => a.status == 1)
                this.teams.forEach(team => {
                    if (team.portfolioAccess == 1) team.numberOfPortfolios = -1;
                    if (team.modelAccess == 1) team.numberOfModels = -1;
                });
                this.teamsCount = model ? model.filter(m => m.status == 1).length : 0;
            },
            error => {
                console.log(error);
                throw error;
            });
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

    /** Delete button popup */
    private onDeleteClicked($event) {
        this.displayConfirm = true;
    }

    /** Delete team on confirmation */
    deleteTeam() {
        this.responseToObject<any>(this._teamService.deleteTeam(this.selectedTeamId))
            .subscribe(model => {
                this.refreshTeamList();
                this.displayConfirm = false;
            })
    }

    refreshTeamList() {
        this.onTeamLoad();
        /*To disbale right side menu links */
        this.selectedTeamId = undefined;
        this.tabsModel.id = undefined;
        this.selectedRadioVal = 0;
    }

    /** Load teams to reassign team to new team(s) and display popup */
    private bulkreassignTeam() {
        if (this.teamsCount > 1) {
            if (this.selectedTeamId == undefined) {
                this.displayReassign = true;
                return;
            }
            this.displayReassign = true;
            this.reassignTeamChild.loadReassignTeams(this.selectedTeamId);
        }
        else
            this.displayPreCondition = true;
    }

    /** Reassign teams to team(s) */
    reassignTeamToNew(isReassigned: boolean = false) {
        if (isReassigned) {
            this.displayReassign = false;
            //  this.onTeamLoad();
            this.refreshTeamList();
            return;
        }
        // to reassign team to new Team
        this.reassignTeamChild.reassignToNewTeam();
    }

    /** Create column headers for ag-grid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Team ID", field: "id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Team Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Users", field: "numberOfUsers", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Portfolios", field: "numberOfPortfolios", cellRenderer: this.portfoliosRenderer, width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Advisors", field: "numberOfAdvisors", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Models", field: "numberOfModels", cellRenderer: this.modelsRenderer, width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellRenderer: this.statusRenderer, floatCell: true, cellClass: 'text-center', filterParams: { cellRenderer: this.statusFilterRenderer } }
        ];
    }

    /** Renders portfolio column */
    portfoliosRenderer(params) {
        let team = params.data;
        if (team != null) {
            return (team.portfolioAccess == 1) ? '*' : team.numberOfPortfolios.toString();
        }
    }

    /** Renders model column */
    modelsRenderer(params) {
        let team = params.data;
        if (team != null) {
            return (team.modelAccess == 1) ? '*' : team.numberOfModels.toString();
        }
    }

    /** Renders status for row data */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png" />'; //'<i class="material-icons green size18"></i>'
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png" />';
        else
            return null;
        return result + '</span>';
    }

    /** Renders based on status filter */
    statusFilterRenderer(params) {
        let filterParam = true;
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png" />';
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png" />';
        else
            return null;
        if (filterParam && params.value === 0) {
            result += '(no records)';
        }
        return result + '</span>';
    }

    /** Fetch only active status data */
    filterTeamsGrid(all: number) {
        this.selectedRadioVal = all;
        this.selectedTeamId = undefined;
        this.teams = (all == 0) ? this.allTeamsData.filter(a => a.status == 1) : this.allTeamsData;
        this.gridOptions.api.setRowData(this.teams);
        this.getTeamSummary();
        this.teamsCount = this.teams ? (all == 0 ? this.teams.length : this.teams.filter(a => a.status == 1).length) : 0;
    }

    /** Display module updates on console */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        // console.log('targetElement matches: ', matches);
        let [selectedTeamId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View details") {
            this._router.navigate(['/eclipse/admin/team/view', selectedTeamId]);
        }
        else if (targetElement.innerText === "Edit") {
            this._router.navigate(['/eclipse/admin/team/edit', selectedTeamId]);
        }
        else if (targetElement.innerText === "Edit preferences") {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
                this._router.navigate(['/eclipse/admin/preferences/team', this.tabsModel.ids.join()]);
            else
                this._router.navigate(['/eclipse/admin/preferences/team', selectedTeamId]);
        }
        else if (targetElement.innerText === "Bulk reassign") {
            this.bulkreassignTeam();
        }
        else if (targetElement.innerText === "Delete") {
            if (deleteval == 0) {
                this.selectedTeamId = selectedTeamId;
               this.deletePreConditionCheck();
            }
        }
    }

    /** method to display context menu on ag-grid */
    private getContextMenuItems(params) {
        let permission = Util.getPermission(PRIV_ROLES);
        let contextMenu = [];
        let selectedRows = params.api.getSelectedRows();
        if (selectedRows.length > 1 && permission.canUpdate) {
            contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
        } else {
            if (permission.canRead)
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + ' modelflag=' + params.node.data.modelAccess + ' portfolioflag=' + params.node.data.portfolioAccess + '>View details</hidden>' });
            if (permission.canUpdate) {
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + ' modelflag=' + params.node.data.modelAccess + ' portfolioflag=' + params.node.data.portfolioAccess + '>Edit</hidden>' });
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
                if (params.node.data.numberOfUsers > 0)
                    contextMenu.push({ name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.numberOfUsers + '>Bulk reassign</hidden>' })
            }
            if (permission.canDelete) {
                contextMenu.push({
                    name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                    disabled: (params.node.data.isDeleted == 1),
                });
            }
        }
        return contextMenu;
    }

    /** Grid row clicked event */
    private onRowClicked($event) {
        this.selectedTeamId = $event.data.id;
        this.tabsModel.id = +$event.data.id;
        this.status = $event.data.status;
        this.isDeleted = $event.data.isDeleted;
        this.tabsModel.count = $event.data.numberOfUsers;
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let team = <ITeam[]>this.gridOptions.api.getSelectedRows();
        if (team.length > 1) {
            this.tabsModel.ids = team.map(m => m.id);
            this.tabsModel.id = undefined;
        }
        else if (team.length == 1) {
            this.tabsModel.id = team[0].id;
            this.tabsModel.count = team[0].numberOfUsers;
            this.tabsModel.ids = undefined;
        }
    }

    /** Redirect to team details to view or edit selected team */
    private onRowDoubleClicked($event) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/admin/team/view', $event.data.id]);
        else if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/admin/team/edit', $event.data.id]);
        // this.modelAccess = $event.data.modelAccess;
        // this.portfolioAccess = $event.data.portfolioAccess;
    }

/**To check primary team condition before delete */
    deletePreConditionCheck() {       
        this.ResponseToObjects<IPortfolioPrimary>(this._teamService.getPortfoliosByTeamId(this.selectedTeamId))
            .subscribe(model => {
                this.portfoliosCount = model ? model.length : 0;
                if (this.portfoliosCount > 0)
                    this.displayPrimryteamCndtn = true;
                else
                    this.displayConfirm = true;
            })
    }
    showPopup(event) {
        switch (event) {
            case 'DELETE':
                this.deletePreConditionCheck();
               // this.displayConfirm = true;
                break;
            case 'REASSIGN':
                this.bulkreassignTeam();
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/team', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
            default:


        }
    }

}
