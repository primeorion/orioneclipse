import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-portfolios-filter',
    templateUrl: './app/components/portfolio/list/portfoliofilter.component.html',
})

export class PortfoliosFilterComponent {
    portfolioTypeId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.portfolioTypeId = +params['id'];
        });
        let params: any[] = ['/eclipse/portfolio/list'];
        if (this.portfolioTypeId > 0) {
            params.push(this.portfolioTypeId);
        }
        this._router.navigate(params);
    }
}