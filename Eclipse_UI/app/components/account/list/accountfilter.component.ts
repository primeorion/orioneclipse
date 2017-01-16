import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-account-filter',
    templateUrl: './app/components/account/list/accountfilter.component.html',
})

export class AccountFilterComponent {
    accountTypeId: number;
    accountId: number;
    route: string;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.route = Util.activeRoute(activateRoute);
        let params: any[] = ['/eclipse/account/list'];
        console.log("Current Route:", this.route);

        if (this.route === "filter") {
            this.accountTypeId = Util.getRouteParam<number>(activateRoute);
            if (this.accountTypeId > 0) {
                params.push(this.accountTypeId);
            }
        } else if (this.route === "search") {
            this.accountId = Util.getRouteParam<number>(activateRoute);
            params = ['/eclipse/account/view'];
            if (this.accountId > 0) {
                params.push(this.accountId);
            }
        }
        this._router.navigate(params);
    }
}