import { Component, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IRole, IPrivilege, IRolePrivilege, ICategoryPrivilege } from '../../../../models/user.models';
import { RoleService } from '../../../../services/role.service';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav, RoleTabNavComponent } from '../shared/role.tabnav.component';

@Component({
    selector: 'eclipse-admin-role-view',
    templateUrl: './app/components/admin/role/view/roleview.component.html',
    directives: [AutoComplete, AdminLeftNavComponent, RoleTabNavComponent],
    providers: [RoleService]
})

export class RoleViewComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    roleId: number;
    role: IRole = <IRole>{};
    recordType: number = 0;
    categoryPrivileges: ICategoryPrivilege[] = [];
    globalAdd: boolean = false;
    globalEdit: boolean = false;
    globalRead: boolean = false;
    globalDelete: boolean = false;
    selectedRole: string;
    roleSuggestions: IRole[] = [];

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _roleService: RoleService) {
        super(PRIV_ROLES);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.selectedRole = "";
        // get param value when we clicked on edit/add role
        let currentRoute = Util.activeRoute(this.activateRoute);
        console.log('this.activateRoute: ', currentRoute);
        this.roleId = Util.getRouteParam<number>(this.activateRoute);
        if (this.roleId > 0) {
            this.tabsModel.id = this.roleId;
        }
    }

    /** load on initilization */
    ngOnInit() {
        if (this.roleId > 0)
            this.getRoleById(this.roleId);
        this.getRolesSummary();
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

    /** AutoComplete Search roles by name */
    loadRoleSuggestions(event) {
        this.ResponseToObjects<IRole>(this._roleService.searchRoles(event.query.toLowerCase()))
            .subscribe(model => {
                this.roleSuggestions = model;
            });
    }

    onRoleSelect(params: any) {
        this._router.navigate(['/eclipse/admin/role/view', params.id]);
    }

    /**
     * To get Selected role details by roleid
     */
    private getRoleById(roleId: number) {
        this.responseToObject<IRole>(this._roleService.getRoleById(roleId))
            .subscribe(model => {
                this.role = model;
                var flag = model.privileges.find(m => !m.canAdd && m.type == this.recordType);
                this.globalAdd = (flag == undefined);
                flag = model.privileges.find(m => !m.canRead && m.type == this.recordType);
                this.globalRead = (flag == undefined);
                flag = model.privileges.find(m => !m.canUpdate && m.type == this.recordType);
                this.globalEdit = (flag == undefined);
                flag = model.privileges.find(m => !m.canDelete && m.type == this.recordType);
                this.globalDelete = (flag == undefined);
                // get filtered privileges
                // model.privileges = Util.sortBy(model.privileges, 'type');
                // this.role.privileges = Util.sortBy(model.privileges, 'id');
                // console.log("getRoleById privileges: ", JSON.stringify(this.role.privileges));
                this.role.privileges.forEach(m => {
                    let item = this.categoryPrivileges.find(cat => cat.category == m.category && cat.type == m.type);
                    if (item == undefined) {
                        item = <ICategoryPrivilege>{ category: m.category, privileges: [], type: m.type };
                        this.categoryPrivileges.push(item);
                    }
                    item.privileges.push(m);
                });
            },
            error => {
                console.log(error);
                throw error;
            });
    }

}
