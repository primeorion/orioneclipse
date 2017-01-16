import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../../core/functions';

@Component({
    selector: 'eclipse-role-filter',
    templateUrl: './app/components/admin/role/view/rolefilter.component.html',
})

export class RoleFilterComponent {
    roleTypeId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.roleTypeId = +params['id'];
        });
        let params: any[] = ['/eclipse/admin/role/view'];
        if (this.roleTypeId > 0) {
            params.push(this.roleTypeId);
        }
        this._router.navigate(params);
    }
}
