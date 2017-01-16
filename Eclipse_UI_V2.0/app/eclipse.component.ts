import { Component, Injectable, Inject, ViewChild, AfterViewInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BaseComponent } from './core/base.component';

import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { NotificationsService, SimpleNotificationsComponent, PushNotificationsService } from 'angular2-notifications';
import { NotificationService } from './services/notification.service';
import { FirmService } from './services/firm.service';
import { UserService } from './services/user.service';
import { GlobalSearchService } from './services/globalSearch.service';
import { ILogin } from './login/login';
import * as io from 'socket.io-client';
import { NotificationComponent } from './shared/notification/notification.component';
import { IRole } from './models/role';
import { IUser, ICustomUser } from './models/user';
import { IFirmProfile } from './models/firm';
import { ILoginAs } from './models/loginas';
import { IGlobalSearchResults } from './models/globalSearch';
import { SharedModule } from './shared/shared.module';
import { IUIPrivilege } from './viewmodels/ui.privileges';
import * as Util from './core/functions';
import { LoginAsService } from './services/loginas.service';

declare var $: any;

@Component({
    // selector: 'eclipse-layout',
    templateUrl: './app/eclipse.component.html',
    providers: [GlobalSearchService, LoginAsService]
})

// @Injectable()
export class EclipseComponent extends BaseComponent implements AfterViewInit {
    connection;
    uiprivilege: IUIPrivilege;
    role: IRole;
    user: IUser;
    firmProfile: IFirmProfile;
    displayFirmProfile: boolean = false;
    displayName: string;
    @ViewChild(NotificationComponent) notificationComponent: NotificationComponent;

    selectedSearchResult: string;
    searchSuggestions: IGlobalSearchResults[] = [];
    searchResults: IGlobalSearchResults[] = [];
    showSearchModuleOptions: boolean = false;
    showSearchOptionsFlag: boolean = false;

    displayAddActivity: boolean = false;
    displayLogo: boolean = false;

    file_srcs: string[] = [];
    files: any[] = [];
    selectedFile: File;
    imagePath: any;
    private checkUploadFile: boolean = true;
    private disableUploadBtn: boolean = true;
    private checkDragFile: boolean = false;
    private profileImage: any;
    private fileUploadError: string;
    private showFileUploadError: boolean = false;
    private dragFileName: string;
    private isProfileImage: boolean = false;
    private userProfile: IUser = <IUser>{};
    private displayUserProfile: boolean;
    private displayLoginAs: boolean = false;
    loginAsInfo: ILoginAs = <ILoginAs>{};
    token: ILogin;
    loginAsErrorMessage: string;

    //Global Search Options Checkboxes
    @ViewChild('searchOptionsDropdown') searchOptionsDropdown;
    selectAll: boolean = true;
    selectPortfolios: boolean = true;
    selectAccounts: boolean = true;
    selectHoldings: boolean = true;
    selectModels: boolean = true;
    selectTrades: boolean = true;
    selectSecurities: boolean = true;
    selectAdministrator: boolean = true;
    selectDataQuery: boolean = true;
    selectRebalancer: boolean = true;
    selectedOptions: string[] = [];


    private editUser: ICustomUser = <ICustomUser>{};
    msgCount = 0;
    noticount = 0;

    notificationCount = 0;
    public options = {
        timeOut: 5000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: 'visible',
        rtl: false,
        animate: 'scale',
        position: ['right', 'bottom']
    };
    constructor(private _router: Router, private element: ElementRef, @Inject('ApiEndpoint') private _apiEndpoint: string,
        private _firmService: FirmService,
        private _userService: UserService,
        private _globalSearchService: GlobalSearchService,
        private _loginAsService: LoginAsService) {
        super();
        this.firmProfile = <IFirmProfile>{};
        document.addEventListener('click', this.offClickHandler.bind(this));
    }
    ngOnInit() {
        $.material.init();
        // this.user = this._sessionHelper.getUser();

        // this.setUserProfile();
        // this.role = this._sessionHelper.getUser().role;
        // this.uiprivilege = <IUIPrivilege>{};
        // this.uiprivilege.isFirmAdmin = (this.role.roleTypeId == UserType.FirmAdmin);
        // if (this.uiprivilege.isFirmAdmin) {
        //     //Get Firm Profile.
        //     this.getFirmProfile();
        // }
        // this.uiprivilege.isUser = (this.role.roleTypeId == UserType.User);
        this.loadLayout();
    }
    /** Load layout screen data at componnet intialization time */
    loadLayout() {

        this.user = this._sessionHelper.getUser();
        this.setUserProfile();
        this.role = this._sessionHelper.getUser().role;
        this.uiprivilege = <IUIPrivilege>{};
        this.uiprivilege.isFirmAdmin = (this.role.roleTypeId == UserType.FirmAdmin);
        if (this.uiprivilege.isFirmAdmin) {
            //Get Firm Profile.
            this.getFirmProfile();
        }
        this.uiprivilege.isUser = (this.role.roleTypeId == UserType.User);
    }
    /** AutoComplete Search All Modules by name or id */
    loadSearchSuggestions(event) {
        this.showSearchModuleOptions = false;
        if (event.query != '') {
            this.selectedOptions = [];
            if (this.selectAll)
                this.selectedOptions.push("All");
            if (this.selectPortfolios)
                this.selectedOptions.push("Portfolios");
            if (this.selectAccounts)
                this.selectedOptions.push("Accounts");
            if (this.selectHoldings)
                this.selectedOptions.push("Holdings");
            if (this.selectModels)
                this.selectedOptions.push("Models");
            if (this.selectTrades)
                this.selectedOptions.push("Trades");
            if (this.selectSecurities)
                this.selectedOptions.push("Securities");
            if (this.selectAdministrator)
                this.selectedOptions.push("Administrator");
            if (this.selectDataQuery)
                this.selectedOptions.push("DataQuery");
            if (this.selectRebalancer)
                this.selectedOptions.push("Rebalancer");

            this.searchSuggestions = this._globalSearchService.getGlobalDataSearchResults(event.query.toLowerCase(), this.selectedOptions);
        }
        else {
            this.searchSuggestions = [];
        }
    }

    offClickHandler(event: any) {
        if (!this.searchOptionsDropdown.nativeElement.contains(event.target) && !this.showSearchOptionsFlag) { // check click origin
            this.showSearchModuleOptions = false;
        }

        this.showSearchOptionsFlag = false;
    }

    toggleAll(option, $event) {
        this.selectPortfolios = !this.selectAll;
        this.selectAccounts = !this.selectAll;
        this.selectHoldings = !this.selectAll;
        this.selectModels = !this.selectAll;
        this.selectTrades = !this.selectAll;
        this.selectSecurities = !this.selectAll;
        this.selectAdministrator = !this.selectAll;
        this.selectDataQuery = !this.selectAll;
        this.selectRebalancer = !this.selectAll;
    }

    toggleSearchOptions(option, $event) {
        if (!$event.target.checked)
            this.selectAll = false;
        else {
            var selectPortfoliosOption = this.selectPortfolios || (option == "Portfolios");
            var selectAccountsOption = this.selectAccounts || (option == "Accounts");
            var selectHoldingsOption = this.selectHoldings || (option == "Holdings");
            var selectModelsOption = this.selectModels || (option == "Models");
            var selectTradesOption = this.selectTrades || (option == "Trades");
            var selectSecuritiesOption = this.selectSecurities || (option == "Securities");
            var selectAdministratorOption = this.selectAdministrator || (option == "Administrator");
            var selectDataQueryOption = this.selectDataQuery || (option == "Data Query");
            var selectRebalancerOption = this.selectRebalancer || (option == "Rebalancer");

            if (selectPortfoliosOption && selectAccountsOption && selectHoldingsOption &&
                selectModelsOption && selectTradesOption && selectSecuritiesOption && selectAdministratorOption
                && selectDataQueryOption && selectRebalancerOption) {
                this.selectAll = true;
            }
        }
    }

    handleDropdown(event) {
        //event.query = current value in input field
        this.showSearchModuleOptions = !this.showSearchModuleOptions;
        this.showSearchOptionsFlag = this.showSearchModuleOptions;
    }

    /** Fires on select search Result from global search */
    onSearchSelect(params: any) {
        /*this.getPortfolioDetailsById(params.id);*/

        this._router.navigate([params.routeUrl]);
        this.selectedSearchResult = "";
    }

    setUserProfile() {
        if (this.user != null) {
            this.displayName = this.user.name;
            this.userProfile.name = this.user.name;
            this.userProfile.email = this.user.email;

            console.log("ngOnInit:" + JSON.stringify(this.user.userLogo));
        }
    }
    ngAfterViewInit() {
        this.msgCount = this.notificationComponent.msgCount;
    }
    getNotificationCount(e) {
        this.msgCount = e;
    }
    ShowProfilePopup() {
        this.displayLogo = true;
        this.displayFirmProfile = true;
    }
    showUserProfile() {
        this.displayUserProfile = true;
        this.user = this._sessionHelper.getUser();
    }
    /** FileUpload Control */

    /** To dragFile */
    dragFile(event) {

        event.preventDefault();
        event.stopPropagation();
    }

    /** To drop file */
    dropFile(event) {
        let that = this;
        this.displayLogo = true;
        //var image = this.element.nativeElement.querySelector('.image');
        if (event.dataTransfer.files.length != 1) {
            this.fileUploadError = 'Only one file can be uploaded at a time.'
            this.showFileUploadError = true;
        } else {
            this.checkDragFile = true;
            this.dragFileName = event.dataTransfer.files[0].name;
            this.selectedFile = event.dataTransfer.files[0];
            // Create a FileReader
            var reader: any, target: EventTarget;
            reader = new FileReader();
            reader.onload = function (e) {
                //  this.displayLogo = true;
                that.imagePath = e.target.result;
            };

            this.selectedFile = event.dataTransfer.files[0];
            // read the image file as a data URL.
            reader.readAsDataURL(event.dataTransfer.files[0]); this.checkUploadFile = false;
        }
        event.preventDefault();
        event.stopPropagation();
        // this.displayLogo = true;


    }

    /** To select template */
    onChangeLogo() {
        this.selectedFile = null;
        //this.imagePath = "";
        this.displayLogo = false;
    }
    onCancel() {
        this.displayFirmProfile = this.displayLogo = false;
        this.imagePath = "";
        this.getFirmProfile();
    }
    getFirmProfile() {
        Util.responseToObject<IFirmProfile>(this._firmService.getFirmProfile())
            .subscribe(firm => {
                this.firmProfile = firm;
                if (this.firmProfile.imagePath != "" || this.firmProfile.imagePath != null) {
                    this.imagePath = this.firmProfile.imagePath,
                        this.displayLogo = true;
                }
            });
    }
    saveProfile() {
        return this._firmService.updateFirmProfile(this.selectedFile, this.firmProfile.name)
            .subscribe(firm => {
                this.firmProfile = firm;
                this.firmProfile.name = firm.name;
                this.displayFirmProfile = false;
            },
            error => (console.log(error))
            );
    }
    saveUserProfile() {
        if (!this.isValid()) {
            this.showFileUploadError = true;
            this.fileUploadError = "No fields changed to update the profile.";
            this.displayUserProfile = true;
        }
        if (this.userProfile.userLogo != undefined && this.profileImage) {
            this._userService.updateUserProfileImage(this.profileImage)
                .subscribe(usr => {
                    this.user.userLogo = usr.imagePath;
                    this.isProfileImage = false;
                    this.displayUserProfile = false;
                },
                error => (console.log("Update Failed:" + JSON.stringify(error))));
        }
        if (this.userProfile.name != this.user.name || this.userProfile.email != this.user.email) {
            this.editUser.teamIds = [];
            this.user.teams.forEach(element => {
                this.editUser.teamIds.push(element.id);
            });
            this.editUser.name = this.user.name;
            this.editUser.email = this.user.email;
            this.editUser.startDate = this.formatDate(this.user.startDate);
            this.editUser.expireDate = this.formatDate(this.user.expireDate);
            this.editUser.id = this.user.id;
            this.editUser.userLoginId = this.user.userLoginId;

            if (this.user.role != null)
                this.editUser.roleId = this.user.role.id;
            else
                this.editUser.roleId = 0;

            this.editUser.status = this.user.status;

            return this._userService.updateUser(this.user.id, this.editUser)
                .subscribe(usr => {
                    this.displayUserProfile = false;
                    this.getUserData();
                    //Update email in notification preferences tab
                    this.notificationComponent.userEmail = this.user.email;
                },
                error => (console.log("Update Failed:" + JSON.stringify(error))));
        }

    }
    selectProfileImage(event, isFirmProfile: boolean = false) {
        let that = this;
        if (!isFirmProfile) { //UserProfile
            this.isProfileImage = false;
            this.profileImage = event.target.files[0];
            if (!this.isValidImageFormat(this.profileImage.type)) {
                {
                    this.showFileUploadError = true;
                    this.fileUploadError = "Upload only image.";
                    this.displayUserProfile = true;
                }
            } else {
                this.isProfileImage = true;
                this.userProfile.userLogo = event.target.files[0].name;
                this.showFileUploadError = false;
            }
        }
        else {//FirmProfile
            this.displayLogo = true;
            this.selectedFile = event.target.files[0];
            if (!this.isValidImageFormat(this.selectedFile.type)) {
                this.showFileUploadError = true;
                this.displayLogo = false;
                this.fileUploadError = "Upload only image.";
                this.displayFirmProfile = true;
            }
            else {
                var reader: any, target: EventTarget;
                reader = new FileReader();
                reader.onload = function (event) {
                    that.imagePath = event.target.result;
                };
                // read the image file as a data URL.
                this.selectedFile = event.target.files[0];
                reader.readAsDataURL(event.target.files[0]); this.checkUploadFile = false;
                this.showFileUploadError = false;
                this.displayLogo = true;
            }
        }
    }
    isValidImageFormat(fileType) {
        return (fileType.split('/')[0] == 'image');
    }

    closeUserModal() {
        this.showFileUploadError = false;
        this.isProfileImage = false;
        this.profileImage = undefined;
        this.userProfile.userLogo = "";
        this.displayUserProfile = false;

    }

    dragProfileImage(event) {
        event.preventDefault();
        event.stopPropagation();

    }
    dropProfileImage(event) {
        this.profileImage = event.dataTransfer.files[0];
        if (event.dataTransfer.files.length != 1) {
            this.fileUploadError = 'Only one image can be uploaded.'
            this.showFileUploadError = true;
            this.displayUserProfile = true;
        }
        else if (!this.isValidImageFormat(this.profileImage.type)) {
            this.fileUploadError = 'Upload Only Image.'
            this.showFileUploadError = true;
            this.displayUserProfile = true;
        }
        else {
            //this.showFileUploadError = false;
            this.isProfileImage = true;
            this.userProfile.userLogo = this.profileImage.name;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    isValid() {
        if (this.user.name == this.userProfile.name && this.user.email == this.userProfile.email
            && this.profileImage == undefined)
            return false;
        else {
            return true;
        }
    }
    getUserData() {
        /** load user data */
        this.responseToObject<IUser>(this._userService.getUser())
            .subscribe(user => {
                if (user != null)
                    this.displayName = this.user.name;
                if (user.role != null && user.role != undefined) {
                    this._sessionHelper.set('user', user);
                    this.user = this._sessionHelper.getUser();
                    this.setUserProfile();
                    // console.log("user: " + JSON.stringify(user));
                    //this._sessionHelper.set('role', user.role);
                } else {
                    //console.log("");
                }
            },
            error => {
                console.log("error occured while fetching user details." + JSON.stringify(error));
            });
    }

    /** Start of LoginAs Code */
    loginAs() {
        this.responseToObject<ILogin>(this._loginAsService.loginAs(this.loginAsInfo)).subscribe(model => {
            this.setTokenInfo(model);  /** setting token info */

            this.updateUserInfo();     /** setting user information */
        },
            error => {
                this.loginAsErrorMessage = error.message; /**showing login as error message */
            });
    }
    closeLoginAsModal() {
        this.loginAsErrorMessage = "";
        this.loginAsInfo = <ILoginAs>{};
        this.displayLoginAs = false;
    }
    setTokenInfo(tokenInfo: ILogin) {
        this.token = tokenInfo;
        this.token.isAuthenticated = true;
        this._sessionHelper.set('accessTokenInfo', this.token);
    }
    /** load user data */
    updateUserInfo() {
        this.responseToObject<IUser>(this._userService.getUser())
            .subscribe(user => {
                if (user.role != null && user.role != undefined) {
                    this._sessionHelper.set('user', user);
                    this._sessionHelper.set('role', user.role);
                    this.user = user;
                    this.loadLayout();
                    this.closeLoginAsModal();
                    //this.loadLayout();  /** setting layout screen based on user */
                    this._router.navigate(['loginAs']);
                }
            },
            error => {
                console.log(error);
            });
    }
    revertLoginAs() {
        this.responseToObject<ILogin>(this._loginAsService.revertLoginAs()).subscribe(model => {
            this.setTokenInfo(model);  /** setting token info */
            this.updateUserInfo();     /** setting user information */
        });
    }
    /**End of LoginAs Code */

    showUserData() {        
        this.user = this._sessionHelper.getUser();
        this.displayUserProfile = true;

    }

}
