import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Http, Response, Headers } from '@angular/http';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { ITabNav } from '../../shared/strategist.tabnav.component';
import { TokenHelperService } from '../../../../core/tokenhelper.service';
import { IStrategist } from '../../../../models/strategist';
import { UserService } from '../../../../services/user.service';
import { StrategistService } from '../../../../services/strategist.service';
import { IUser } from '../../../../models/user';
import { IUserRole } from '../../../../models/user.role';
import { ICommunityUser } from '../../../../models/community.user';
import { IFirm } from '../../../../models/firm';
@Component({
    selector: 'community-user-detail',
    templateUrl: './app/components/administrator/user/detail/user.detail.component.html'


})
export class UserDetailComponent extends BaseComponent {

    private user: IUser = <IUser>{};
    private users: IUser[];
    private userRoles: IUserRole[] = [];
    private autoCompleteSelectedUser: any;
    private filteredUserResult: IUser[];
    private autoCompleteSelectedStrategist: any;
    private filteredStrategistResult: IStrategist[];
    private submitUserDetail: boolean = false;
    private isValidStrategistId: boolean = true;
    private isValidEclipseDbId: boolean = true;
    private showUserSaveError: boolean = false;
    private userSaveError: string;
    private tabsModel: ITabNav = <ITabNav>{};
    private originalStrategistId: number;
    private originalRoleId: number;
    private IsSuperAdminSelected: boolean = false;
    private firms: IFirm[] = [];
    private loggedInUser: IUser;
    @Input() userId: number;
    @Input() isViewMode: boolean;

    constructor(private _userService: UserService, private _strategistService: StrategistService,
        private _router: Router, private activateRoute: ActivatedRoute) {
        super();

        this.activateRoute.params.subscribe(params => {

            if (params['id'] != undefined)
                this.userId = +params['id'];
            this.tabsModel.id = this.userId;
        });

        if (this._router.url.indexOf('view') > -1) {
            this.isViewMode = true;
            this.tabsModel.action = 'V'
        }

        if (this._router.url.indexOf('edit') > -1 || this._router.url.indexOf('add') > -1) {
            this.isViewMode = false;
            this.tabsModel.action = 'E';
        }

        if (this._router.url.indexOf('add') > -1) {
            this.isViewMode = false;
            this.tabsModel.action = 'A';
        }
    }

    ngOnInit() {
        let tokenhelper = new TokenHelperService();
        this.loggedInUser = <IUser>tokenhelper.getUser();
        this.getUserRoleTypes();

        if (this.userId != undefined) {
            this.getEclpiseDatabases();
            this.getUserDetail();

        }
    }

    getUserDetail() {
        this.responseToObject<IUser>(this._userService.getUserDetail(this.userId))
            .subscribe(model => {

                this.user = model[0];
                this.originalStrategistId = this.user.strategistId;
                this.originalRoleId = this.user.roleId;
                this.autoCompleteSelectedStrategist = this.user.strategistName;
                this.user.eclipseDatabaseId == null ? this.user.eclipseDatabaseId = 0 : this.user.eclipseDatabaseId;
                if (this.tabsModel.action != "A")
                    this.user.roleId == RoleType.SuperAdmin ? this.IsSuperAdminSelected = true : this.IsSuperAdminSelected = false;
            });
    }


    autoUserSearch(event) {
        this._userService.getOrionUsers(event.query).map((response: Response) => <IUser[]>response.json())
            .subscribe(userResult => {
                this.filteredUserResult = userResult;
            });
    }

    handleSelectedUser(user) {

        if (user.name) {
            this.user.userId = user.userId;
            this.user.name = user.name;
            this.user.loginUserName = user.entityName;
            this.user.loginUserId = user.loginUserId;

        }
    }

    autoStrategistSearch(event) {
        this._strategistService.searchStrategist(event.query).map((response: Response) => <IStrategist[]>response.json())
            .subscribe(strategistResult => {
                this.filteredStrategistResult = strategistResult;
            });
    }

    handleSelectedStrategist(strategist) {

        if (strategist.id) {
            this.user.strategistId = strategist.id;
        } else {
            this.user.strategistId = 0;
        }
    }

    private getUserRoleTypes() {

        this.ResponseToObjects<IUserRole>(this._strategistService.getUserRoles())
            .subscribe(model => {
                if (this.loggedInUser.roleId != RoleType.SuperAdmin) {
                    this.userRoles = model.filter(record => record.roleId != RoleType.SuperAdmin);
                }
                else
                    this.userRoles = model;
            });
    }
    private onRoleChange(role) {

        if (role == RoleType.SuperAdmin) {
            this.IsSuperAdminSelected = true;
            //this.user.eclipseDbId = -1;
            //get Eclipse DatabaseId's using api by loggedin user
            this.getEclpiseDatabases();
        }
        else {
            this.IsSuperAdminSelected = false;
            this.firms = [];
            this.autoCompleteSelectedStrategist = "";
        }
    }

    private getEclpiseDatabases() {
        this.ResponseToObjects<IFirm>(this._strategistService.getFirmsByUser())
            .subscribe(model => {
                var data = model;
                // Add default value/ Global value
                //  this.firms.push({ id : 0 , database : "(None)"})
                data.unshift({ id: 0, database: "(None)" });
                this.firms = data;
            });
    }
    private saveUserDetail(form) {

        this.submitUserDetail = true;
        this.isValidSelect(this.user.roleId);

        this.user.roleId = + this.user.roleId;

        if (form.valid && this.isValidStrategistId && this.isValidEclipseDbId) {
            if (this.user.id == undefined) {

                this.user.orionConnectExternalId = + this.user.userId;
                if (this.user.roleId == RoleType.SuperAdmin) {
                    this.user.id = this.user.userId;
                    this.user.strategistId = 0;
                    this.user.strategistName = "";
                    this.user.eclipseDatabaseId == 0 ? this.user.eclipseDatabaseId = null : this.user.eclipseDatabaseId;//(None/Global)
                    this.user.eclipseDatabaseId = +this.user.eclipseDatabaseId;
                    this.addUserToCommunity();
                }
                else {
                    //this.user.eclipseDbId = 0;                                  
                    this.addUserToStrategist();
                }

            } else {

                this.updateUser();
                // if (this.originalStrategistId != undefined && this.user.strategistId != this.originalStrategistId) {
                //     if (this.originalRoleId != undefined && this.originalRoleId != this.user.roleId)
                //          this.updateUser();
                //     else
                //        this.removeUserFromStrategist();
                // }
                // else {
                //     this.updateUser();
                // }
            }
        }
    }

    private addUserToStrategist() {

        this.users = [];
        this.users.push(this.user);

        this.responseToObject<IStrategist>(this._strategistService.addUserToStrategist(this.user.strategistId, this.users))
            .subscribe(model => {

                this._router.navigate(['/community/administrator/user/list']);
            },
            err => {

                var error = JSON.parse(err._body)
                this.userSaveError = error.message;
                this.showUserSaveError = true;
            });
    }
    private addUserToCommunity() {

        this.responseToObject<IUser>(this._userService.addUserToCommunity(this.user))
            .subscribe(model => {
                this._router.navigate(['/community/administrator/user/list']);
            },
            err => {
                var error = JSON.parse(err._body)
                this.userSaveError = error.message;
                this.showUserSaveError = true;
            });
    }
    updateUser() {

        this.responseToObject<IStrategist>(this._userService.updateUserRole(+this.user.roleId, +this.user.id, +this.user.eclipseDatabaseId, +this.user.strategistId))
            .subscribe(model => {
                this._router.navigate(['/community/administrator/user/list']);
            },
            err => {
                var error = JSON.parse(err._body)
                this.userSaveError = error.message;
                this.showUserSaveError = true;
            });
    }

    removeUserFromStrategist() {
        this.responseToObject<IStrategist>(this._userService.deleteUser(this.user.id, this.originalStrategistId))
            .subscribe(model => {
                this.addUserToStrategist();
            },
            err => {
                //this.userSaveError = "User cannot be assigned to another strategist as it is the only admin for its respective strategist.";
                var error = JSON.parse(err._body);
                this.userSaveError = error.message;
                this.showUserSaveError = true;
            });
    }

    private isValidSelect(role: number) {
        if (role != RoleType.SuperAdmin) {
            this.isValidStrategistId = this.user.strategistId != null && this.user.strategistId != undefined &&
                this.user.strategistId != 0;
        }
        else {
            this.isValidEclipseDbId = this.user.eclipseDatabaseId != null && this.user.eclipseDatabaseId != undefined;
        }
    }

}