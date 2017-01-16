import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IRole, IRoleType } from '../models/role';

@Injectable()
export class RoleService {
    private _rolesEndPoint = 'admin/roles';
    private _rolesSummaryEndPoint = this._rolesEndPoint + '/summary';
    private _privilegesEndPoint = "admin/Privileges";
    private roleTypes: IRoleType[] = [];

    constructor(private _httpClient: HttpClient) { }

    /**
     * Get all roles
     */
    getRoles() {
        return this._httpClient.getData(this._rolesEndPoint)
    }

    /**
     * Get all roles
     */
    getRolesByRoleType(roleType: string) {
        return this._httpClient.getData(this._rolesEndPoint + '?roleType=' + roleType)
    }

    /**
     * Get role by given role type 
     */
    getRoleById(roleId: number) {
        return this._httpClient.getData(this._rolesEndPoint + "/" + roleId);
    }

    /**
     * Create a new role
     */
    createRole(role: IRole) {
        return this._httpClient.postData(this._rolesEndPoint, role);
    }

    /**
     * Delete a role
     */
    deleteRole(roleId: number) {
        return this._httpClient.deleteData(this._rolesEndPoint + "/" + roleId);
    }

    /**
     * Update a role
     */
    updateRole(role: IRole) {
        return this._httpClient.updateData(this._rolesEndPoint + "/" + role.id, role);
    }

    /**
     * Get all privileges
     */
    getPrivileges(roleTypeId: number = 0) {
        return (roleTypeId == 0)
            ? this._httpClient.getData(this._privilegesEndPoint)
            : this._httpClient.getData(this._privilegesEndPoint + '/?roleTypeId=' + roleTypeId);
    }

    /**
     * Reassign a role to users who are under given role 
     */
    reassignRoleToUser(roleIds: any) {
        console.log('API URL: ' + this._rolesEndPoint + '/Action/ReassignRole');
        return this._httpClient.postData(this._rolesEndPoint + '/Action/ReassignRole', roleIds);
    }

    /**To get static role types */
    getStaticRoleTypes() {
        this.roleTypes.push(<IRoleType>{ id: 1, roleType: "FIRM ADMIN" });
        this.roleTypes.push(<IRoleType>{ id: 2, roleType: "TEAM ADMIN" });
        this.roleTypes.push(<IRoleType>{ id: 3, roleType: "USER" });
        return this.roleTypes;
    }

    /** get roles summary */
    getRolesSummary() {
        return this._httpClient.getData(this._rolesSummaryEndPoint)
    }

    searchRoles(searchString: string) {
        return this._httpClient.getData(this._rolesEndPoint + '?search=' + searchString);
    }

    /** Get Number of Users */
    getUsers(roleId: number) {
        return this._httpClient.getData(this._rolesEndPoint + '/' + roleId + '/users');
    }

}
