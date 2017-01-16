
import { Component, ViewChild, HostListener } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../core/base.component';
import { IRoleVm, IRole } from '../../../models/role';
import { IAdminDashboard } from '../../../models/dashboard';
import { AdminService } from '../../../services/admin.service'; //TODO: remove it
import { RoleService } from '../../../services/role.service';
import { RoleDetailsComponent } from '../role/roledetails.component';
import {IPrivilege} from '../../../models/privileges';
import {IRolePrivilege} from '../../../models/rolePrivileges';
import { ReassignComponent } from '../role/role.reassignuser.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../shared/leftnavigation/admin.leftnav';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';


@Component({
    selector: 'eclipse-admin-role',
    templateUrl: './app/components/admin/role/roleold.component.html',
    directives: [AgGridNg2, TabSet, Tab, RoleDetailsComponent, ReassignComponent, AdminLeftNavComponent, BreadcrumbComponent, Dialog],
    providers: [AdminService, RoleService]
})
export class RoleComponent1 extends BaseComponent {
    private gridOptions: GridOptions;
    private showGrid: boolean;
    private roles: IRole[] = [];
    private columnDefs: ColDef[];
    private privilegesList: any[] = [];
    private role: IRole;
    private allRoles: boolean;
    private showReAssign: boolean = false;
    private displayReassign: boolean;
    private displayConfirm: boolean;
    private confirmType: string = 'DELETE';
    private noOfUsers: number;
    private menuModel: IAdminLeftMenu;
    private selectedRoleId: number;
    isActive: boolean;
    isView: boolean = false;
    isEdit: boolean = false;
    allRolesData: any[] = [];
    errorMessage: string;
    queryStringVal: string;
    selectedRadioVal: number;

    @ViewChild(TabSet) _objtabs: TabSet;
    @ViewChild(RoleDetailsComponent) roleDetails: RoleDetailsComponent;
    @ViewChild(ReassignComponent) reassignUsers: ReassignComponent;

    /**
     * Contructor
     */
    constructor(private _router: Router, private _roleService: RoleService,
        private _adminService: AdminService, private activateRoute: ActivatedRoute) {
        super();
        this.gridOptions = <GridOptions>{
            rowHeight: 30
        };

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

    ngOnInit() {
        this.getRoleCounts();
        this.onRolesLoad();
        if (this.queryStringVal == "create") {
              this.roleDetails.autoRoles = true;
          this._objtabs.navigatetocreatetabfromDashboard();
        }
       
     if(this.queryStringVal == "add")
        {
            this._objtabs.navigatetocreatetabfromDashboard();
            this.roleDetails.loaddAddMode("create");
        }

    }

    
    /**
     * 
     * default method for on load
     */

    onRolesLoad() {
        this.errorMessage = '';
        this.ResponseToObjects<IRole>(this._roleService.getRoles())
            //.map((response: Response) => <IRole[]>response.json())
            //.do(data => console.log('roles All: ' + JSON.stringify(data)))
            .subscribe(model => {
                this.allRolesData = model;
                this.roles = this.allRolesData.filter(a => a.status == 1);
                console.log("Active Role Count", this.roles.length);
                console.log("All Role Count", this.allRolesData.length);
                this.hideSpinner();
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**
     * To refres roles grid
     */
    refreshRolesList() {
        this.selectedRadioVal = 0;
        console.log('From Refresh Roles');
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabAllRoles");
        this.onRolesLoad();
        this.getRoleCounts();
        /*To disbale copy and save as button and also right side menu links */
        this.selectedRoleId = undefined;
    }

    /**Get role details by role id */
    loadRole(roleId: number) {
        this._roleService.getRoleById(roleId)
            .map((response: Response) => response.json())
            .do(data => console.log('Role details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.role = <IRole>model;
                //console.log('Role name:', this.role.roleName);
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**Get roles count */
    private getRoleCounts() {
        //  this.
        //if (showActive) models = models.filter(m => !m.status);
        this._roleService.getRolesSummary()
            .map((response: Response) => response.json())
            .subscribe(summary => {
                this.menuModel.all = summary.totalRoles;
                this.menuModel.existingOrActive = summary.existingRoles;
                this.menuModel.newOrPending = summary.newRoles;
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**To Create column definitions */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Role ID", field: "id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Role Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Role Type", field: "roleType", width: 125 },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "# of Users", field: "numberOfUsers", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellRenderer: this.statusRenderer, cellClass: 'text-center', floatCell: true, filterParams: { cellRenderer: this.statusFilterRenderer } }
        ];
    }

    /**To Render image for status column */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == 0 || params.value == null)
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

        if (filterParam && params.value === 0) {
            result += '(no records)';
        }
        return result;
    }

    dateFormatter(params) {
        return '<span title="the tooltip">{{ params.value | date:\'medium\' }}</span>';
    }

    /**To filter Active roles */
    getActive() {
        // to hide right side menu options
        this.selectedRadioVal = 0;
        this.selectedRoleId = undefined;
        this.roles = this.allRolesData.filter(a => a.status == 1);
        this.gridOptions.api.setRowData(this.roles);
    }

    /**To get all roles */
    getAll() {
        this.selectedRadioVal = 1;
        // to hide right side menu options
        this.selectedRoleId = undefined;
        this.roles = this.allRolesData;
        this.gridOptions.api.setRowData(this.roles);
    }

    /**
     * Hostlistner 
     */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        // getting eName in id some times so , spilit the string 
        if (targetElement.id != "") {
            if (targetElement.innerText === "View details") {
                this._objtabs.deactivateAllTabsandActiveSelectedTab("tabRoleDetails");
                this.roleDetails.hdnSaveRole = false;
                this.roleDetails.isRoleDisabled = true;
                this.roleDetails.loadEditMode(Number(this.getStringRoleId(targetElement.outerHTML)));
                this.isEdit = false;
                this.isView = true;
                this.roleDetails.showDatePicker = true;
            }
            if (targetElement.innerText === "Edit") {
                this._objtabs.deactivateAllTabsandActiveSelectedTab("tabRoleDetails");
                this.roleDetails.hdnSaveRole = true;
                this.roleDetails.btnSaveDisable = false;
                this.roleDetails.isRoleDisabled = false;
                this.roleDetails.showDatePicker = false;
                this.roleDetails.loadEditMode(Number(this.getStringRoleId(targetElement.outerHTML)));
                this.isEdit = true;
                this.isView = false;
            }
            if (targetElement.innerText === "Re-Assign Users") {

                this.reassignUser();
            }
            if (targetElement.innerText === "Delete") {
                let deleteval = Number(targetElement.outerHTML.split("<hidden id=")[1].split("value=")[1].split(">")[0].replace(/['"]+/g, '').toString());
                if (deleteval == 0) {
                    this.displayConfirm = true;
                    this.selectedRoleId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                }
                else
                    this.displayConfirm = false;
            }
        }
        if (targetElement.innerHTML === "Role Details") {
            if (this.roleDetails.isEdit != true) {
                this.roleDetails.loaddAddMode("Show");
            }
            if (this.roleDetails.isAdd != false) {
                this.roleDetails.loaddAddMode("Show");
                this.roleDetails.showPanel = "hidden";
            }
            if (this.isView != true) {
                this.roleDetails.hdnSaveRole = true;
                this.roleDetails.showDatePicker = false;
            }
        }
        if (targetElement.innerHTML === "All Roles") {
            this.isEdit = false;
            this.isView = false;
            this.roleDetails.hdnSaveRole = true;
            this.roleDetails.isRoleDisabled = false;
            this.roleDetails.showDatePicker = false;
            this.roleDetails.loaddAddMode("Show");
        }
    }
    /**
    * split the string which we get from Context menu (targetElement.outerHTML)
    */
    getStringRoleId(param) {
        return param.split("<hidden id=")[1].split(">")[0].replace(/['"]+/g, '').toString();
    }

    /**get contextmenu for selected role right click */
    private getContextMenuItems(params) {
        var isDisable = function () {
            if (params.node.data.isDeleted == 1)
                return true;
            else
                return false;
        }

        let result = []
        result.push({ name: '<hidden id =' + params.node.data.id + '>View details</hidden>' });
        result.push({ name: '<hidden id =' + params.node.data.id + '>Edit</hidden>' });
        //result.push({ name: '<hidden id =' + params.node.data.id + '>Edit preferences</hidden>' });
        if (params.node.data.numberOfUsers > 0)
            result.push({ name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.numberOfUsers + '>Re-Assign Users</hidden>', });
        result.push({
            name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
            disabled: isDisable()
        });
        return result;
    }

    /**Call on model update */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }


    /**
    * method to apply active flag to the selected tab
    */
    activeSelectedTab(tabname) {
        this._objtabs.deactivateAllTabsandActiveSelectedTab(tabname);
        this.roleDetails.createdOn = null;
        this.roleDetails.loaddAddMode("create");
        this.roleDetails.showPanel = "visible";
    }

    /**
     * Used to get Selected role id by row clicking
     */
    private onrowClicked($event) {
        this.isEdit = false;
        this.isView = false;
        this.selectedRoleId = $event.data.id;
        this.isActive = $event.data.status;
        this.noOfUsers = $event.data.numberOfUsers;
        //console.log('Selected Role: ', $event);
    }

    /**
     * Used to delete a selected role by clicking on Delete Role in right side menu
     */
    deleterRole() {
        console.log('from delete role confirm');
        this._roleService.deleteRole(this.selectedRoleId).map((response: Response) => response.json())
            .do(data => console.log('Role details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.refreshRolesList();
                this.displayConfirm = false;
            })
    }

    /**
     *  used to redirect role detail to edit selected role (when double cliking on a role)
     */
    private onRowDoubleClicked($event) {
        this.isEdit = true;
        this.isView = false;
        /* flag used to navigate to role details page*/
        this.roleDetails.isEdit = false;
        this.roleDetails.autoRoles = false;
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabRoleDetails");
        this.roleDetails.loadEditMode($event.data.id);
    }

    /**
     * Load roles to reassign role to user(s) and display popup
     */
    private reassignUser() {
        if (this.selectedRoleId == undefined) {
            this.displayReassign = true;
            return;
        }
        this.displayReassign = true;
        this.reassignUsers.loadReassignUser(this.selectedRoleId);
    }

    /**
     * Reassign role to user(s)
     */
    reassignRoleToUser(isReassigned: boolean = false) {
        console.log('isReassigned: ' + isReassigned);
        // to hide popup once reassigned
        if (isReassigned) {
            this.displayReassign = false;
            this.onRolesLoad();
            return;
        }
        // to reassign role to user
        this.showSpinner();
        this.reassignUsers.reassignRoleToUser();
    }

    /**
     * Used to redirect to role details to copy selected role and create new role
     */
    showCopyMode() {
        this.roleDetails.showPanel = "visible";
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabRoleDetails");
        this.roleDetails.loadCopyMode(this.selectedRoleId);
    }

    /**
     * Used to redirect to role details page to View & Edit selected role details 
     */
    private viewandEditRoleDetails(params) {
        if (params == "view") {
            this.isEdit = false;
            this.isView = true;
            this.roleDetails.hdnSaveRole = false;
            this.roleDetails.isRoleDisabled = true;
            this.roleDetails.showDatePicker = true;
        }
        else if (params == "edit") {
            this.isView = false;
            this.isEdit = true;
            this.roleDetails.hdnSaveRole = true;
            this.roleDetails.isRoleDisabled = false;
            this.roleDetails.showDatePicker = false;
        }
        this._objtabs.deactivateAllTabsandActiveSelectedTab("tabRoleDetails");
        this.roleDetails.loadEditMode(this.selectedRoleId);
    }
}
