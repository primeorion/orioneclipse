import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-models-filter',
    templateUrl: './app/components/model/list/filter.component.html',
})

export class ModelsFilterComponent {
    modelTypeId: number;
    modelId: number;
    route: string;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        // this.activateRoute.params.subscribe(params => {
        //     if (params['id'] != undefined)
        //         this.modelTypeId = +params['id'];
        // });
        // let params: any[] = ['/eclipse/model/list'];
        // if (this.modelTypeId > 0) {
        //     params.push(this.modelTypeId);
        // }
        // this._router.navigate(params);

        /**-------------------------- NEW--------------------------------- */
        //get param value when we clicked on progress bar in dashboard page
        this.route = Util.activeRoute(activateRoute);
        let params: any[] = ['/eclipse/model/list'];
        console.log("Current Route:", this.route);

        if (this.route === "filter") {
            this.modelTypeId = Util.getRouteParam<number>(activateRoute);
            if (this.modelTypeId > 0) {
                params.push(this.modelTypeId);
            }
        } else if (this.route === "search") {
            this.modelId = Util.getRouteParam<number>(activateRoute);
            params = ['/eclipse/model/view'];
            if (this.modelId > 0) {
                params.push(this.modelId);
            }
        }
        this._router.navigate(params);
    }
}