import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES } from '@angular/router';
import { Router } from '@angular/router';
import { TokenHelperService } from './core/tokenhelper.service';
import { IUser } from './models/user';
//import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';

@Component({
    selector: 'community-layout',
    templateUrl: './app/community.component.html',
   // directives: [ROUTER_DIRECTIVES, DashboardLeftNavComponent]
})

export class CommunityComponent {
    displayName: string;

    constructor(private _router: Router, private _tokenHelper: TokenHelperService) {
        console.log("from DashboardComponent constructor");
    }

    ngOnInit() {
        console.log("from on init")
        let user = this._tokenHelper.getUser<IUser>();
        console.log("logged in user: ", user);
        if (user != null) {
            this.displayName = user.name;
        }
    }
}
