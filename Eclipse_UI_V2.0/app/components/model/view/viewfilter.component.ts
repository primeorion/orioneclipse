import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-modelview-filter',
    templateUrl: './app/components/model/view/viewfilter.component.html',
})

export class ModelViewFilterComponent {
    modelId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.modelId = +params['id'];
        });
        let params: any[] = ['/eclipse/model/view'];
        if (this.modelId > 0) {
            params.push(this.modelId);
        }
        this._router.navigate(params);
    }
}