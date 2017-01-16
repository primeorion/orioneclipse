import { Component, Output, EventEmitter} from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Calendar } from 'primeng/components/calendar/calendar';
import { Response } from '@angular/http';
import {IRolePrivilege} from '../../../models/rolePrivileges';
import {IRole} from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import {IPrivilege} from '../../../models/privileges';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../core/base.component';

@Component({
    selector: 'admin-roledetails',
    templateUrl: './app/components/admin/role/roledetails.component.html',
    directives: [ROUTER_DIRECTIVES, AutoComplete, Calendar]
})

export class RoleDetailsComponent extends BaseComponent {
    rolePrivileges: IRolePrivilege[] = [];
    name: string;
    roleTypeId: number;
    isEdit: boolean = true;
    isCopy: boolean = false;
    roleRecords: string[] = [];
    role: IRole = <IRole>{};
    roleType: string;
    createdOn: Date;
    lastEditedOn: Date;
    public hdnSaveRole: boolean = true;
    recordType: number = 0;
    functionType: number = 1;
    isTypeDisabled: Boolean = false;
    isRoleDisabled: Boolean = false;
    spaceflag: boolean = false;
    btnValue: string;

    //Records
    securityRecordPrivileges: IRolePrivilege[] = [];
    modelRecordPrivileges: IRolePrivilege[] = [];
    portfolioRecordPrivileges: IRolePrivilege[] = [];
    preferenceRecordPrivileges: IRolePrivilege[] = [];

    //Functions
    featuresFunctionPrivileges: IRolePrivilege[] = [];
    tradeOrdersFunctionPrivileges: IRolePrivilege[] = [];
    dataImportFunctionPrivileges: IRolePrivilege[] = [];
    modelFunctionPrivileges: IRolePrivilege[] = [];

    globalAdd: boolean = false;
    globalEdit: boolean = false;
    globalRead: boolean = false;
    globalDelete: boolean = false;
    errorMessage: string;
    private privilegesList: any[] = [];

    paramRead: string = "read";
    paramWrite: string = "write";
    paramEdit: string = "edit";
    paramDelete: string = "delete";

    @Output() roleSaved = new EventEmitter();
    autoRoles: boolean = false;
    textAutoComplete: string;
    autocompleteResults: any[] = [];
    FilteredRoleresults: any[] = [''];
    roleTypes: any[] = [];
    isActiveFlag: boolean;
    isAdd: boolean;
    existingRoles: IRole[] = [];
    existingRolesCount: number;
    matchingRolesExists: boolean = false
    btnSaveDisable: boolean = false;
    errRoleType: boolean;
    errStardate: boolean;
    startDate: string;
    expireDate: string;

    shwexpdatemsg: boolean = false;
    shwstrtdatemsg: boolean = false;
    shwexpdatecomprmsg: boolean = false;
    showDatePicker: boolean = false;

    showPanel: string = "hidden";

    constructor(private _roleService: RoleService) {
        super();
        this.textAutoComplete = "";
        this.autocompleteResults = [''];
        this.FilteredRoleresults = [''];
    }

    /**To load on initilization */
    ngOnInit() {
        this.getRoleTypes();
    }

    //AutoComplete Search by name
    autoRoleSearch(event) {
        this._roleService.searchRoles(event.query.toLowerCase())
            .map((response: Response) => response.json())
            .subscribe(model => {
                this.autocompleteResults = model;
            });
    }
    selectedRoleSearch(params: any) {
        this.loadEditMode(params.id);
        this.showPanel = "visible";
        this.autoRoles = true;
    }

    /**
     * To load role details for adding a role
     */
    loaddAddMode(val: string) {
        this.btnValue = "Add"
        this.startDate = "";
        this.expireDate = "";
        this.roleTypeId = 0;
        this.isEdit = false;
        this.isCopy = false;
        this.textAutoComplete = "";
        this.buildRolePrivleges();
        this.resetForm();
        this.autoRoles = (val == "create") ? false : true;
        this.isAdd = true;
        this.role = <IRole>{};
        this.isTypeDisabled = false;
        this.isRoleDisabled = false;
        this.hdnSaveRole = true;
        this.shwexpdatemsg = false;
        this.shwstrtdatemsg = false;
        this.errStardate = false;
        this.errRoleType = false;
        this.showPanel = "visible";
    }

    /**
     * To load role details for editing a selected role
     */
    loadEditMode(roleId: number) {
        this.btnValue = "Save"
        this.isEdit = true;
        this.isCopy = false;
        //this.buildRolePrivleges();
        this.isAdd = false;
        this.autoRoles = false;
        this.clearcategorieswithGlobals();
        /* To get selected role details*/
        this.getRoleByID(roleId);
        this.isTypeDisabled = true;
        this.spaceflag = false;
        this.errRoleType = false;
        this.shwstrtdatemsg = false;
        this.errStardate = false;
        this.shwexpdatemsg = false;
        this.shwexpdatecomprmsg = false;
        //this.shwstrtdatemsg = false;
        this.showPanel = "visible";
    }

    /**
     * To load role details to copy and save a role
     */
    loadCopyMode(sourceRoleId: number) {
        this.isCopy = true;
        this.isAdd = false;
        this.autoRoles = false;
        //this.buildRolePrivleges();
        this.clearcategorieswithGlobals();
        /* To get selected role details*/
        this.getRoleByID(sourceRoleId);
        this.isTypeDisabled = true;
        this.isRoleDisabled = false;
        this.hdnSaveRole = true;
        this.btnSaveDisable = false;
        this.spaceflag = false;
        this.shwstrtdatemsg = false;

    }

    hideError() {
        if (this.name == "") {
            this.spaceflag = true;
            this.existingRolesCount = 0;
        }
        else {
            this.spaceflag = false;
        }
    }

    /** To get, already role is existing or not with same role name*/
    roleAlreadyExist() {
        this.name = this.name.trim();
        if (this.name == undefined || this.name == "") {
            this.existingRolesCount = 0;
            this.spaceflag = true;
        }
        //this.shwexpdatecomprmsg = false;
        this._roleService.searchRoles(this.name)
            .map((response: Response) => response.json())
            .subscribe(role => {
                this.existingRoles = <IRole[]>role;
                this.existingRoles.forEach(element => {
                    this.existingRoles = this.existingRoles.filter
                        (r => r.name.toLowerCase() == this.name.toLowerCase()
                            && r.id != this.role.id);
                });

                this.existingRolesCount = this.existingRoles.length;
                //console.log('roles length :', this.existingRolesCount);
                if (this.existingRolesCount > 0) {
                    this.btnSaveDisable = true;
                    this.spaceflag = false;
                }
                else {
                    this.btnSaveDisable = false;
                }
            });
    }

    /*
    * Custom validation for team multi select and start date
    */
    customValidation() {
        this.name = this.name.trim();
        if (this.name != undefined || this.name == "" || this.roleTypeId == 0 || this.startDate == "" || this.startDate == null || this.expireDate == "") {
            {
                if (this.name == "")
                    this.spaceflag = true;
                if ((this.startDate == "" && this.startDate == null) || (this.startDate != "" && this.startDate != null))
                    this.shwstrtdatemsg = false;
                else
                    this.shwstrtdatemsg = true;
                if (this.expireDate == "")
                    this.shwexpdatemsg = true;
                if (this.roleTypeId == 0 || this.roleTypeId == undefined)
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

    /**
     * To save role details on clicking on save
     */
    onSave() {
        this.customValidation();
        if (this.spaceflag == true || this.shwstrtdatemsg == true || this.errRoleType == true || this.shwexpdatemsg == true) return;
        if (new Date(this.expireDate) > new Date(this.startDate)) {
            this.name = this.name.trim();
            this.role.name = this.name;
            this.role.roleTypeId = this.roleTypeId;
            this.role.createdOn = this.createdOn;
            this.role.privileges = this.rolePrivileges;
            this.role.startDate = this.startDate;
            this.role.expireDate = this.expireDate;
            if (this.role.id > 0) {
                // console.log('from create role: ', JSON.stringify(this.role));
                this._roleService.updateRole(this.role).subscribe(model => {
                    // console.log('from create role: ',JSON.stringify(this.role));
                    this.resetForm();
                    this.roleSaved.emit("Role updated");
                });
            }
            else {

                if ((this.role.roleTypeId == 0)) {
                    this.errRoleType = true;
                    //this.shwstrtdatemsg = true;
                }
                else {
                    this.errRoleType = false;
                    //this.shwstrtdatemsg = false;
                }

                //Creating Role
                console.log('from create role: ', this.role);
                this._roleService.createRole(this.role)
                    .subscribe(model => {
                        this.resetForm();
                        this.roleSaved.emit("Role Saved");
                        this.errRoleType = false;
                    });
            }
        }
        else { this.shwexpdatecomprmsg = true }
    }

    /*** Clear Date messages */
    clearDates() {
        if (this.startDate != null && this.expireDate != null)
            this.shwexpdatecomprmsg = false;

        if ((new Date(this.startDate) > new Date(this.expireDate))) {
            this.errStardate = true;
            //this.shwexpdatecomprmsg = ;
        }
        else {
            this.errStardate = false;
        }
    }

    /*
     * StartDate calender select event
     */
    startDateSelect(startDate: any) {
        if (this.startDate == null)
            this.shwstrtdatemsg = true;
        else
            this.shwstrtdatemsg = false;

        if (this.startDate != null && this.expireDate != null)
            this.shwexpdatecomprmsg = false;

        if ((new Date(this.startDate) >= new Date(this.expireDate))) {
            this.errStardate = true;
            //this.shwexpdatecomprmsg = ;
        }
        else {
            this.errStardate = false;
        }
    }

    /**Expirary date change event */
    expiryDateSelect(expiryDate) {
        if (expiryDate != "") {
            this.shwexpdatemsg = false;
        }
        else {
            this.shwexpdatemsg = true;
        }
        if (this.startDate != "")
            if ((new Date(expiryDate) > new Date(this.startDate))) {
                this.shwexpdatecomprmsg = false;
                this.errStardate = false;
            }
            else {
                this.shwexpdatecomprmsg = true;
            }
    }

    /* Hold Previleges on check box selection */
    onChkChange(event, model: IRolePrivilege, field) {
        this.rolePrivileges.forEach(element => {
            //console.log(model);
            if (model.code == element.code && field == "write") {
                model.canAdd = event.currentTarget.checked;
                var flag = this.rolePrivileges.find(m => m.canAdd == false);
                this.globalAdd = (flag == undefined);
            }
            else if (model.code == element.code && field == "read") {
                model.canRead = event.currentTarget.checked;
                var flag = this.rolePrivileges.find(m => m.canRead == false);
                this.globalRead = (flag == undefined);
            }
            else if (model.code == element.code && field == "edit") {
                model.canUpdate = event.currentTarget.checked;
                var flag = this.rolePrivileges.find(m => m.canUpdate == false);
                this.globalEdit = (flag == undefined);
            }
            else if (model.code == element.code && field == "delete") {
                model.canDelete = event.currentTarget.checked;
                var flag = this.rolePrivileges.find(m => m.canDelete == false);
                this.globalDelete = (flag == undefined);
            }
        });
    }

    /* To get static roles types*/
    private getRoleTypes() {
        this.roleTypes = this._roleService.getStaticRoleTypes().sort((r1, r2) => {
            if (r1.roleType.trim() > r2.roleType.trim()) return 1;
            if (r1.roleType.trim() < r2.roleType.trim()) return -1;
            return 0
        });
        console.log('static role types', this.roleTypes);
    }

    /** Filter Privilages based role type dropdown selection */
    onDropDownSelect(selectedRoleType) {
        //  this._roleService.get();
        // this.privilegesList = this.privilegesList.filter(rt => rt.userLevel == parseInt(selectedRoleType));
        this.errRoleType = false;
        this.getFileteredPrivileges(parseInt(selectedRoleType));
        //console.log('filtered privilages list', this.privilegesList);
         this.buildRolePrivleges();
    }

    /**
     * To get Privileges list from api
     */
    private getPrivileges() {
        //Get privileges list from api
        //Set the privileges into variable.
        this._roleService.getPrivileges()
            .map((response: Response) => response.json())
            //.do(data => console.log('Priviledges All: ' + JSON.stringify(data)))
            .subscribe(model => {
                this.privilegesList = <IPrivilege[]>model;
            });
    }

    private getFileteredPrivileges(roleTypeId: number) {
        //Get privileges list from api
        //Set the privileges into variable.

        this.clearcategorieswithGlobals();
        this._roleService.getPrivileges(roleTypeId)
            .map((response: Response) => response.json())
            //.do(data => console.log('Priviledges All: ' + JSON.stringify(data)))
            .subscribe(model => {
                this.privilegesList = <IPrivilege[]>model;
                //console.log('roleType Id: ', roleTypeId);
                //console.log(' Privileges count : ', this.privilegesList.length);
                this.buildRolePrivleges();
            });
    }

    /**
     * Used to build role privuleges from privileges
     */
    private buildRolePrivleges() {
        //console.log('from build reole privileges');
        this.errorMessage = '';

        //Getting role previlleges
        this._roleService.getPrivileges()
            .map((response: Response) => response.json())
            //.do(data => console.log('Priviledges All: ' + JSON.stringify(data)))
            .subscribe(model => {
                this.privilegesList = <IPrivilege[]>model;

                //Build role pivileges from Privileges
                this.rolePrivileges = this.createRolePrivileges();
                console.log("Role Privileges :", this.rolePrivileges);

                //Clear collections if it has data.
                this.clearcategorieswithGlobals();

                //Preparing individul sections
                this.rolePrivileges.filter(rec => rec.type == this.recordType).forEach(element => {
                    switch (element.category.toLowerCase()) {
                        case "security": {
                            this.securityRecordPrivileges.push(element);
                            break;
                        }
                        case "modeling": {
                            this.modelRecordPrivileges.push(element);
                            break;
                        }
                        case "portfolio": {
                            this.portfolioRecordPrivileges.push(element);
                            break;
                        }
                        case "preferences": {
                            this.preferenceRecordPrivileges.push(element);
                            break;
                        }
                        case "features": {
                            this.featuresFunctionPrivileges.push(element);
                            break;
                        }

                        default:
                            break;
                    }
                });
                this.rolePrivileges.filter(rec => rec.type == this.functionType).forEach(element => {
                    switch (element.category.toLowerCase()) {
                        case "trade orders": {
                            this.tradeOrdersFunctionPrivileges.push(element);
                            break;
                        }
                        case "data import": {
                            this.dataImportFunctionPrivileges.push(element);
                            break
                        }
                        case "modeling": {
                            this.modelFunctionPrivileges.push(element);
                            break;
                        }

                        default:
                            break;
                    }
                });
            });

        //console.log('Model Functions :', this.modelFunctionPrivileges);
    }

    /**
     * Used for canAdd selectall checkbox selection
     */
    onWriteChange(event) {
        this.rolePrivileges.forEach(element => {
            element.canAdd = event.currentTarget.checked;
        });

        this.globalAdd = !this.globalAdd;
    }

    /**
     * Used for canRead select All checkbox selection
     */
    onReadChange(event) {
        this.rolePrivileges.forEach(element => {
            if (!(
                element.category.toLowerCase() == "trade orders" ||
                element.category.toLowerCase() == "data import" ||
                element.name.toLowerCase() == "approve model changes" ||
                element.name.toLowerCase() == "approve model assignment"))
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

        this.globalEdit = !this.globalEdit;
    }

    /**
  *  Used for canDelete selectAll checkbox selection
  */
    onDeleteChange(event) {

        this.rolePrivileges.forEach(element => {
            element.canDelete = event.currentTarget.checked;
        });

        this.globalDelete = !this.globalDelete;
    }

    /**
     * Used to redirect to All Roles on clicking cancel button
     */
    onCancel() {
        this.resetForm();
        this.clearcategorieswithGlobals();
        this.roleSaved.emit("Role Cancel");
    }

    private createRolePrivileges() {
        let rolePrivileges = <IRolePrivilege[]>[];
        this.privilegesList.forEach(priv => {
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
     * To get Selected role details by roleid
     */
    private getRoleByID(roleId: number) {

        this._roleService.getRoleById(roleId)
            .map((response: Response) => response.json())
            //.do(data => console.log('Role details :' + JSON.stringify(data)))
            .subscribe(roleDetails => {
                this.role = <IRole>roleDetails;

                if (this.role.privileges.length > 0) {
                    this.rolePrivileges = this.role.privileges;
                }

                this.globalAdd = true;
                this.globalRead = true;
                this.globalEdit = true;
                this.globalDelete = true;

                //to get filtered privileges
                this.getRoleDetailPrevileges(roleDetails);

                //in copy mode reset roleId to 0
                if (this.isCopy)
                    this.role.id = 0;
                if (roleDetails.status == 1)
                    this.isActiveFlag = true;
                else
                    this.isActiveFlag = false;

                /* Binding values */
                this.name = this.isCopy ? '' : this.role.name.trim();
                this.roleType = this.role.roleType;
                this.createdOn = this.role.createdOn;
                this.lastEditedOn = this.role.editedOn;
                this.roleTypeId = this.role.roleTypeId;
                this.startDate = this.formatDate(this.role.startDate);
                this.expireDate = this.formatDate(this.role.expireDate);

            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }



    /** get filtered privileges */
    private getRoleDetailPrevileges(roleDetails) {
        this._roleService.getPrivileges(roleDetails.roleTypeId)
            .map((response: Response) => response.json())
            .subscribe(filteredPrivileges => {

                this.privilegesList = <IPrivilege[]>filteredPrivileges;
                filteredPrivileges.forEach(element => {
                    let rolePrivilege = roleDetails.privileges.filter(record => record.id == element.id)[0];
                    //console.log('after filter:', rolePrivilege)
                    if (rolePrivilege != undefined && rolePrivilege.id > 0) {
                        if (element.type == this.recordType) {
                            if (element.category != null) {
                                switch (element.category.toLowerCase()) {
                                    case "security": {
                                        this.securityRecordPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "modeling": {
                                        this.modelRecordPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "portfolio": {
                                        this.portfolioRecordPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "preferences": {
                                        this.preferenceRecordPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "features": {
                                        this.featuresFunctionPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    default:
                                        break;
                                }
                                /* Setting the Global checboxes values based on individual checkboxes values. */
                                this.globalAdd = this.globalAdd && rolePrivilege.canAdd;
                                if (!(
                                    rolePrivilege.category.toLowerCase() == "trade orders" ||
                                    rolePrivilege.category.toLowerCase() == "data import"))
                                this.globalRead = this.globalRead && rolePrivilege.canRead;
                                this.globalEdit = this.globalEdit && rolePrivilege.canUpdate;
                                this.globalDelete = this.globalDelete && rolePrivilege.canDelete;

                            }
                            /* default load privileges, if category=null */
                            else {
                                this.buildRolePrivleges();
                            }
                        }

                        if (element.type == this.functionType) {
                            if (element.category != null) {
                                switch (element.category.toLowerCase()) {
                                    case "modeling": {
                                        this.modelFunctionPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "trade orders": {
                                        this.tradeOrdersFunctionPrivileges.push(rolePrivilege);
                                        break;
                                    }
                                    case "data import": {
                                        this.dataImportFunctionPrivileges.push(rolePrivilege);
                                        break
                                    }
                                    default:
                                        break;
                                }

                            }
                            /* default load privileges, if category=null */
                            else {
                                this.buildRolePrivleges();
                            }
                        }
                    }
                });
            });
    }

    /**
     * To clear individual role privileges
     */
    private clearcategorieswithGlobals() {
        this.securityRecordPrivileges.splice(0);
        this.modelRecordPrivileges.splice(0);
        this.portfolioRecordPrivileges.splice(0);
        this.preferenceRecordPrivileges.splice(0);
        this.featuresFunctionPrivileges.splice(0);
        this.tradeOrdersFunctionPrivileges.splice(0);
        this.dataImportFunctionPrivileges.splice(0);
        this.modelFunctionPrivileges.splice(0);

        this.globalAdd = false;
        this.globalRead = false;
        this.globalEdit = false;
        this.globalDelete = false;
    }

    /**
     * To reset role details after save and on cancel click.
     */
    private resetForm() {
        //this.spaceflag = false;
        this.name = '';
        this.role.roleTypeId = 0;
        this.roleType = '';
        this.isEdit = false;
        this.globalAdd = false;
        this.globalEdit = false;
        this.globalRead = false;
        this.globalDelete = false;
        this.rolePrivileges.forEach(element => {
            element.canRead = false;
            element.canUpdate = false;
            element.canAdd = false;
            element.canDelete = false;
        });
        this.existingRolesCount = 0;
        this.btnSaveDisable = false;
        this.spaceflag = false;
        this.createdOn = null;
        this.lastEditedOn = null;
        this.errRoleType = false;
        this.shwstrtdatemsg = false;
        this.shwexpdatemsg = false;
        this.shwexpdatecomprmsg = false;
        this.errStardate = false;
        // this.spaceflag = nu
    }



}
