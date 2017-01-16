import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IRole } from '../../../../models/models';
import { RoleService } from '../../../../services/role.service';
import { UserService } from '../../../../services/user.service';
import { IUser, ICustomUser } from '../../../../models/user';
import { ITabNav, UserTabNavComponent } from '../shared/user.tabnav.component';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';

@Component({
    selector: 'eclipse-user-view',
    templateUrl: './app/components/admin/user/view/userview.component.html',
    directives: [AutoComplete, AdminLeftNavComponent, UserTabNavComponent],
    providers: [UserService, RoleService]
})

export class UserViewComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    userSuggestions: any[] = [];
    existingUsers: IUser[] = [];
    orionUser: any;
    selectedRole: string = '';
    selectedTeams: string = '';
    userId: number;
    viewUser: ICustomUser = <ICustomUser>{};

    constructor(private _router: Router, private activateRoute: ActivatedRoute,
        private _roleService: RoleService, private _userService: UserService) {
        super(PRIV_USERS);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.userId = Util.getRouteParam<number>(this.activateRoute);
        if (this.userId > 0) {
            this.tabsModel.id = this.userId;
        }
    }

    ngOnInit() {
        this.getUsersSummary();
        if (this.userId > 0) {
            this.getUserDetailsById(this.userId);
        } else {
            //this._router.navigate(['/eclipse/admin/user/list']);
        }
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

    /** AutoComplete Search by UserName */
    loadUserSuggestions(event) {
        this.ResponseToObjects<IUser>(this._userService.searchUser(event.query))
            .subscribe(users => {
                this.userSuggestions = users.filter(a => a.isDeleted == 0);
                this.existingUsers.forEach(element => {
                    this.userSuggestions = this.userSuggestions.filter(record => record.userId != element.id);
                });
            });
    }

    /**
     * To get selected user
     */
    onUserSelect(params: any) {
        this._router.navigate(['/eclipse/admin/user/view', params.id]);
    }

    /**
     * To get selected user details
     */
    getUserDetailsById(userId: number) {
        this.responseToObject<IUser>(this._userService.getUserById(userId))
            .subscribe(model => {
                console.log('selected user: ', model);
                this.viewUser.id = model.id;
                this.viewUser.name = model.name;
                this.viewUser.status = model.status;
                this.viewUser.startDate = this.formatDate(model.startDate);
                this.viewUser.expireDate = this.formatDate(model.expireDate);
                if (model.role != null) {
                    this.viewUser.roleId = model.role.id;
                    this.selectedRole = model.role.name;
                }
                model.teams.forEach(team => {
                    this.selectedTeams += (!Util.isNull(this.selectedTeams) ? ', ' : '') + team.name;
                });
            },
            error => {
                console.log(error);
                throw error;
            });
    }

}
