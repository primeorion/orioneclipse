import { Component, ViewChild, Output, EventEmitter} from '@angular/core';
import { TabSet } from '../../../shared/tabs/tabset';
import { Tab } from '../../../shared/tabs/tab';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Calendar } from 'primeng/components/calendar/calendar';
import { BaseComponent } from '../../../core/base.component';
import { RoleService } from '../../../services/role.service';
import { Response } from '@angular/http';
import { IRole } from '../../../models/role';
import {MultiSelect} from 'primeng/components/multiselect/multiselect';
import { TeamService } from '../../../services/team.service';
import { ITeam } from '../../../models/team';
import { UserService } from '../../../services/user.service';
import { IUser, ICustomUser, IOrionUser } from '../../../models/user';


@Component({
    selector: 'eclipse-userdetails',
    templateUrl: './app/components/admin/user/userdetails.component.html',
    directives: [TabSet, Tab, AutoComplete, MultiSelect, Calendar],
    providers: [RoleService, TeamService]
})

export class UserDetailsComponent extends BaseComponent {
    rolesData: IRole[] = [];
    teamsdata: any[] = [];
    teams: any[] = [];
    isAdd: boolean = true;
    isEdit: boolean = false;
    selectedTeams: any[] = [];
    startDate: string;
    expireDate: string;
    autocompleteResults: any[] = [];
    selectedUser: IOrionUser = <IOrionUser>{};

    userDetails = <ICustomUser>{};
    user: IUser = <IUser>{};
    errorMessage: string;
    isActiveFlag: boolean;
    userName: string;
    public showSaveBtn: boolean = true;
    selectedRoleId: any;
    showOrionuserBtn: boolean = true;
    disableSaveBtn: boolean = true;
    existingUsersData: IUser[] = [];
    showerrorMsg: boolean = false;
    shwstrtdatemsg: boolean = false;
    shwexpdatecomprmsg: boolean = false;
    showroleerrorMsg: boolean = false;
    shwexpdatemsg: boolean = false;
    btnValue: string;


    @Output() userSaved = new EventEmitter();
    @ViewChild(TabSet) _objtabs: TabSet;
    constructor(private _roleService: RoleService, private _teamService: TeamService, private _userService: UserService) {
        super();
    }

    ngOnInit() {
        this.selectedRoleId = 0;
        this.loadRoles();
        this.loadTeams();
        this.existingusers();
        this.showerrorMsg = false;
        this.shwstrtdatemsg = false;
    }


    //AutoComplete Search by UserName
    autoUserSearch(event) {
        this._userService.getOrionUsers(event.query)
            .map((response: Response) => <IOrionUser[]>response.json())
            .do(data => console.log('Orionusers details: ', JSON.stringify(data)))
            .subscribe(users => {
                this.autocompleteResults = users;
                //console.log('auto completeorions users :', this.autocompleteResults);
                this.existingUsersData.forEach(element => {
                    this.autocompleteResults = this.autocompleteResults.filter(record => record.userId != element.id);
                });
            });
    }

    /**To get all users */
    existingusers() {
        this._userService.getUsers()
            .map((response: Response) => <IUser[]>response.json())
            .subscribe(users => {
                this.existingUsersData = users;
                //console.log('exsiting users :', this.exsitingUsersData)
            });
    }

    /**
     * To get selected user
     */
    selectedUserSearch(params: any) {
        this.selectedUser = params;
        this.showOrionuserBtn = false;
        this.disableSaveBtn = false;
    }

    /*** Add User */
    addUser(item) {
        if (item == null) return;
        this.selectedUser = item;
    }

    /**Get roles to bind drop down */
    private loadRoles() {
        this.ResponseToObjects<IRole>(this._roleService.getRoles())
            .subscribe(model => {

                this.rolesData = model.filter(rec => !rec.isDeleted && rec.status == 1);
                //console.log(JSON.stringify(this.rolesData));
                this.rolesData.sort((r1, r2) => {
                    if (r1.name > r2.name) return 1;
                    if (r1.name < r2.name) return -1;
                    return 0
                })
            });
    }

    /**
     * Get teams to bind drop down 
     */
    loadTeams() {
        this.teams = [];
        this.ResponseToObjects<ITeam>(this._teamService.getTeamData())
            .subscribe(model => {
                this.teamsdata = model.filter(rec => !rec.isDeleted);
                this.teamsdata.forEach(element => {
                    this.teams.push({ label: element.name, value: element.id });
                    this.teams.sort((t1, t2) => {
                        if (t1.label > t2.label) return 1;
                        if (t1.label < t2.label) return -1;
                        return 0
                    })
                });
                console.log('same type team:', this.teams.length);
            });
    }

    /**
     * To laod user details in add mode
     */
    loadAddMode() {
        this.btnValue = "Add";
        this.isAdd = true;
        this.isEdit = false;
        this.showSaveBtn = true;
        this.disableSaveBtn = true;
        this.showOrionuserBtn = true;
        this.shwexpdatecomprmsg = false;
        this.showroleerrorMsg = false;
        this.shwexpdatemsg = false;
        this.resetForm();
        // this.loadRoles();
        // this.loadTeams();
    }

    /**
   * To laod user details in edit mode
   */
    loadEditMode(userId: number) {
        this.btnValue = "Save";
        this.isAdd = false;
        this.isEdit = true;
        this.disableSaveBtn = false;
        this.showerrorMsg = false;
        this.shwstrtdatemsg = false;
        this.shwexpdatecomprmsg = false;
        this.selectedTeams = [];
        this.getUserDetailsById(userId);
    }

    /**
     * To get selected user details
     */
    getUserDetailsById(userId: number) {
        this._userService.getUserById(userId)
            .map((response: Response) => response.json())
            .subscribe(model => {
                this.user = <IUser>model;
                //console.log('User Details:', model);
                console.log('User Details -> Teams:', JSON.stringify(model.teams));
                this.startDate = this.formatDate(model.startDate);
                this.expireDate = this.formatDate(model.expireDate);
                this.userDetails.id = this.user.id;
                this.userDetails.name = this.user.name;
                if (this.user.role != null)
                    this.userDetails.roleId = this.user.role.id;
                this.userDetails.teamIds = this.user.teams;
                this.userDetails.status = this.user.status;
                this.userDetails.userLoginId = this.user.userLoginId;

                if (this.user.startDate != null)
                    this.userDetails.startDate = this.user.startDate.toString();
                if (this.user.expireDate != null)
                    this.userDetails.expireDate = this.user.expireDate.toString();
                if (model.role != null)
                    this.selectedRoleId = model.role.id;
                else { this.selectedRoleId = 0 }
                let role = this.rolesData.find(m => m.id == this.selectedRoleId);
                if (role == undefined)
                    this.selectedRoleId = 0;
                else
                    this.selectedRoleId = model.role.id;
                this.userName = model.name;
                console.log("model teams:", model.teams);
                this.selectedTeams = [];
                model.teams.forEach(element => {
                    this.selectedTeams.push(parseInt(element.id));
                });
                console.log("selected teams:", this.selectedTeams);
                this.isActiveFlag = (model.status == 1);
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**
     * Navigate to All Users by clickng on cancel
     */
    onCancel() {
        this.resetForm();
        this.userSaved.emit("User Cancel");

    }

    /**
     * Teams dropdown selection change
     */
    teamsChange(selectedTeams: any) {
        if (this.selectedTeams.length > 0)
            this.showerrorMsg = false;
        else
            this.showerrorMsg = true;
    }

    /**
     * StartDate calender select event
     */
    startDateSelect(startDate: any) {
        if (this.startDate == null)
            this.shwstrtdatemsg = true;
        else
            this.shwstrtdatemsg = false;
    }

    /**Expirary date change event */
    expiryDateSelect(expiryDate) {
        if (expiryDate != "")
            this.shwexpdatemsg = false;
        else
            this.shwexpdatemsg = true;
        if (new Date(expiryDate) > new Date(this.startDate)) {
            this.shwexpdatecomprmsg = false;
        } else { this.shwexpdatecomprmsg = true; }
    }

    /**Role change event */
    roleChange(selectedVal) {
        if (selectedVal != 0) this.showroleerrorMsg = false; else this.showroleerrorMsg = true;
    }

    /**
     * Custom validation for team multi select and start date
     */
    customValidation() {
        if ((this.userName != undefined || this.userName == '') && this.selectedTeams.length == 0 || this.startDate == null || this.expireDate == null || this.selectedRoleId == 0 || this.selectedRoleId == undefined) {
            {
                if (this.selectedTeams.length == 0)
                    this.showerrorMsg = true;
                if (this.startDate == null)
                    this.shwstrtdatemsg = true;
                if (this.expireDate == null)
                    this.shwexpdatemsg = true;
                if (this.selectedRoleId == 0 || this.selectedRoleId == undefined)
                    this.showroleerrorMsg = true;
            }
        }
        else {
            this.showerrorMsg = false;
            this.shwstrtdatemsg = false;
            this.showroleerrorMsg = false;
            this.shwexpdatemsg = false;
        }

    }
    /**
     * To save User Details
     */
    onSave() {
        this.customValidation();
        if (this.showerrorMsg == true || this.shwstrtdatemsg == true || this.showroleerrorMsg == true || this.shwexpdatemsg == true) return;
        if (new Date(this.expireDate) > new Date(this.startDate)) {
            if (this.isAdd) {
                if (this.selectedUser == null) return;
                this._userService.createUser({ orionUserId: this.selectedUser.userId, userLoginId: this.selectedUser.loginUserId, name: this.selectedUser.entityName, roleId: parseInt(this.selectedRoleId), teamIds: this.selectedTeams, status: 1, startDate: this.startDate, expireDate: this.expireDate }).subscribe(model => {
                    //console.log('from create user response: ', model);
                    this.resetForm();
                    this.existingusers();
                    this.userSaved.emit("User Saved");
                });
            }
            else {
                this.userDetails.roleId = parseInt(this.selectedRoleId);
                if (this.selectedTeams)
                    this.userDetails.teamIds = this.selectedTeams;
                if (this.startDate != null)
                    this.userDetails.startDate = this.startDate;
                if (this.expireDate != null) {
                    //userById.expireDate.toString().substring(0, 10);
                    this.userDetails.expireDate = this.expireDate;
                }
                // console.log("save suer details", this.userDetails);
                console.log("save suer details", JSON.stringify(this.userDetails));
                this._userService.updateUser(this.userDetails.id, { name: this.userDetails.name, userLoginId: this.userDetails.userLoginId, roleId: this.userDetails.roleId, teamIds: this.userDetails.teamIds, status: this.userDetails.status, startDate: this.userDetails.startDate, expireDate: this.userDetails.expireDate }).subscribe(model => {
                    console.log("save resopnse", this.userDetails);
                    this.resetForm();
                    this.existingusers();
                    this.userSaved.emit("User Saved");
                });
            }
        }
        else { this.shwexpdatecomprmsg = true }
    }

    /**To reset form */
    resetForm() {
        this.btnValue = "Add";
        this.userName = '';
        this.selectedRoleId = 0;
        this.selectedTeams = [];
        this.startDate = null;
        this.expireDate = null;
        this.isAdd = true;
        this.selectedUser = null;
        this.showroleerrorMsg = false;
        this.showerrorMsg = false;
        this.shwstrtdatemsg = false;
    }

}




