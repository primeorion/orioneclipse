
import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES } from '@angular/router';
import { BaseComponent } from '../../core/base.component';


@Component({
    selector: 'dashboard-leftnav',
    templateUrl: './app/shared/leftnavigation/dashboard.leftnav.component.html',
    //directives: [ROUTER_DIRECTIVES]
})
export class DashboardLeftNavComponent extends BaseComponent {
    private isSuperOrStrategistAdmin: boolean;
    private isStrategistAdminOrUser: boolean;
    private isAdvisorOrFirm: boolean;
    constructor() {
        super();
        this.isSuperOrStrategistAdmin = (this.roleTypeId == RoleType.SuperAdmin ||
            this.roleTypeId == RoleType.StrategistAdmin);
        this.isStrategistAdminOrUser = (this.roleTypeId == RoleType.StrategistAdmin ||
            this.roleTypeId == RoleType.StrategistUser);
                        
        //Subscription menu access to the users logged in from Eclipse application.                  
        let val = this._tokenHelper.getAccessToken('EclipseUser');
        if(val != undefined)
            this.isAdvisorOrFirm = val;

    }
}
