import { Component, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '@angular/http';
// import { Calendar } from 'primeng/components/calendar/calendar';
// import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../../core/base.component';
import * as Util from '../../../../core/functions';
import { IRole, IPrivilege, IRolePrivilege, ICategoryPrivilege } from '../../../../models/user.models';
import { RoleService } from '../../../../services/role.service';
import { IAdminLeftMenu, AdminLeftNavComponent } from '../../../../shared/leftnavigation/admin.leftnav';
import { ITabNav } from '../shared/role.tabnav.component';

@Component({
    selector: 'eclipse-admin-role-detail',
    templateUrl: './app/components/admin/role/detail/roledetail.component.html',
    //directives: [AutoComplete, Calendar, AdminLeftNavComponent, RoleTabNavComponent],
    providers: [RoleService]
})

export class RoleDetailComponent extends BaseComponent {
    private menuModel: IAdminLeftMenu;
    private tabsModel: ITabNav;
    roleId: number;
    editRole: IRole;
    rolePrivileges: IRolePrivilege[] = [];
    role: IRole = <IRole>{};
    recordType: number = 0;
    disableType: Boolean = false;
    spaceflag: boolean = false;
    categoryPrivileges: ICategoryPrivilege[] = [];

    globalAdd: boolean = false;
    globalEdit: boolean = false;
    globalRead: boolean = false;
    globalDelete: boolean = false;
    paramRead: string = "read";
    paramWrite: string = "write";
    paramEdit: string = "edit";
    paramDelete: string = "delete";

    roleTypes: any[] = [];
    isRoleExists: boolean = false;
    btnSaveDisable: boolean = false;
    errRoleType: boolean;
    errStardate: boolean;
    startDate: string;
    expireDate: string;
    shwexpdatemsg: boolean = false;
    shwstrtdatemsg: boolean = false;
    shwexpdatecomprmsg: boolean = false;
    showDatePicker: boolean = false;
    roleCategories: any[] = [];

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _roleService: RoleService) {
        super(PRIV_ROLES);
        this.menuModel = <IAdminLeftMenu>{};
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'A';
        //get param value when we clicked on edit/add role
        this.activeRoute = Util.activeRoute(this.activateRoute);
        // console.log('this.activeRoute: ', this.activeRoute);
        this.role.roleTypeId = 0;
        this.roleId = Util.getRouteParam<number>(this.activateRoute);
        this.disableType = (this.activeRoute != 'add');
        // console.log('this.disableType: ', this.disableType);
        if (this.activeRoute == 'edit' && this.roleId > 0) {
            this.tabsModel.action = 'E';
            this.tabsModel.id = this.roleId;
        }
    }

    /** load on initilization */
    ngOnInit() {
        //Get static role types list
        this.getRoleTypes();
        this.getRolesSummary();
        //Get privileges list only once
        if (this.roleId > 0)
            this.getRoleById(this.roleId);
        else
            this.getPrivileges();
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

    hideError() {
        this.spaceflag = (this.role.name == "");
    }

    /** To get, already role is existing or not with same role name */
    roleAlreadyExist() {
        if (this.role.name == undefined || this.role.name.trim() == "") {
            this.isRoleExists = false;
            this.spaceflag = true;
            return;
        }
        this.role.name = this.role.name.trim();
        this.ResponseToObjects<IRole>(this._roleService.searchRoles(this.role.name))
            .subscribe(roles => {
                console.log('roleAlreadyExist: ', JSON.stringify(roles));
                let existingRoles = roles.filter(r => r.name.toLowerCase() == this.role.name.toLowerCase()
                    && r.id != this.role.id);
                this.isRoleExists = existingRoles.length > 0;
                this.btnSaveDisable = this.isRoleExists;
            });
    }

    /** Custom validation for team multi select and start date */
    customValidation() {
        if (this.role.name != undefined) {
            this.role.name = this.role.name.trim();
        }
        if (this.role.name != undefined || this.role.name == "" || this.role.roleTypeId == 0 || this.startDate == "" || this.startDate == null || this.expireDate == "") {
            {
                if (this.role.name == "" || this.role.name == undefined)
                    this.spaceflag = true;
                if ((this.startDate == "" && this.startDate == null) || (this.startDate != "" && this.startDate != null))
                    this.shwstrtdatemsg = false;
                else
                    this.shwstrtdatemsg = true;
                if (this.expireDate == "" || this.expireDate == null)
                    this.shwexpdatemsg = true;
                if (this.role.roleTypeId == 0 || this.role.roleTypeId == undefined)
                    this.errRoleType = true;
            }
        }
        else {
            this.spaceflag = false;
            this.shwstrtdatemsg = false;
            this.errRoleType = false;
            this.shwexpdatemsg = false;
        }
    }

    /** To save role details on clicking on save */
    onSave() {
        this.customValidation();
        if (this.spaceflag == true || this.shwstrtdatemsg == true || this.errRoleType == true || this.shwexpdatemsg == true) return;
        if (new Date(this.expireDate) > new Date(this.startDate)) {
            this.role.name = this.role.name.trim();
            this.role.privileges = this.rolePrivileges;
            this.role.startDate = this.startDate;
            this.role.expireDate = this.expireDate;
            if (this.role.id > 0) {
                // console.log('from create role: ', JSON.stringify(this.role));
                this._roleService.updateRole(this.role).subscribe(model => {
                    console.log('from update role: ', JSON.stringify(this.role));
                    this._router.navigate(['/eclipse/admin/role/list']);
                });
            }
            else {
                this.errRoleType = (this.role.roleTypeId == 0);
                //Creating Role
                console.log('from create role: ', JSON.stringify(this.role));
                this._roleService.createRole(this.role)
                    .subscribe(model => {
                        this.errRoleType = false;
                        this._router.navigate(['/eclipse/admin/role/list']);
                    });
            }
        }
        else { this.shwexpdatecomprmsg = true }
    }

    /** Clear Date messages */
    clearDates() {
        if (this.startDate != null && this.expireDate != null)
            this.shwexpdatecomprmsg = false;

        this.errStardate = (new Date(this.startDate) > new Date(this.expireDate));
    }

    /** StartDate calender select event */
    startDateSelect() {
        this.shwstrtdatemsg = (this.startDate == null);

        if (this.startDate != null && this.expireDate != null)
            this.shwexpdatecomprmsg = false;

        this.errStardate = (new Date(this.startDate) >= new Date(this.expireDate));
    }

    /**Expirary date change event */
    expiryDateSelect() {
        this.shwexpdatemsg = (this.expireDate == "");

        if (this.startDate != "") {
            if ((new Date(this.expireDate) > new Date(this.startDate))) {
                this.shwexpdatecomprmsg = false;
                this.errStardate = false;
            }
            else {
                this.shwexpdatecomprmsg = true;
            }
        }
    }

    /* Hold Previleges on check box selection */
    onChkChange(event, model: IRolePrivilege, field) {
        if (field == "write") {
            model.canAdd = event.currentTarget.checked;
            var flag = this.rolePrivileges.find(m => m.type == this.recordType && !m.canAdd);
            this.globalAdd = (flag == undefined);
        }
        else if (field == "read") {
            model.canRead = event.currentTarget.checked;
            var flag = this.rolePrivileges.find(m => m.type == this.recordType && !m.canRead);
            this.globalRead = (flag == undefined);
        }
        else if (field == "edit") {
            model.canUpdate = event.currentTarget.checked;
            var flag = this.rolePrivileges.find(m => m.type == this.recordType && !m.canUpdate);
            this.globalEdit = (flag == undefined);
        }
        else if (field == "delete") {
            model.canDelete = event.currentTarget.checked;
            var flag = this.rolePrivileges.find(m => m.type == this.recordType && !m.canDelete);
            this.globalDelete = (flag == undefined);
        }
    }

    /* To get static roles types */
    private getRoleTypes() {
        this.roleTypes = this._roleService.getStaticRoleTypes();
        // this.roleTypes = Util.sortBy(this.roleTypes, 'id');
        console.log('static role types', this.roleTypes);
    }

    /** Filter Privilages based role type dropdown selection */

    onRoleTypeChange(roleTypeId: number) {

        this.errRoleType = false;
        this.getFileteredPrivileges(roleTypeId);
    }

    /**
     * Get Privileges list from api
     */
    private getPrivileges() {
        this.ResponseToObjects<IPrivilege>(this._roleService.getPrivileges())
            .subscribe(model => {
                console.log('privileges: ', JSON.stringify(model));
                // model = Util.sortBy(model, 'type');
                // model = Util.sortBy(model, 'id');
                // console.log('categories: ', JSON.stringify(model));
                // let categories = model.map(priv => { return { category: priv.category, type: priv.type }; });
                // console.log('categories: ', JSON.stringify(categories));
                // this.roleCategories = categories.filter((priv, i) => {
                //     return categories.findIndex(m => m.category == priv.category && m.type == priv.type) == i;
                // });
                // console.log('distinct categories: ', JSON.stringify(categories));
                this.buildRolePrivleges(model);
            });
    }

    /** 
     * Get privileges list from api based on roleTypeId
     * @roleTypeId is number type
     */
    private getFileteredPrivileges(roleTypeId: number) {
        this.ResponseToObjects<IPrivilege>(this._roleService.getPrivileges(roleTypeId))
            .subscribe(model => {
                console.log('roleType privileges: ', JSON.stringify(model));
                this.buildRolePrivleges(model);
            });
    }


    /**
     * Used to build role privuleges from privileges
     */
    private buildRolePrivleges(privileges: IPrivilege[]) {
        // Build role pivileges from Privileges
        this.rolePrivileges = this.createRolePrivileges(privileges);
        this.categoryPrivileges = <ICategoryPrivilege[]>[];
        this.rolePrivileges.forEach(m => {
            let item = this.categoryPrivileges.find(cat => cat.category == m.category && cat.type == m.type);
            if (item == undefined) {
                item = <ICategoryPrivilege>{ category: m.category, privileges: [], type: m.type };
                this.categoryPrivileges.push(item);
            }
            item.privileges.push(m);
        });
        console.log('categoryPrivileges: ', this.categoryPrivileges);
    }

    private createRolePrivileges(privileges: IPrivilege[]) {
        let rolePrivileges = <IRolePrivilege[]>[];
        privileges.forEach(priv => {
            rolePrivileges.push(<IRolePrivilege>{
                id: priv.id,
                name: priv.name,
                code: priv.code,
                type: priv.type,
                category: priv.category,
                roletype: priv.userLevel,
                canAdd: false,
                canRead: false,
                canUpdate: false,
                canDelete: false
            });
        })
        //console.log('rolePrivileges: ' + JSON.stringify(rolePrivileges));
        return rolePrivileges;
    }

    /**
     * Used for canAdd selectall checkbox selection
     */
    onWriteChange(event) {
        this.rolePrivileges.forEach(element => {
            element.canAdd = event.currentTarget.checked;
        });
        //this.globalAdd = !this.globalAdd;
    }

    /**
     * Used for canRead select All checkbox selection
     */
    onReadChange(event) {
        this.rolePrivileges.forEach(element => {
            if (element.type == this.recordType)
                element.canRead = event.currentTarget.checked;
        });
        this.globalRead = !this.globalRead;
    }

    /**
     * Used for canEdit selectAll checkbox selection
     */
    onEditChange(event) {
        this.rolePrivileges.forEach(element => {
            element.canUpdate = event.currentTarget.checked;
        });
        //this.globalEdit = !this.globalEdit;
    }

    /**
     *  Used for canDelete selectAll checkbox selection
     */
    onDeleteChange(event) {
        this.rolePrivileges.forEach(element => {
            element.canDelete = event.currentTarget.checked;
        });
        //this.globalDelete = !this.globalDelete;
    }

    /**
     * To get Selected role details by roleid
     */
    private getRoleById(roleId: number) {
        this.responseToObject<IRole>(this._roleService.getRoleById(roleId))
            .subscribe(model => {
                this.role = model;
                // reset roleId to 0 in copy mode 
                if (this.activeRoute == 'copy') {
                    this.role.id = 0;
                    this.role.name = '';
                }
                if (this.role.privileges.length > 0) {
                    this.rolePrivileges = this.role.privileges;
                }
                var flag = model.privileges.find(m => !m.canAdd && m.type == this.recordType);
                this.globalAdd = (flag == undefined);
                flag = model.privileges.find(m => !m.canRead && m.type == this.recordType);
                this.globalRead = (flag == undefined);
                flag = model.privileges.find(m => !m.canUpdate && m.type == this.recordType);
                this.globalEdit = (flag == undefined);
                flag = model.privileges.find(m => !m.canDelete && m.type == this.recordType);
                this.globalDelete = (flag == undefined);

                // split privileges category wise
                this.categoryPrivileges = <ICategoryPrivilege[]>[];
                this.rolePrivileges.forEach(m => {
                    let item = this.categoryPrivileges.find(cat => cat.category == m.category && cat.type == m.type);
                    if (item == undefined) {
                        item = <ICategoryPrivilege>{ category: m.category, privileges: [], type: m.type };
                        this.categoryPrivileges.push(item);
                    }
                    item.privileges.push(m);
                });

                /* Binding values */
                this.startDate = this.formatDate(this.role.startDate);
                this.expireDate = this.formatDate(this.role.expireDate);
            },
            error => {
                console.log(error);
                throw error;
            });
    }

}
