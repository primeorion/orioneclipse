import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { IRole } from '../../../models/role';
import { BaseComponent } from '../../../core/base.component';
import {IUser} from '../../../models/user';


@Component({
    selector: 'eclipse-admin-reassignuser',
    templateUrl: './app/components/admin/role/role.reassignuser.component.html',
})

export class ReassignComponent extends BaseComponent {
    //declare role vairable to hold selected role data
    //Get selected role details
    //Bind selected roles details into UI

    //Get active roles and bind to drop down
    //Get new role details based on drop down selection
    //Bind new role details into UI

    selectedRoleData: IRole[] = [];
    getUsers: IUser[] = [];
    rolesData: any[] = [];
    roleId: number;
    reassingRoleType: IRole[] = [];
    selectedRole: any;
    showErrorMessage: boolean = false;
    errNewRoleAssignment: boolean = false;
    errorMessage: string = '';
    usersCount: number;
    //selectedId : number;
    private userName: IUser[] = [];
    @Output() reassigned = new EventEmitter();
    constructor(private _roleService: RoleService) {
        super();
    }

    /**To load selected role details */
    loadReassignUser(roleId: number) {
        this.hideError();
        this.selectedRole = {};
        this.roleId = roleId;
        let ReassignUser = [];

        this._roleService.getRoleById(roleId).map((response: Response) => response.json())
            // .do(data => console.log('Role details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.selectedRoleData = model;
                this.loadSameTypeRoles(model.roleType);
            })

        this._roleService.getUsers(roleId)
            .map((response: Response) => response.json())
            .subscribe(model => {
                this.usersCount = model.length;
            })
    }
    /** Reassign selected role to user*/
    reassignRoleToUser() {
        this.hideError();
        if (this.selectedRole == undefined || this.selectedRole.id <= 0) {
            this.errNewRoleAssignment = true;
        }
        else {
            let roleIds = { oldId: this.roleId, newId: this.selectedRole.id };
            this._roleService.reassignRoleToUser(roleIds)
                .map((response: Response) => response.json())
                .subscribe(model => {
                    this.reassigned.emit("Role reassigned");
                },
                error => {
                    this.errNewRoleAssignment = true;
                    this.errorMessage = JSON.parse(error._body).message;
                });
        }
    }

    /** Get roles to bind drop down */
    private loadSameTypeRoles(roleType: string) {
        this.ResponseToObjects<IRole>(this._roleService.getRolesByRoleType(roleType))
            .subscribe(model => {
                this.rolesData = [];
                model.forEach(element => {
                    if (element.id != this.roleId && element.status == 1) {
                        this.rolesData.push(element);
                    }
                });
                this.rolesData = this.rolesData.sort((r1, r2) => {
                    if (r1.name.trim() > r2.name.trim()) return 1;
                    if (r1.name.trim() < r2.name.trim()) return -1;
                    return 0
                });
            });
    }

    /**Get role selected role details on drop down selection */
    private dropDownChange(roleid) {
        this.selectedRole = [];
        for (var i = 0; i < this.rolesData.length; i++) {
            if (this.rolesData[i].id == roleid) {
                this.selectedRole = this.rolesData[i];
            }
        }
        this.errNewRoleAssignment = false;
    }

    /** To hide error messages*/
    private hideError() {
        this.showErrorMessage = false;
        this.errorMessage = '';
        this.errNewRoleAssignment = false;
    }

}

