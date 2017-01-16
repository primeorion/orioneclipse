import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-holding-filter',
    templateUrl: './app/components/holding/list/holdingfilter.component.html',
})

export class HoldingsFilterComponent {
    selectedHoldingParam: any;
    selectedTypeId: any;
    routeName: string;
    id: any;
    filterTypeId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {        
        this.routeName = Util.getRouteParam<string>(activateRoute, 'route');
        this.selectedHoldingParam = Util.getRouteParam<string>(activateRoute, 'type');
        this.selectedTypeId = Util.getRouteParam<number>(activateRoute, 'tid');
        this.id = Util.getRouteParam<number>(activateRoute);
        this.filterTypeId = Util.getRouteParam<number>(activateRoute, 'fid');
        this.selectedTypeId = parseInt(this.selectedTypeId);
        this.id = parseInt(this.id);

        let params: any[] = ['/eclipse/holding/'];
        if (this.routeName != undefined) {
            params.push(this.routeName);
        }
        if (this.selectedHoldingParam != undefined) {
            params.push(this.selectedHoldingParam);
        }
        if (this.selectedTypeId > 0) {
            params.push(this.selectedTypeId);
        }
        if (this.id > 0) {
            params.push(this.id);
        }
        if (this.filterTypeId > 0) {
            params.push(this.filterTypeId);
        }

        this._router.navigate(params);
    }
}