import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IRole, ITeam } from '../../../../models/models';
import { TeamService } from '../../../../services/team.service';
import { RoleService } from '../../../../services/role.service';
import { UserService } from '../../../../services/user.service';
import { IUser, ICustomUser, IOrionUser } from '../../../../models/user';
import { ITabNav, UserTabNavComponent } from '../shared/user.tabnav.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';

@Component({
    selector: 'eclipse-user-detail',
    templateUrl: './app/components/admin/user/detail/userdetail.component.html',
    providers: [UserService, RoleService, TeamService]
})

export class UserDetailComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    rolesData: IRole[] = [];
    teams: any[] = [];
    selectedDate: string;
    startDate: string;
    expireDate: string;
    userId: number;
    orionUser: any;
    userSuggestions: any[] = [];
    existingUsers: IUser[] = [];
    editUser: ICustomUser = <ICustomUser>{};
    showOrionUserBtn: boolean;
    disableSaveBtn: boolean = true;
    errorMsgTeam: boolean = false;
    errorMsgStartDate: boolean = false;
    errorCompareExpireDate: boolean = false;
    errorMsgRole: boolean = false;
    errorExpireDate: boolean = false;
    editTeamIds: any[] = [];

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _roleService: RoleService,
        private _teamService: TeamService, private _userService: UserService) {
        super(PRIV_USERS);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.activateRoute.params.subscribe(params => {

            if (params['id'] != undefined)
                this.userId = +params['id']; // (+) converts string 'id' to a number
        });
        if (this.userId > 0) {
            this.disableSaveBtn = false;
            this.tabsModel.id = this.userId;
            this.tabsModel.action = 'E';
            this.editUser.id = this.userId;
        } else {
            this.showOrionUserBtn = true;
            this.tabsModel.action = 'A';
            this.editUser.id = undefined;
            this.editUser.roleId = 0; // to show 'Select Role' option
        }

        this.selectedDate = (new Date()).toLocaleDateString();
        this.startDate = new Date((new Date().setDate(new Date().getDate()))).toLocaleDateString();
    }

    ngOnInit() {
        this.onLoadUserData();
        this.getUsersSummary();
    }

    /** Update team users, portfolios, advisors and models */
    onLoadUserData() {
        let initializeData = [];
        initializeData.push(this.ResponseToObjects<ITeam>(this._teamService.getTeamData()));
        initializeData.push(this.ResponseToObjects<IUser>(this._userService.getUsers()));
        initializeData.push(this.ResponseToObjects<IRole>(this._roleService.getRoles()));
        // execute all requests one by one
        Observable.forkJoin(initializeData)
            .subscribe((data: any[]) => {
                /** Get teams to bind drop down */
                let teamsdata = data[0].filter(rec => !rec.isDeleted) // && rec.status == 1);
                let teamsList = [];
                teamsdata.forEach(element => {
                    teamsList.push({ label: element.name, value: element.id });
                });
                this.teams = Util.sortBy(teamsList, 'label');
                this.existingUsers = data[1];
                /** Get roles to bind drop down */
                this.rolesData = data[2].filter(rec => !rec.isDeleted && rec.status == 1);
                this.rolesData = Util.sortBy(this.rolesData);
                if (this.userId > 0) {
                    this.getUserDetailsById(this.userId);
                }
            });
    }

    /**
     * To get selected user details
     */
    getUserDetailsById(userId: number) {
        this._userService.getUserById(userId)
            .map((response: Response) => <IUser>response.json())
            .subscribe(model => {
                model.teams.forEach(element => {
                    this.editTeamIds.push(element.id);
                });
                this.editUser.teamIds = this.editTeamIds;
                this.startDate = this.formatDate(model.startDate);
                this.expireDate = this.formatDate(model.expireDate);
                this.editUser.id = model.id;
                this.orionUser = this.editUser.name = model.name;
                this.editUser.userLoginId = model.userLoginId;
                // this.orionUser.userLoginId = model.userLoginId;
                if (model.role != null)
                    this.editUser.roleId = model.role.id;
                else
                    this.editUser.roleId = 0;
                this.editUser.status = model.status;
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search by UserName */
    loadUserSuggestions(event) {
        this.ResponseToObjects<IOrionUser>(this._userService.getOrionUsers(event.query))
            .subscribe(users => {
                this.userSuggestions = users;
                this.existingUsers.forEach(element => {
                    this.userSuggestions = this.userSuggestions.filter(record => record.userId != element.orionUserId);
                });
            });
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

    /**
     * To get selected user
     */
    onUserSelect(params: any) {
        this.editUser.name = this.orionUser.entityName;
        this.showOrionUserBtn = false;
        this.disableSaveBtn = false;
    }

    /**
     * Teams dropdown selection change
     */
    teamsChange() {
        this.errorMsgTeam = this.editTeamIds.length <= 0;
    }

    /**
     * StartDate calender select event
     */
    startDateSelect(startDate: any) {
        this.errorMsgStartDate = (this.startDate == null);
    }

    /**Expirary date change event */
    expiryDateSelect(expiryDate) {
        this.errorExpireDate = (expiryDate == "");
        this.errorCompareExpireDate = (new Date(expiryDate) <= new Date(this.startDate));
    }

    /**Role change event */
    roleChange(selectedVal) {
        this.errorMsgRole = (selectedVal <= 0);
    }

    /**
     * Custom validation for team multi select and start date
     */
    customValidation() {
        if ((this.orionUser != undefined || this.orionUser == '') && (this.editTeamIds == undefined || this.editTeamIds.length <= 0) || this.startDate == null || this.expireDate == null || this.editUser.roleId == 0 || this.editUser.roleId == undefined) {
            if (this.editTeamIds == undefined || this.editTeamIds.length <= 0)
                this.errorMsgTeam = true;
            if (this.startDate == null)
                this.errorMsgStartDate = true;
            if (this.expireDate == null)
                this.errorExpireDate = true;
            if (this.editUser.roleId == 0 || this.editUser.roleId == undefined)
                this.errorMsgRole = true;
        }
        else {
            this.errorMsgTeam = false;
            this.errorMsgStartDate = false;
            this.errorMsgRole = false;
            //this.errorExpireDate = false;
        }
    }

    /**
     * To save User Details
     */
    onSave() {
        this.customValidation();
        if (this.errorMsgTeam == true || this.errorMsgRole == true) return; //|| this.errorExpireDate == true || this.errorMsgStartDate == true 
        if (new Date(this.expireDate) > new Date(this.startDate)) {
            if (this.userId == undefined) {
                if (this.orionUser == null) return;
                this.editUser.orionUserId = this.orionUser.userId;
                this.editUser.userLoginId = this.orionUser.loginUserId;
                this.editUser.roleId = this.editUser.roleId;
                this.editUser.startDate = this.startDate;
                this.editUser.expireDate = this.expireDate;
                this.editUser.teamIds = this.editTeamIds;
                this.editUser.status = 1;
                console.log('add User: ', JSON.stringify(this.editUser));
                this._userService.createUser(this.editUser) // { id: this.orionUser.userId, name: this.orionUser.entityName, roleId: this.editUser.roleId, teamIds: this.editUser.teamIds, status: 1, startDate: this.startDate, expireDate: this.expireDate })
                    .subscribe(model => {
                        this._router.navigate(['/eclipse/admin/user/list']);
                    });
            }
            else {
                if (this.startDate != null)
                    this.editUser.startDate = this.startDate;
                if (this.expireDate != null) {
                    this.editUser.expireDate = this.expireDate;
                }
                console.log('edit User: ', JSON.stringify(this.editUser));
                this._userService.updateUser(this.userId, this.editUser)
                    .subscribe(model => {
                        console.log("save resopnse", model);
                        this._router.navigate(['/eclipse/admin/user/list']);
                    });
            }
        }
        else { this.errorCompareExpireDate = true }
        return false;
    }

}
