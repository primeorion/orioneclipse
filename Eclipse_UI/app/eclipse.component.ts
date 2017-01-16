import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { SessionHelper } from './core/session.helper';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';

@Component({
    selector: 'eclipse-layout',
    templateUrl: './app/eclipse.component.html',
    directives: [ROUTER_DIRECTIVES, DashboardLeftNavComponent]
})

export class EclipseComponent {
    displayName: string;

    constructor(private _sessionHelper: SessionHelper) {
        // console.log("from EclipseComponent constructor");
    }

    ngOnInit() {
        // console.log("from on init")
        let user = this._sessionHelper.getUser();
        // console.log("logged in user: ", user);
        if (user != null) {
            this.displayName = user.name;
        }
    }
}
