
import { Component, ViewContainerRef, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Response } from '@angular/http';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../models/user';
import { BaseComponent } from '../../../core/base.component';
import { UserDetailsComponent } from './userdetails.component';
import { Dialog } from 'primeng/components/dialog/dialog';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../shared/leftnavigation/admin.leftnav';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb';

@Component({
    selector: 'eclipse-user',
    templateUrl: './app/components/admin/user/userold.component.html',
    directives: [TabSet, Tab, Dialog, AgGridNg2, UserDetailsComponent, AdminLeftNavComponent, BreadcrumbComponent],
    providers: [UserService]
})

export class UserComponent1 extends BaseComponent {
    private gridOptions: GridOptions;
    private showGrid: boolean;
    private usersData: any[] = [];
    private columnDefs: ColDef[];
    private allTeams: boolean;
    private selectedUserId: number;
    isDeleted: boolean;
    private displayConfirm: boolean;
    private confirmType: string = 'DELETE';
    private menuModel: IAdminLeftMenu;
    //allUsersData: any[] = [];
    errorMessage: string;
    queryStringVal: string;
    isEdit: boolean = false;
    isView: boolean = false;

    @ViewChild(TabSet) _objtabs: TabSet;
    @ViewChild(UserDetailsComponent) userDetails: UserDetailsComponent;

    constructor(private _router: Router, private _userService: UserService, private activateRoute: ActivatedRoute) {
        super();
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.showGrid = true;
        this.menuModel = <IAdminLeftMenu>{};

        this.activateRoute.params
            .map(params => params['queryStr'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
    }

    /**Loads on page initilization */
    ngOnInit() {
        this.onUsersLoad();
        if (this.queryStringVal == "create")
            this._objtabs.navigatetocreatetabfromDashboard();
        if(this.queryStringVal == "add")
         this._objtabs.navigatetocreatetabfromDashboard();
            this.userDetails.loadAddMode();
    }

    /*** default method for on load*/
    onUsersLoad() {
        this.errorMessage = '';
        this._userService.getUsers()
            .map((response: Response) => <IUser[]>response.json())
            .subscribe(users => {
                this.usersData = users;
                this.getUsersSummary();
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /*** To refresh users grid */
    refreshUsersList() {
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab1");
        this.onUsersLoad();
        this.selectedUserId = undefined;
    }


    /**Get users counts */
    private getUsersSummary() {
        this._userService.getUserSummary()
            .map((response: Response) => response.json())
            .subscribe(summary => {
                this.menuModel.all = summary.totalUsers;
                this.menuModel.existingOrActive = summary.existingUsers;
                this.menuModel.newOrPending = summary.newUsers;
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /** * create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "User ID", field: "id", width: 120, cellClass: 'text-center' },
            <ColDef>{ headerName: "User Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Role", field: "role.name", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Team", field: "teams", width: 110, cellClass: 'text-center', valueGetter: this.teamNamesValueGetter },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer, floatCell: true, filterParams: { cellRenderer: this.statusFilterRenderer } }
        ];
    }

    /**To render team names */
    teamNamesValueGetter(params) {
        var teamName = '';
        params.data.teams.forEach(element => {
            teamName += element.name;
            teamName += ',';
        });
        return teamName.substring(0, teamName.length - 1);
    }

    /** renders status for row data */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png"/>';
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

        if (filterParam && params.value === 1) {
            result += '(no records)';
        }
        return result;
    }


    /** * method to display module updates on console*/
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /*** Used to delete a selected role by clicking on Delete Role in right side menu*/
    deleterUser() {
        this._userService.deleteUser(this.selectedUserId).map((response: Response) => response.json())
            .do(data => console.log('User details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.refreshUsersList();
                this.displayConfirm = false;
            })
    }

    /*** method to apply active flag to the selected tab*/
    activeSelectedTab(tabname) {
        this._objtabs.deactivateAllTabsandActiveSelectedTab(tabname);
        this.userDetails.loadAddMode();
    }

    /***  used to redirect user detail to edit selected user (when double cliking on a user)*/
    private onRowDoubleClicked($event, tabname) {
        this.isEdit = true;
        this.isView = false;
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
        this.userDetails.showSaveBtn = true;
        this.userDetails.loadEditMode($event.data.id);
        //this.userDetails.showPanel = "visible";
    }

    /*** Used to get Selected user id by row clicking*/
    private onrowClicked($event) {
        this.isEdit = false;
        this.isView = false;
        this.selectedUserId = $event.data.id;
        this.isDeleted = $event.data.isDeleted;
    }

    /*** Used to redirect to user details to View & Edit selected user details */
    private viewandEditUserDetails(params) {
        if (params == "view") {
            this.isEdit = false;
            this.isView = true;
            this.userDetails.showSaveBtn = false;
        }
        else if (params == "edit") {
            this.isView = false;
            this.isEdit = true;
            this.userDetails.showSaveBtn = true;
        }
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
        this.userDetails.loadEditMode(this.selectedUserId);
        //this.userDetails.showPanel = "visible";
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            if (targetElement.innerText === "View details") {
                this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
                this.isEdit = false;
                this.isView = true;
                this.userDetails.showSaveBtn = false;
                this.userDetails.loadEditMode(Number(this.getStringUserId(targetElement.outerHTML)));
            }
            if (targetElement.innerText === "Edit") {
                this._objtabs.deactivateAllTabsandActiveSelectedTab("tab2");
                this.isEdit = true;
                this.isView = false;
                this.userDetails.showSaveBtn = true;
                this.userDetails.loadEditMode(Number(this.getStringUserId(targetElement.outerHTML)));
            }
            if (targetElement.innerText === "Delete") {
                let deleteval = Number(targetElement.outerHTML.split("<hidden id=")[1].split("value=")[1].split(">")[0].replace(/['"]+/g, '').toString());
                if (deleteval == 0) {
                    this.displayConfirm = true;
                    this.selectedUserId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                }
                else
                    this.displayConfirm = false;
            }
        }
        if (targetElement.innerHTML === "Users Details") {
            if (this.userDetails.isEdit != true)
                this.userDetails.loadAddMode();
            //this.userDetails.showPanel = "hidden";
        }
        if (targetElement.innerHTML === "All Users") {
            this.isEdit = false;
            this.isView = false;
            this.userDetails.loadAddMode();
        }
    }

    /** split the string which we get from Context menu (targetElement.outerHTML) */
    getStringUserId(param) {
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

        var result = [
            {
                name: '<hidden id =' + params.node.data.id + '>View details</hidden>'
            },
            {
                name: '<hidden id =' + params.node.data.id + '>Edit</hidden>'
            },
            // {
            //     name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>'
            // },
            {
                name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                disabled: isDisable(),
            }
        ];
        return result;
    }

}
