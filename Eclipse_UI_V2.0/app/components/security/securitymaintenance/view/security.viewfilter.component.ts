import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../../core/functions';

@Component({
    selector: 'eclipse-securityview-filter',
    templateUrl: './app/components/security/securitymaintenance/view/security.viewfilter.component.html',
})

export class SecurityViewFilterComponent {
    securityId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.securityId = +params['id'];
        });
        let params: any[] = ['/eclipse/security/maintenance/view'];
        if (this.securityId > 0) {
            params.push(this.securityId);
        }
        this._router.navigate(params);
    }
}