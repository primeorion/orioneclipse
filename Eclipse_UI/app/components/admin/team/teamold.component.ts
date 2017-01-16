import { Component, ViewContainerRef, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import * as Util from '../../../core/functions';
import { Response } from '@angular/http';
import { TeamService } from '../../../services/team.service';
import { ITeam } from '../../../models/team';
import { BaseComponent } from '../../../core/base.component';
import { TeamDetailsComponent } from './teamdetails.component';
import { Dialog } from 'primeng/components/dialog/dialog';
import { TeamReassignComponent1 } from './team.bulkreassign.component';
import { Button } from 'primeng/components/button/button';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../shared/leftnavigation/admin.leftnav';
import { IAdminDashboard } from '../../../models/dashboard';
import { ITabNav, TeamTabNavComponent } from '../team/shared/team.tabnav.component';

@Component({
    selector: 'eclipse-admin-team',
    templateUrl: './app/components/admin/team/teamold.component.html',
    directives: [TabSet, Tab,TeamTabNavComponent, AgGridNg2, TeamDetailsComponent, Dialog, Button, TeamReassignComponent1, AdminLeftNavComponent],
    providers: [TeamService]
})

export class TeamComponent1 extends BaseComponent {
    private tabsModel: ITabNav;
    private gridOptions: GridOptions;
    private showGrid: boolean;
    private teams: ITeam[] = [];
    private columnDefs: ColDef[];
    private allTeams: boolean;
    private selectedTeamId: number;
    isDeleted: boolean;
    private displayConfirm: boolean;
    private displayReassign: boolean;
    private menuModel: IAdminLeftMenu;
    status: number;
    allTeamsData: any[] = [];
    queryStringVal: string;
    isEdit: boolean = false;
    isView: boolean = false;
    portfolioAccess: number;
    modelAccess: number;
    noOfUsers: number;
    teamsCount: number;
    private displayPreCondition: boolean = false;
    selectedRadioVal: number;

    @ViewChild(TabSet) _objtabs: TabSet;
    @ViewChild(TeamDetailsComponent) teamDetails: TeamDetailsComponent;
    @ViewChild(TeamReassignComponent1) childreassignTeam: TeamReassignComponent1;

    /**
    * ng-models
    */
    errorMessage: string;

    /**
     * Contructor
     */
    constructor(private _router: Router, private _teamService: TeamService, private activatedRoute: ActivatedRoute) {
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.showGrid = true;
        // this.getTeamCounts();
        this.menuModel = <IAdminLeftMenu>{};
        this.activatedRoute.params
            .map(params => params['queryStr'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
    }

    ngOnInit() {
        this.onTeamLoad();
        if (this.queryStringVal == "create") {
            this._objtabs.navigatetocreatetabfromDashboard();
            this.teamDetails.shwsearchTeams = true;
        }
        if (this.queryStringVal == "add") {
            this.teamDetails.showPanel = "visible";
            this.teamDetails.btnValue = "Add"
            this._objtabs.navigatetocreatetabfromDashboard();
            this.teamDetails.shwsearchTeams = false;


        }
    }

    /**
     * default method for Teams load
     */
    onTeamLoad() {
        this.errorMessage = '';
        this.ResponseToObjects<ITeam>(this._teamService.getTeamData())
            .subscribe(model => {
                this.allTeamsData = model;
                this.teams = this.allTeamsData.filter(a => a.status == 1)
                this.teams.forEach(team => {
                    if (team.portfolioAccess == 1) team.numberOfPortfolios = -1;
                    if (team.modelAccess == 1) team.numberOfModels = -1;
                });
                // this.getTeamCounts(this.teams);
                this.getTeamCounts();
                this.teamsCount = model ? model.filter(m => m.status == 1).length : 0;

            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**Get teams count */
    private getTeamCounts() {

        this.errorMessage = '';
        this.responseToObject<IAdminDashboard>(this._teamService.getTeamSummary())
            .subscribe(model => {
                console.log("team counts", model);

                this.menuModel.all = model.totalTeams;
                this.menuModel.existingOrActive = model.existingTeams;
                this.menuModel.newOrPending = model.newTeams;

            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /* Delete button popup*/
    private onDeleteClicked($event) {
        this.displayConfirm = true;
    }

    /**delete team on confirmation */
    deleteTeam() {
        //console.log('from delete Team confirm');
        this._teamService.deleteTeam(this.selectedTeamId).map((response: Response) => response.json())
            //.do(data => console.log('Team details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.refreshTeamList();
                this.displayConfirm = false;
            })
    }

    refreshTeamList() {
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab1");
        //console.log('From Refresh Teams');
        this.onTeamLoad();

        /*To disbale  right side menu links */
        this.selectedTeamId = undefined;
        this.selectedRadioVal = 0;
    }

    /* Grid Selected Row Event*/
    private onrowClicked($event) {
        this.isEdit = false;
        this.isView = false;
        this.selectedTeamId = $event.data.id;
        this.status = $event.data.status;
        this.isDeleted = $event.data.isDeleted;
        this.noOfUsers = $event.data.numberOfUsers;
        this.portfolioAccess = $event.data.portfolioAccess;
        this.modelAccess = $event.data.modelAccess;
    }
    /* End */

     /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let team = <ITeam[]>this.gridOptions.api.getSelectedRows();
        if (team.length > 1) {
            this.tabsModel.ids = team.map(m => m.id);
            this.tabsModel.id = undefined;
        }
        else if (team.length == 1) {
            this.tabsModel.id = team[0].id;
            this.tabsModel.ids = undefined;
        }
        console.log("onRowSelected in team: ", this.tabsModel.ids);
    }


    /**
     * Load teams to reassign team to new team(s) and display popup
     */
    private bulkreassignTeam() {
        if (this.teamsCount > 1) {
            if (this.selectedTeamId == undefined) {
                this.displayReassign = true;
                return;
            }

            this.displayReassign = true;
            this.childreassignTeam.loadReassignTeams(this.selectedTeamId);
        }
        else
            this.displayPreCondition = true;
    }

    /**
     * Reassign teams to team(s)
     */
    reassignTeamToNew(isReassigned: boolean = false) {

        if (isReassigned) {
            this.displayReassign = false;
            //this.onTeamLoad();
            this.refreshTeamList();
            return;
        }
        // to reassign team to new Team
        this.childreassignTeam.reassignToNewTeam();

    }

    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Team ID", field: "id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Team Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Users", field: "numberOfUsers", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Portfolios", field: "numberOfPortfolios", cellRenderer: this.portfoliosRenderer, width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Advisors", field: "numberOfAdvisors", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Models", field: "numberOfModels", cellRenderer: this.modelsRenderer, width: 110, cellClass: 'text-center' },
            //<ColDef>{ headerName: "Status", field: "isDeleted", width: 110, cellRenderer: this.statusRenderer, cellClass: 'text-center', filter: 'number' }
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellRenderer: this.statusRenderer, floatCell: true, cellClass: 'text-center', filterParams: { cellRenderer: this.statusFilterRenderer } }
        ];
    }

    /**
        * To render  portfolio column
        */
    portfoliosRenderer(params) {
        let team = params.data;
        if (team != null) {
            if (team.portfolioAccess == 1)
                return '*';

            else
                return team.numberOfPortfolios.toString();
        }
    }

    /**
     * To render model column
     */
    modelsRenderer(params) {
        let team = params.data;
        if (team != null) {
            if (team.modelAccess == 1)
                return '*';
            else
                return team.numberOfModels.toString();
        }
    }
    /*** renders status for row data */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png"/>'; //'<i class="material-icons green size18"></i>'
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png"/>';
        else
            return null;
        return result;
    }

    /**Renders based on status filter  */
    statusFilterRenderer(params) {
        let filterParam = true;
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png"/>';
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png"/>';
        else
            return null;

        if (filterParam && params.value === 0) {
            result += '(no records)';
        }
        return result;
    }


    /**
     * method to fetch only active status data
     */
    getActive() {
        this.selectedRadioVal = 0;
        this.selectedTeamId = undefined;
        //var filterApi = this.gridOptions.api.getFilterApi('isDeleted');
        //filterApi.setType(filterApi.EQUALS);
        //filterApi.setFilter(0);
        //this.gridOptions.api.onFilterChanged();
        this.teams = this.allTeamsData.filter(a => a.status == 1);
        this.gridOptions.api.setRowData(this.teams);
        //this.getTeamCounts(this.gridOptions.rowData.filter(a => a.status == 1), true);
        this.getTeamCounts();
        this.teamsCount = this.teams ? this.teams.length : 0;
    }


    /**
     * method to fetch all data nither active nor inactive
     */
    getAll() {
        this.selectedRadioVal = 1;
        this.selectedTeamId = undefined;
        this.teams = this.allTeamsData;
        this.gridOptions.api.setRowData(this.teams);
        //this.getTeamCounts(this.teams);
        this.getTeamCounts();
        this.teamsCount = this.teams ? this.teams.filter(a => a.status == 1).length : 0;
        // var filterApi = this.gridOptions.api.getFilterApi('status');
        // filterApi.setFilter('');
        // this.gridOptions.api.onFilterChanged();
    }


    /**
     * method to apply active flag to the selected tab
     */
    activeSelectedTab(tabname) {
        this.teamDetails.shwsearchTeams = false;
        this._objtabs.deactivateAllTabsandActiveSelectedTab(tabname);
        this.teamDetails.loadAddMode();
        this.teamDetails.showPanel = "visible";
    }

    /**
     * method to display module updates on console
     */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "" ) {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1) {
                if (targetElement.innerText === "Edit preferences") {
                    this._router.navigate(['/eclipse/admin/preferences/team', this.tabsModel.ids.join()]);
                }
            }
            else {
                if (targetElement.innerText === "View details") {
                    let modelflag = parseInt(targetElement.outerHTML.split('modelflag=')[1].split('portfolioflag=')[0]);
                    let portfolioflag = parseInt(targetElement.outerHTML.split('modelflag=')[1].split('portfolioflag=')[1].split('"')[0]);
                    this.activeSelectedTab("tab2");
                    this.isEdit = false;
                    this.isView = true;
                    this.teamDetails.showSaveBtn = false;
                    this.teamDetails.isView = true;
                    this.teamDetails.loadEditMode(parseInt(this.getStringTeamId(targetElement.outerHTML)), modelflag, portfolioflag);
                }
                if (targetElement.innerText === "Edit") {
                    let modelflag = parseInt(targetElement.outerHTML.split('modelflag=')[1].split('portfolioflag=')[0]);
                    let portfolioflag = parseInt(targetElement.outerHTML.split('modelflag=')[1].split('portfolioflag=')[1].split('"')[0]);
                    this.activeSelectedTab("tab2");
                    this.isView = false;
                    this.isEdit = true;
                    this.teamDetails.showSaveBtn = true;
                    this.teamDetails.isView = false;
                    //this.teamDetails.loadEditMode(Number(this.getStringTeamId(targetElement.outerHTML)));
                    this.teamDetails.loadEditMode(parseInt(this.getStringTeamId(targetElement.outerHTML)), modelflag, portfolioflag);
                }
                if (targetElement.innerText === "Bulk Reassign") {
                    this.bulkreassignTeam();
                }
                if (targetElement.innerText === "Edit preferences") {
                    let teamId = targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].replace(/['"]+/g, '');
                    this._router.navigate(['/eclipse/admin/preferences/team', teamId]);
                }

                if (targetElement.innerText === "Delete") {
                    let deleteval = Number(targetElement.outerHTML.split("<hidden id=")[1].split("value=")[1].split(">")[0].replace(/['"]+/g, '').toString());
                    if (deleteval == 0) {
                        this.displayConfirm = true;
                        this.selectedTeamId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    }
                    else
                        this.displayConfirm = false;
                }
            }
            if (targetElement.innerHTML === "Team Details") {
                this.teamDetails.shwsearchTeams = true;
                this.teamDetails.loadAddMode();
                this.teamDetails.showPanel = "hidden";
            }

            if (targetElement.innerHTML === "All Teams") {
                this.isEdit = false;
                this.isView = false;
            }
        }
    }

    /** split the string which we get from Context menu (targetElement.outerHTML) */
    getStringTeamId(param) {
        return param.split("<hidden id=")[1].split(">")[0].replace(/['"]+/g, '').toString();
    }

    /* method to display context menu on agGrid */
    private getContextMenuItems(params) {
        var isDisable = function () {
            if (params.node.data.isDeleted == 1)
                return true
            else
                return false
        }

        let result = []
        let selectedRows = params.api.getSelectedRows();
        if (selectedRows.length > 1) {
            result.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
        }
        else {
            result.push({ name: '<hidden id =' + params.node.data.id + 'modelflag=' + params.node.data.modelAccess + 'portfolioflag=' + params.node.data.portfolioAccess + '>View details</hidden>' });
            result.push({ name: '<hidden id =' + params.node.data.id + 'modelflag=' + params.node.data.modelAccess + 'portfolioflag=' + params.node.data.portfolioAccess + '>Edit</hidden>' });
            result.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
            if (params.node.data.numberOfUsers > 0)
                result.push({ name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.numberOfUsers + '>Bulk Reassign</hidden>' })
            result.push({
                name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                disabled: isDisable(),
            });
        }
        return result;
    }

    /**
     * method for cancel button click
     */
    onCancel() {
        this.resetForm();
    }

    resetForm() {
    }

    /**
     * used to redirect team detail to edit selected team (when double cliking on a team)
     */
    private onRowDoubleClicked($event) {
        this.isEdit = true;
        this.isView = false;
        this.activeSelectedTab("tab2");
        this.modelAccess = $event.data.modelAccess;
        this.portfolioAccess = $event.data.portfolioAccess;
        this.teamDetails.isView = false;
        this.teamDetails.loadEditMode($event.data.id, $event.data.modelAccess, $event.data.portfolioAccess);
    }

    /**
       * Used to redirect to team details  to View & Edit selected team details 
       */
    private viewandEditTeamDetails(params, $event) {
        if (params == "view") {
            this.isEdit = false;
            this.isView = true;
            this.teamDetails.showSaveBtn = false;
            this.teamDetails.isView = true;
        }
        else if (params == "edit") {
            this.isView = false;
            this.isEdit = true;
            this.teamDetails.showSaveBtn = true;
            this.teamDetails.isView = false;
        }
        this.teamDetails.showPanel = "visible";
        this.teamDetails.shwsearchTeams = false;
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
        this.teamDetails.loadEditMode(this.selectedTeamId, this.modelAccess, this.portfolioAccess);
    }
}