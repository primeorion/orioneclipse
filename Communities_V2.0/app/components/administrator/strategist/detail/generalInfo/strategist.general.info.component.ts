import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Http, Response, Headers } from '@angular/http';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategist } from '../../../../../models/strategist';
import { IUser } from '../../../../../models/user';
import { IStrategistStatus } from '../../../../../models/strategist.status';
import { IUserRole } from '../../../../../models/user.role';
import { StrategistService } from '../../../../../services/strategist.service';
import { UserService } from '../../../../../services/user.service';
import { CustomValidator } from '../../../../../shared/validator/CustomValidator';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Observable } from 'rxjs/Rx';
import { IFirm } from '../../../../../models/firm';
import { TokenHelperService } from '../../../../../core/tokenhelper.service';

@Component({
    selector: 'community-strategist-general-info',
    templateUrl: './app/components/administrator/strategist/detail/generalInfo/strategist.general.info.component.html'


})
export class StrategistGeneralInfoComponent extends BaseComponent implements AfterViewInit {

    private btnDisableUser: boolean = true;
    private displayConfirm: boolean = false;
    private displayUserDeleteError: boolean = false;
    private isUserDetailValid: boolean = true;
    private showAddUserError: boolean = false;
    private showSaveError: boolean = false;
    private saveError: string;
    private addUserError: string;
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private autoCompleteSelectedUser: any;
    private filteredUserResult: IUser[];
    private strategistStatus: IStrategistStatus[];
    private userRoles: IUserRole[];
    private selectedUserId;
    private StrategistStatus: string = "";
    private strategist: IStrategist = <IStrategist>{};

    private largeLogoFile: any;
    private smallLogoFile: any;
    private largeLogoUploadError: string;
    private smallLogoUploadError: string;
    private showLargeLogoError: boolean = false;
    private showSmallLogoError: boolean = false;
    private submitGeneralInfo: boolean = false;
    private eclipseDBIds: IFirm[] = [];
    private loggedInUser: IUser;
    private hideSelectStatus: boolean = false;
    private enableSelectEclipseDbId: boolean = false;
    statusChangeConfirmation: boolean = false;
    canDeactivateStrategist : boolean = true;
    StrategistStatusValue : number ; 
    private strategistError: string = "";
    @Input() strategistId: number;
    @Input() isViewMode: boolean;
    @Output() navigateToOtherView = new EventEmitter();
    @Output() setStrategistId = new EventEmitter();

    constructor(private _strategistService: StrategistService, private _userService: UserService) {
        super();
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };

        this.getStrategistStatus();
        this.getUserRoleTypes();


    }

    ngOnInit() {

        let tokenhelper = new TokenHelperService();
        this.loggedInUser = <IUser>tokenhelper.getUser();
        this.createColumnDefs();
        this.reset();
        this.getEclipseDbIds();
        this.strategistError = "";
        if (this.loggedInUser.roleId != RoleType.SuperAdmin) {
            this.enableSelectEclipseDbId = false;
            this.hideSelectStatus = true;
        }
        else {
            this.loggedInUser.eclipseDatabaseId == 0 ? this.enableSelectEclipseDbId = true : this.enableSelectEclipseDbId = false;
            this.strategist.eclipseDatabaseId = this.loggedInUser.eclipseDatabaseId;
        }
    }

    reset() {
        this.strategistError = "";
        if (this.strategistId != undefined) {
            this.getStrategistDetail(this.strategistId);
        } else {
            this.strategist = <IStrategist>{};
            this.strategist.users = [];
            this.strategist.status = 2;
            document.getElementById("smallLogo").setAttribute('src', 'app/assets/img/logo-img.png');
            document.getElementById("largeLogo").setAttribute('src', 'app/assets/img/logo-img.png');
        }
        this.btnDisableUser = true;
        this.displayConfirm = false;
        this.displayUserDeleteError = false;
        this.isUserDetailValid = true;
        this.showAddUserError = false;
        this.showSaveError = false;
        this.showLargeLogoError = false;
        this.showSmallLogoError = false;
        this.autoCompleteSelectedUser = undefined;
        this.submitGeneralInfo = false;
        this.statusChangeConfirmation = false;
        this.canDeactivateStrategist = true;

    }

    selectLargeLogoFile(event) {

        this.showLargeLogoError = false;
        var largeLogoFile = event.target.files[0];


        if (this.isValidImageFormat(largeLogoFile.type)) {
            if (!this.isValidImageSize(largeLogoFile.size, 1024 * 1024)) {
                this.largeLogoUploadError = 'Max size of image is 1 Mb.'
                this.showLargeLogoError = true;
            } else {
                this.largeLogoFile = event.target.files[0];
                document.getElementById("largeLogo").setAttribute('src', URL.createObjectURL(largeLogoFile));
            }
        } else {
            this.largeLogoUploadError = 'Only images can be uploaded as logo.'
            this.showLargeLogoError = true;
        }

    }

    selectSmallLogoFile(event) {

        this.showSmallLogoError = false;
        var smallLogoFile = event.target.files[0];


        if (this.isValidImageFormat(smallLogoFile.type)) {
            if (!this.isValidImageSize(smallLogoFile.size, 1024 * 1024)) {
                this.smallLogoUploadError = 'Max size of image is 1 Mb.'
                this.showSmallLogoError = true;
            } else {
                this.smallLogoFile = event.target.files[0];
                document.getElementById("smallLogo").setAttribute('src', URL.createObjectURL(smallLogoFile));
            }
        } else {
            this.smallLogoUploadError = 'Only images can be uploaded as logo.'
            this.showSmallLogoError = true;
        }

    }



    ngAfterViewInit() {
        this.gridOptions.api.sizeColumnsToFit();
    }

    autoUserSearch(event) {
        this.strategistError = "";
        this._userService.getOrionUsers(event.query).map((response: Response) => <IUser[]>response.json())
            .subscribe(userResult => {
                this.filteredUserResult = userResult;

                if (this.strategist.users != undefined) {
                    this.strategist.users.forEach(element => {
                        this.filteredUserResult = this.filteredUserResult.filter(record => record.id != element.id);
                    });
                }
            });
    }

    handleSelectedUser(user) {
        this.isUserDetailValid = true;
        if (user.name) {
            this.btnDisableUser = false;

        } else {
            this.btnDisableUser = true;
        }
    }

    private getStrategistStatus() {
        this.ResponseToObjects<IStrategistStatus>(this._strategistService.getStrategistStatus())
            .subscribe(model => {
                this.strategistStatus = model;
                if (this.strategist.status != undefined) {
                    let str = this.strategistStatus.find(rec => rec.status == this.strategist.status);
                    if (str != undefined){
                        this.StrategistStatus = str.statusLabel;
                        this.StrategistStatusValue =str.status ;
                    }
                }
            });
    }

    private getUserRoleTypes() {

        this.ResponseToObjects<IUserRole>(this._strategistService.getUserRoles())
            .subscribe(model => {
                this.userRoles = model.filter(record => record.roleId != RoleType.SuperAdmin);//removing Super Admin role            
            });
    }

    private getStrategistDetail(strategistId) {
        this.responseToObject<IStrategist>(this._strategistService.getStrategistDetail(strategistId))
            .subscribe(model => {
                this.strategist = model;
                this.gridOptions.api.setRowData(this.strategist.users);
                this.gridOptions.api.sizeColumnsToFit();
                if (this.strategist.status != undefined) {
                    let str = this.strategistStatus.find(rec => rec.status == this.strategist.status);
                    if (str != undefined){
                        this.StrategistStatus = str.statusLabel;
                        this.StrategistStatusValue = str.status
                    }
                }
                if (this.strategist.smallLogo != undefined) {
                    document.getElementById("smallLogo").setAttribute('src', this.strategist.smallLogo);
                }
                if (this.strategist.largeLogo != undefined) {
                    document.getElementById("largeLogo").setAttribute('src', this.strategist.largeLogo);
                }
            },
            err => {
                var error = JSON.parse(err._body);
                this.strategistError = error.message;
            });

    }

    private addUser(user) {

        this.responseToObject<any>(this._strategistService.verifyUser(user.loginUserId))
            .subscribe(res => {
                if (res.isVerified == 1) {
                    this.showAddUserError = false;
                    this.addUserToStrategist(user);
                    this.autoCompleteSelectedUser = undefined;

                } else {
                    this.addUserError = res.message;
                    this.showAddUserError = true;
                }

                this.btnDisableUser = true;
            });

    }

    private addUserToStrategist(user) {

        var strategistUser = <IUser>{};
        strategistUser.id = user.userId;
        strategistUser.name = user.name;
        strategistUser.loginUserId = user.loginUserId;
        strategistUser.loginUserName = user.entityName;
        strategistUser.roleId = +this.userRoles[0].roleId;
        strategistUser.roleType = this.userRoles[0].roleType;
        strategistUser.userId = +user.userId;
        strategistUser.orionConnectExternalId = +user.userId;

        this.strategist.users.push(strategistUser);
        this.gridOptions.api.setRowData(this.strategist.users);
    }

    private deleteUser() {

        if (this.canDeleteUser()) {

            this.strategist.users = this.strategist.users.filter(record => record.id != this.selectedUserId);

            this.gridOptions.api.setRowData(this.strategist.users);
            this.displayConfirm = false;
        } else {

            this.displayConfirm = false;
            this.displayUserDeleteError = true;
        }

    }

    private canDeleteUser() {

        var user;

        this.strategist.users.forEach(element => {
            if (element.id == this.selectedUserId || element.userId == this.selectedUserId) {
                user = element;
            }
        });

        if (+user.roleId != RoleType.StrategistAdmin) {
            return true;
        } else {
            var adminUsers = this.strategist.users.filter(record => record.roleId == RoleType.StrategistAdmin);
            return (adminUsers.length > 1) ? true : false;
        }
    }

    private onStatusChange(status){
        if(status == StrategistStatus.NotActive && this.strategist.id != undefined){
            this.statusChangeConfirmation = true;            
        }
    }
    private confirmDeactivateStrategist(val){
        this.statusChangeConfirmation = false;//hide confirmation box

        if(val == 1)
            this.canDeactivateStrategist = true;
        else {
            this.canDeactivateStrategist = false;
            this.strategist.status = +this.StrategistStatusValue ;
        }      
    }

    private saveGeneralInfo(form) {
        this.saveError = "";
        this.showSaveError = false;
        if(this.canDeactivateStrategist){        
        if (this.strategist.status == StrategistStatus.Approved && this.strategist.id == undefined) {
            this.saveError = "Strategist can't be created with 'approved' status. ";
            this.showSaveError = true;
            return false;
        }
        this.submitGeneralInfo = true;
        this.isUserDetailValid = true;
        this.strategist.eclipseDatabaseId = +this.strategist.eclipseDatabaseId;
        this.strategist.status = + this.strategist.status;
        if (this.validateUserDetails() && form.valid) {
            if (this.strategistId != undefined) {
                this.responseToObject<IStrategist>(this._strategistService.updateStrategistProfile(this.strategist))
                    .subscribe(model => {
                        this.saveLogos();
                    },
                    err => {
                        var error = JSON.parse(err._body);
                        this.saveError = error.message;
                        this.showSaveError = true;
                    });
            } else {
                this.responseToObject<IStrategist>(this._strategistService.saveStrategist(this.strategist))
                    .subscribe(model => {
                        this.setStrategistId.emit(model.id);

                        this.strategistId = model.id;
                        this.saveLogos();
                    },
                    err => {
                        var error = JSON.parse(err._body);
                        this.saveError = error.message;
                        this.showSaveError = true;
                    });
            }
        }
      }
    }

    private saveLogos() {

        let apiArray = [];
        if (this.largeLogoFile != undefined) {
            apiArray.push(this._strategistService.uploadStrategistLargeLogo(this.largeLogoFile, this.strategistId));
        }
        if (this.smallLogoFile != undefined) {
            apiArray.push(this._strategistService.uploadStrategistSmallLogo(this.smallLogoFile, this.strategistId));
        }
        Observable.forkJoin(apiArray).subscribe(data => {
            this.navigateToOtherView.emit('commentary');
        });
        if (apiArray.length == 0) {
            this.navigateToOtherView.emit('commentary');
        }
    }

    // private cancel(form: FormGroup) {
    //     form.reset();
    //     var self = this
    //     setTimeout(function () {
    //         self.reset();
    //     }, 500);

    // }

    private validateUserDetails() {
        var isValid = false;
        if (this.strategist.users != undefined) {
            for (var i = 0; i < this.strategist.users.length; i++) {
                var user = this.strategist.users[i]
                if (user.roleId == RoleType.StrategistAdmin) { //Note: At least one user with Role “Admin” (i.e. Strategist Admin) should be associated with a Strategist not Super Admin 
                    isValid = true;
                    break;
                }
            }
        }

        this.isUserDetailValid = isValid;
        return isValid;

    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {

        if (targetElement.title === "Delete User") {
            this.selectedUserId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.displayConfirm = true;
        }

    }

    private createColumnDefs() {
        let self = this;

        this.columnDefs = [
            <ColDef>{
                headerName: "User ID", width: 50, headerTooltip: 'User ID', suppressMenu: true, suppressSorting: true, field: 'id',
                cellRenderer: this.userIdRenderer
            },
            <ColDef>{ headerName: "User Name", width: 150, headerTooltip: 'User Name', suppressMenu: true, suppressSorting: true, field: 'name' },
            <ColDef>{
                headerName: "Added ON", width: 100, headerTooltip: 'Added ON', suppressMenu: true, suppressSorting: true, field: 'createdOn',
                cellRenderer: this.dateRenderer
            },
            <ColDef>{
                headerName: "User Type/Role", width: 100, headerTooltip: 'User Type/Role', suppressMenu: true, suppressSorting: true, field: 'roleType',
                cellRenderer: function (params) {
                    return self.userRoleEditor(params, self);
                }
            },
            <ColDef>{ headerName: "User Role Id", width: 100, headerTooltip: 'User Role Id', suppressMenu: true, suppressSorting: true, hide: true, field: 'roleId' },
            <ColDef>{
                headerName: "Remove", width: 50, headerTooltip: 'Remove', suppressMenu: true, suppressSorting: true,
                cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ', hide: self.isViewMode
            }
        ];
    }

    private deleteCellRenderer(params) {

        var result = '<span>';
        if (params.node.data.id)
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete User"></i>';
        else
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.userId + ' value=' + params.node.data.userId + ' title="Delete User"></i>';
        return result;
    }

    private userIdRenderer(params) {

        if (params.node.data.userId == undefined) {
            return params.node.data.id;
        } else {
            return '';
        }
    }

    private labelRenderer(params, self, text) {
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eLabel = document.createTextNode(text == undefined ? '' : text);
        eCell.appendChild(eLabel);
        return eCell;
    }

    private getEclipseDbIds() {
        this.ResponseToObjects<IFirm>(this._strategistService.getFirmsByUser())
            .subscribe(model => {
                var data = model;
                // Add default value/ Global value
                //  this.firms.push({ firmId : 0 , database : "(None)"})
                data.unshift({ id: 0, database: "(None)" });
                this.eclipseDBIds = data;
            });
    }
    private userRoleEditor(params, self) {

        if (!self.isViewMode) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : params.value);
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");

            var list = self.userRoles;


            if (list != undefined) {
                list.forEach(function (item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.roleId);
                    eOption.innerHTML = item.roleType;
                    eSelect.appendChild(eOption);
                });
            }


            eSelect.value = params.data['roleId'];

            eCell.addEventListener('click', function () {

                if (!editing) {

                    eCell.removeChild(eLabel);
                    eCell.appendChild(eSelect);
                    eSelect.focus();
                    editing = true;
                }
            });

            eSelect.addEventListener('blur', function () {

                if (editing) {

                    editing = false;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                }
            });

            eSelect.addEventListener('change', function () {

                if (editing) {


                    editing = false;
                    var newValue = eSelect.value == undefined ? '' : eSelect.selectedOptions[0].textContent;
                    params.data[params.colDef.field] = newValue;
                    params.data['roleId'] = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);

                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);

                }
            });

            return eCell;
        } else {
            return self.labelRenderer(params, self, params.value);
        }
    }
}