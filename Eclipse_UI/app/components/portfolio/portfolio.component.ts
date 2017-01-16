
import { Component } from '@angular/core';
import { BaseComponent } from '../../core/base.component';

@Component({
    selector: 'eclipse-portfolio',
    templateUrl: './app/components/portfolio/portfolio.component.html'
})
export class PortfolioComponent extends BaseComponent {
    //canView: boolean = false;

    constructor() {
        super(PRIV_PORTFOLIOS);
        //this.canView = this.permission.canRead || this.permission.canUpdate;
        console.log('portfolio permission: ' + JSON.stringify(this.permission));
    }
}
