import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../../core/functions';

@Component({
    selector: 'eclipse-custodian-filter',
    templateUrl: './app/components/admin/custodian/view/custodianfilter.component.html',
})

export class CustodianFilterComponent {
    custodianTypeId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.custodianTypeId = +params['id'];
        });
        let params: any[] = ['/eclipse/admin/custodian/view'];
        if (this.custodianTypeId > 0) {
            params.push(this.custodianTypeId);
        }
        this._router.navigate(params);
    }
}