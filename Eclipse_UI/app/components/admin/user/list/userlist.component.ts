
import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IUser } from '../../../../models/user';
import { UserService } from '../../../../services/user.service';
import { ITabNav, UserTabNavComponent } from '../shared/user.tabnav.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';

@Component({
    selector: 'eclipse-user',
    templateUrl: './app/components/admin/user/list/userlist.component.html',
    directives: [Dialog, AgGridNg2, AdminLeftNavComponent, UserTabNavComponent],
    providers: [UserService]
})

export class UserListComponent extends BaseComponent {
    private gridOptions: GridOptions;
    private usersData: any[] = [];
    private columnDefs: ColDef[];
    private selectedUserId: number;
    private displayConfirm: boolean;
    private confirmType: string = 'DELETE';
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    errorMessage: string;

    constructor(private _router: Router, private _userService: UserService, private activateRoute: ActivatedRoute) {
        super(PRIV_USERS);
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
    }

    /** Loads on page initilization */
    ngOnInit() {
        this.onUsersLoad();
        this.getUsersSummary();
    }

    /** Default method for on load*/
    onUsersLoad() {
        this.errorMessage = '';
        this.ResponseToObjects<IUser>(this._userService.getUsers())
            .subscribe(users => {
                this.usersData = users;
            });
    }

    /** To refresh users grid */
    refreshUsersList() {
        this.onUsersLoad();
        this.selectedUserId = undefined;
        this.tabsModel.id = undefined;
    }

    /** Get users summary */
    private getUsersSummary() {
        this.responseToObject<any>(this._userService.getUserSummary())
            .subscribe(summary => {
                this.menuModel.all = summary.totalUsers;
                this.menuModel.existingOrActive = summary.existingUsers;
                this.menuModel.newOrPending = summary.newUsers;
            });
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "User ID", field: "id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "User Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Role", field: "role.name", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Team", field: "teams", width: 110, cellClass: 'text-center', valueGetter: this.teamNamesValueGetter },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer, floatCell: true, filterParams: { cellRenderer: this.statusFilterRenderer } }
        ];
    }

    /** To render team names */
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
        return '<span><img src="../app/assets/img/' + (params.value == 1 ? 'green' : 'grey') + '-dot.png"/></span>';
    }

    /** Renders based on status filter  */
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
        return result + '</span>';
    }

    /** * method to display module updates on console*/
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /*** Used to delete a selected role by clicking on Delete Role in right side menu*/
    deleterUser() {
        this.ResponseToObjects<IUser>(this._userService.deleteUser(this.selectedUserId))
            .do(data => console.log('User details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.refreshUsersList();
                this.displayConfirm = false;
            })
    }

    /***  used to redirect user detail to edit selected user (when double cliking on a user) */
    private onRowDoubleClicked($event, tabname) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/admin/user/view', $event.data.id]);
        else if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/admin/user/edit', $event.data.id]);
    }

    /*** Used to get Selected user id by row clicking*/
    private onrowClicked($event) {
        this.selectedUserId = $event.data.id;
        this.tabsModel.id = +$event.data.id;
        // console.log('onrowClicked()  $event.data.id:', $event.data.id);
        // this.tabsModel.isDeleted = $event.data.isDeleted;
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        // console.log('targetElement: ', targetElement.outerHTML);
        let pattern = /[0-9]+/g; //<hidden id="(?<id>[0-9]+)">(.+)';
        if (!targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        // console.log('targetElement matches: ', matches);
        let [userId = 0, deleteval = 0] = matches;
        if (targetElement.id != "") {
            if (targetElement.innerText === "View details") {
                this._router.navigate(['/eclipse/admin/user/view', userId]);
            }
            if (targetElement.innerText === "Edit") {
                this._router.navigate(['/eclipse/admin/user/edit', userId]);
            }
            if (targetElement.innerText === "Delete") {
                deleteval = 0; // Number(targetElement.outerHTML.split("<hidden id=")[1].split("value=")[1].split(">")[0].replace(/['"]+/g, '').toString());
                if (deleteval == 0) {
                    this.displayConfirm = true;
                    this.selectedUserId = userId; // Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                }
                else
                    this.displayConfirm = false;
            }
        }
    }

    /* method to display context menu on agGrid */
    private getContextMenuItems(params) {
        let isDisable = function () {
            return (params.node.data.isDeleted == 1);
        }
        /** getting user permissions from session */
        let permission = Util.getPermission(PRIV_USERS);
        let result = [];
        if (permission.canRead)
            result.push({ name: '<hidden id=' + params.node.data.id + '>View details</hidden>' });
        if (permission.canUpdate)
            result.push({ name: '<hidden id=' + params.node.data.id + '>Edit</hidden>' });
        // if (permission.canUpdate)
        //     result.push({ name: '<hidden id=' + params.node.data.id + '>Edit preferences</hidden>' });
        if (permission.canDelete)
            result.push({
                name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                disabled: isDisable(),
            });
        return result;
    }

    /** show delete confirm popup from tabnav component */
    showDeleteConfirm() {
        this.confirmType = 'DELETE';
        this.displayConfirm = true;
        // console.log('showDeleteConfirm: ', this.displayConfirm);
    }

}
