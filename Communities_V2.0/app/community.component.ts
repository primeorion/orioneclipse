import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES } from '@angular/router';
import { Http, Response } from '@angular/http';
import { BaseComponent } from './core/base.component';
import { Router } from '@angular/router';
import { TokenHelperService } from './core/tokenhelper.service';
import { UserService } from './services/user.service';
import { StrategistService } from './services/strategist.service';
import { IStrategist } from './models/strategist';
import { IUser } from './models/user';
import { ICommunityUser, IUserProfile } from './models/community.user';
//import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';

@Component({
    selector: 'community-layout',
    templateUrl: './app/community.component.html',
    // directives: [ROUTER_DIRECTIVES, DashboardLeftNavComponent]
})

export class CommunityComponent {
    displayName: string;
    private user: ICommunityUser = <ICommunityUser>{};
    private logoName: string;
    private displayUserProfile: boolean;
    private isCheckLogo: boolean = false;
    private profileImagePath: string;
    private logoPath: string;
    private profileLogo: any;
    private homeLinkRoute: string;
    private profileName: string;
    private file: IUserProfile = <IUserProfile>{};
    private profileError: string;
    private showProfileError: boolean;
    private isEclipseUser : boolean = false;


    constructor(private _router: Router, private _tokenHelper: TokenHelperService,
        private _userService: UserService, private _strategistService: StrategistService) {
        console.log("from DashboardComponent constructor");
        let val = this._tokenHelper.getAccessToken('EclipseUser');
        if(val != undefined)
            this.isEclipseUser = val;
    }

    ngOnInit() {
        console.log("from on init")
        let user = this._tokenHelper.getUser<ICommunityUser>();
        console.log("logged in user: ", user);
        this.profileName = user.name;
        // let tokenhelper = new TokenHelperService();
        // let userDetails = <IUser>tokenhelper.getUser(); //IUser

        if (user != null) {
            this.displayName = user.name;
            if (user.url != "")
                this.profileImagePath = user.url;
            else
                this.profileImagePath = "app/assets/img/user-avatar32x32.png";
        }

        if (user.roleId == RoleType.StrategistAdmin || user.roleId == RoleType.StrategistUser) {
            let comUser = this._tokenHelper.getUser<IUser>();
            this._strategistService.getStrategistDetail(comUser.strategistId)
                .map((response: Response) => <IStrategist>response.json())
                .subscribe(model => {                    
                    this.logoPath = model.smallLogo;
                })
        }
        else
            this.logoPath = "../app/assets/img/orion-logo.png";

        //Logo Url 
        if (user.roleId == RoleType.SuperAdmin) {
            this.homeLinkRoute = "administrator/dashboard";
        }
        else if (user.roleId == RoleType.StrategistAdmin || user.roleId == RoleType.StrategistUser) {
            this.homeLinkRoute = "overview/aumfirm";
        }
        else {
            this.homeLinkRoute = "subscription/profiles";
        }
        if (user != null) {
            this.displayName = user.name;

        }
    }
    /** Selected profile logo */
    selectProfileLogo(event) {
        this.isCheckLogo = false;

        if (!this.isValidImageFormat(event.target.files[0].type)) {
            this.profileError = 'Only images can be uploaded as logo.';
            this.showProfileError = true;
        } else {
            this.showProfileError = false;
            this.file.logo = event.target.files[0];
            this.isCheckLogo = true;
            this.logoName = event.target.files[0].name;
        }

    }
    /** Validate Image */
    isValidImageFormat(fileType) {
        return (fileType.split('/')[0] == 'image');
    }
    /**Save profile Info */
    saveProfile() {
        let userInfo = this._tokenHelper.getUser<ICommunityUser>();
        if (this.logoName || (this.profileName != "" && this.profileName != undefined && userInfo.name != this.profileName)) {
            this.file.name = this.profileName;
            this._userService.uploadUserProfileLogoAndName(this.file)
                .subscribe(user => {
                    this.displayName = user.name;
                    this.profileImagePath = user.url;
                    this._tokenHelper.setAccessToken('user', user);
                    this.displayUserProfile = false;
                    this.isCheckLogo = false;
                },
                error => {
                    this.profileError = JSON.parse(error).message;
                    this.showProfileError = true;
                });
        }
        else {
            this.profileError = "No fields changed to update the profile."
            this.showProfileError = true;
        }
    }
    /**Close and Clear Pop up */
    close() {
        this.isCheckLogo = false;
        this.displayUserProfile = false;
    }
    dragFile(event) {
        event.preventDefault();
        event.stopPropagation();

    }
    dropFile(event) {
        if (event.dataTransfer.files.length != 1) {
            this.profileError = 'Only one logo can be uploaded.'
            this.showProfileError = true;
        }
        else if (!this.isValidImageFormat(event.dataTransfer.files[0].type)) {
            this.profileError = 'Only images can be uploaded as logo.';
            this.showProfileError = true;
        }
        else {
            this.file.logo = event.dataTransfer.files[0];
            this.showProfileError = false;
            this.isCheckLogo = true;
            this.logoName = event.dataTransfer.files[0].name;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    showProfile() {
        this.showProfileError = false;
        this.displayUserProfile = true
    }
}
