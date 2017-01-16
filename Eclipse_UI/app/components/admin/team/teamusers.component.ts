import { Component, HostListener} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Router } from '@angular/router';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Response } from '@angular/http';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { TeamService } from '../../../services/team.service';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { ITeamUser} from  '../../../models/team';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'eclipse-admin-teamusers',
    templateUrl: './app/components/admin/team/teamusers.component.html',
    directives: [AgGridNg2, AutoComplete, Button, Dialog],
    providers: [UserService]
})

export class TeamUsersComponent1 extends BaseComponent {
    public gridOptions: GridOptions;
    private showGrid: boolean;
    public teamUsers: ITeamUser[] = [];
    public columnDefs: ColDef[];

    selecteduser: any;
    FilteredUserresults: ITeamUser[] = [];
    private displayConfirm: boolean;
    private selecteduserstoDelete: number;
    private teamId: number;
    btnDisableUser: boolean = true;
    isViewUser: boolean = false;

    constructor(private _teamService: TeamService, private _userService: UserService) {
        super();
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.showGrid = true;
        this.FilteredUserresults = [];
    }

    /** To load team users details while add */
    loadAddMode() {
        this.resetForm();
    }

    /** To load team users details while editing */
    loadEditMode(teamId: number) {
        this.teamId = teamId;
        this.onTeamUsersLoad(teamId);
    }

    /**To reset form */
    resetForm() {
        this.teamUsers = [];
    }

    ngOnInit() {
    }

    /** * default method for on load */
    onTeamUsersLoad(teamId: number) {
        this._teamService.getTeamUsers(teamId)
            .map((response: Response) => <ITeamUser[]>response.json())
            //.do(data => console.log('team users: ', JSON.stringify(data)))
            .subscribe(teamUsers => {
                //console.log('team user data: ', teamUsers)
                this.concatenate(teamUsers);
                this.teamUsers = teamUsers.filter(a => a.isDeleted == 0);
            });
    }

    /*** concatenate first and last name and assign to name */
    concatenate(teamUser) {
        teamUser.forEach(teamUserName => {
            return teamUserName.name = teamUserName.firstName + " " + teamUserName.lastName;
        });
    }

    /** Create column definitions for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "User ID", field: "id", width: 100, cellClass: 'text-center' },
            <ColDef>{ headerName: "User Name", field: "name", width: 150 },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 180, cellClass: 'text-center', cellRenderer: this.dateRenderer },
            <ColDef>{ headerName: "", field: "isDeleted", width: 110, cellRenderer: this.optionRenderer, cellClass: 'text-center' }
        ];
    }

    /** renders options for row data*/
    private optionRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.displayConfirm = true;
            this.selecteduserstoDelete = targetElement.id;
        }
    }

    /*** function to pass record index value to delete and make dialog to close*/
    deleterUsers() {
        this.RemoveRecord(this.selecteduserstoDelete)
        this.displayConfirm = false;
    }

    /*** function removes the record from grid after confirming */
    private RemoveRecord(indexval) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == indexval), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /** method to display module updates on console */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /* AutoComplete Search by UserName */
    autoUserSearch(event) {
        this._userService.searchUser(event.query)
            .map((response: Response) => <ITeamUser[]>response.json())
            .subscribe(usersResult => {
                this.FilteredUserresults = usersResult.filter(a => a.isDeleted == 0);
                this.teamUsers.forEach(element => {
                    this.FilteredUserresults = this.FilteredUserresults.filter(record => record.id != element.id);
                });
            });
    }

    /**To add selected user to grid*/
    addUser(item) {
        if (item != undefined || item != "") {
            item.createdOn = new Date();
            this.teamUsers.push(item);
            this.gridOptions.api.setRowData(this.teamUsers);
            this.selecteduser = undefined;
            this.btnDisableUser = true;
        }
    }


    /**Enable add button only after selection of User from auto search */
    handleselectedUser(useritem) {
        if (useritem.name) {
            this.btnDisableUser = false;
        }
        else
            this.btnDisableUser = true;
    }
}



