import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../../core/functions';

@Component({
    selector: 'eclipse-users-filter',
    templateUrl: './app/components/admin/user/view/userfilter.component.html',
})

export class UserFilterComponent {
    userTypeId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.userTypeId = +params['id'];
        });
        let params: any[] = ['/eclipse/admin/user/view'];
        if (this.userTypeId > 0) {
            params.push(this.userTypeId);
        }
        this._router.navigate(params);
    }
}