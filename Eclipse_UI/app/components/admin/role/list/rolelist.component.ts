import { Component, ViewChild, HostListener } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IRole } from '../../../../models/role';
import { RoleService } from '../../../../services/role.service';
import { ReassignComponent } from '../role.reassignuser.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, RoleTabNavComponent } from '../shared/role.tabnav.component';

@Component({
    selector: 'eclipse-admin-role-list',
    templateUrl: './app/components/admin/role/list/rolelist.component.html',
    directives: [AgGridNg2, ReassignComponent, AdminLeftNavComponent, Dialog, RoleTabNavComponent],
    providers: [RoleService]
})
export class RoleListComponent extends BaseComponent {
    private gridOptions: GridOptions;
    private roles: IRole[] = [];
    private columnDefs: ColDef[];
    private role: IRole;
    private displayReassign: boolean;
    private displayConfirm: boolean;
    private confirmType: string = 'DELETE';
    private noOfUsers: number;
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    private selectedRoleId: number;
    allRolesData: any[] = [];
    selectedRadioVal: number;

    @ViewChild(ReassignComponent) reassignUsers: ReassignComponent;

    /** Contructor */
    constructor(private _router: Router, private _roleService: RoleService) {
        super(PRIV_ROLES);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{ rowHeight: 30 };
        this.createColumnDefs();
    }

    ngOnInit() {
        this.getRolesSummary();
        this.onRolesLoad();
    }

    /** default method for on load */
    onRolesLoad() {
        this.ResponseToObjects<IRole>(this._roleService.getRoles())
            .subscribe(model => {
                this.allRolesData = model;
                this.roles = this.allRolesData.filter(a => a.status == 1);
                this.hideSpinner();
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** To refres roles grid */
    refreshRolesList() {
        this.selectedRadioVal = 0;
        this.getRolesSummary();
        this.onRolesLoad();
        /*To disbale copy and save as button and also right side menu links */
        this.selectedRoleId = undefined;
        this.tabsModel.id = undefined;
    }

    /** Get roles count */
    private getRolesSummary() {
        this._roleService.getRolesSummary()
            .map((response: Response) => response.json())
            .subscribe(summary => {
                this.menuModel.all = summary.totalRoles;
                this.menuModel.existingOrActive = summary.existingRoles;
                this.menuModel.newOrPending = summary.newRoles;
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** To Create column definitions */
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

    /** To Render image for status column */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == 0 || params.value == null)
            result += '<img src="../app/assets/img/grey-dot.png" />';
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

    /** To filter Active roles */
    filterRolesGrid(all: number) {
        // to hide right side menu options
        this.selectedRadioVal = all;
        this.selectedRoleId = undefined;
        this.roles = (all == 0) ? this.allRolesData.filter(a => a.status == 1) : this.allRolesData;
        this.gridOptions.api.setRowData(this.roles);
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        // console.log('targetElement matches: ', matches);
        let [selectedRoleId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View details") {
            this._router.navigate(['/eclipse/admin/role/view', selectedRoleId]);
        }
        else if (targetElement.innerText === "Edit") {
            this._router.navigate(['/eclipse/admin/role/edit', selectedRoleId]);
        }
        else if (targetElement.innerText === "Reassign Users") {
            this.reassignUser();
        }
        else if (targetElement.innerText === "Delete") {
            this.displayConfirm = (deleteval == 0);
        }
    }

    /** Get contextmenu for selected role right click */
    private getContextMenuItems(params) {
        let permission = Util.getPermission(PRIV_ROLES);
        let contextMenu = [];
        if (permission.canRead)
            contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>View details</hidden>' });
        if (permission.canUpdate) {
            contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit</hidden>' });
            if (params.node.data.numberOfUsers > 0)
                contextMenu.push({ name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.numberOfUsers + '>Reassign Users</hidden>', });
        }
        if (permission.canDelete) {
            contextMenu.push({
                name: '<hidden id =' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                disabled: (params.node.data.isDeleted == 1)
            });
        }
        return contextMenu;
    }

    /** Call on model update */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /**
     * Used to get Selected role id by row clicking
     */
    private onRowClicked($event) {
        this.selectedRoleId = $event.data.id;
        this.tabsModel.id = +$event.data.id;
        this.noOfUsers = +$event.data.numberOfUsers;
        this.tabsModel.count =  this.noOfUsers;
    }

 

    /**
     *  used to redirect role detail to edit selected role (when double cliking on a role)
     */
    private onRowDoubleClicked($event) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/admin/role/view', $event.data.id]);
        else if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/admin/role/edit', $event.data.id]);
    }

    showPopup(event) {
        switch (event) {
            case 'DELETE':
                this.displayConfirm = true;
                break;
            case 'REASSIGN':
                this.reassignUser();
                break;
        }
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
           // this.onRolesLoad();
           this.refreshRolesList();
            return;
        }
        // to reassign role to user
        this.showSpinner();
        this.reassignUsers.reassignRoleToUser();
    }

}
