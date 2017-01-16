import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import * as Util from '../../../core/functions';

@Component({
    selector: 'eclipse-portfolioview-filter',
    templateUrl: './app/components/portfolio/view/portfolioviewfilter.component.html',
})

export class PortfolioViewFilterComponent {
    portfolioId: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        //get param value when we clicked on progress bar in dashboard page
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.portfolioId = +params['id'];
        });
        let params: any[] = ['/eclipse/portfolio/view'];
        if (this.portfolioId > 0) {
            params.push(this.portfolioId);
        }
        this._router.navigate(params);
    }
}