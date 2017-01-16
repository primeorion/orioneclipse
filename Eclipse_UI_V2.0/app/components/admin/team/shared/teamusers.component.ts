import { Component, HostListener } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
// import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
// import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../../core/functions';
import { ITeamUser } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'eclipse-admin-teamusers',
    templateUrl: './app/components/admin/team/shared/teamusers.component.html',
    //directives: [AgGridNg2, AutoComplete, Dialog],
    providers: [UserService]
})

export class TeamUsersComponent {
    public gridOptions: GridOptions;
    public columnDefs: ColDef[];
    public teamUsers: ITeamUser[] = <ITeamUser[]>[];
    userSuggestions: ITeamUser[] = [];
    selectedUser: any;
    private selectedUserId: number;
    private displayConfirm: boolean;
    disableButton: boolean = true;
    action: string = VIEWA;
    //subscription: any;

    constructor(private _teamService: TeamService, private _userService: UserService) {
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        //console.log('users constructor action: ', this.action);
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    //     console.log("users destroyed");
    // }

    /** Team Users initialize method for on load */
    initTeamUsers(action: string = VIEWA, teamId: number = 0) {
        this.action = action;
        console.log('initTeamUsers action: ', this.action);
        if (teamId > 0) {
            // reset the column defs based on action (view, add and edit)
            if (this.action == VIEWV) this.createColumnDefs(true);
            this.loadTeamUsers(teamId);            
        }
         
    }

    /** default method for on load */
    loadTeamUsers(teamId: number) {
        Util.responseToObjects<ITeamUser>(this._teamService.getTeamUsers(teamId))
            .subscribe(models => {
                console.log("users: ", models);
                models = models.filter(a => a.isDeleted == 0);
                models.forEach(user => user.name = this.concatenate(user));
                this.teamUsers = models;   
                this.gridOptions.api.sizeColumnsToFit();                                     
            });
    }

    /** concatenate first and last name and assign to name */
    concatenate(user) {
        return user.firstName + " " + user.lastName;
    }

    /** Create column definitions for ag-grid */
    private createColumnDefs(resetGrid: boolean = false) {
        this.columnDefs = [
            <ColDef>{ headerName: "User ID", field: "id", width: 100, cellClass: 'text-center', filter:'number' },
            <ColDef>{ headerName: "User Name", field: "name", width: 150,filter:'text' },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 180, cellClass: 'text-center', cellRenderer: Util.dateRenderer, filter:'text' }
        ];
        if (this.action != VIEWV)
            this.columnDefs.push(<ColDef>{ headerName: "", field: "isDeleted", width: 110, cellRenderer: this.optionRenderer, cellClass: 'text-center', suppressMenu: true });
        console.log('columnDefs: ', this.columnDefs);
        if (resetGrid)
            this.gridOptions.api.setColumnDefs(this.columnDefs);
    }

    /** renders options for row data */
    private optionRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result + '</span>';
    }

    /** method to display module updates on console */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.selectedUserId = +targetElement.id;
            this.displayConfirm = true;
        }
    }

    /** Delete and make dialog to close */
    deleterUsers() {
        this.RemoveRecord(this.selectedUserId)
        this.displayConfirm = false;
    }

    /** Removes the record from grid after confirming */
    private RemoveRecord(userId) {
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == userId), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /** AutoComplete Search by UserName */
    autoUserSearch(event) {
        Util.responseToObjects<ITeamUser>(this._userService.searchUser(event.query))
            .subscribe(models => {
                let teamUserIds = this.teamUsers.map(m => m.id);
                this.userSuggestions = models.filter(m => m.isDeleted == 0 && teamUserIds.indexOf(m.id) < 0);
                // this.teamUsers.forEach(element => {
                //     this.userSuggestions = this.userSuggestions.filter(record => record.id != element.id);
                // });
            });
    }

    /** Enable add button only after selection of User from auto search */
    selectUser(item) {
        // console.log('type of item: ', typeof (item));
        // console.log('handleselectedUser: ', item);
        this.disableButton = (typeof (item) == 'string');
        // console.log('selectedUser: ', this.selectedUser);
    }

    /** To add selected user to grid */
    addUser(item) {
        if (item != undefined) {
            item.createdOn = new Date();
            this.teamUsers.push(item);
            this.gridOptions.api.setRowData(this.teamUsers);
            this.selectedUser = undefined;
            this.disableButton = true;
        }
    }
}



