import { Component, Input } from '@angular/core';
import { TokenHelperService } from '../../core/tokenhelper.service';


@Component({
    selector: 'subscriptionbreadcrumb-breadcrumb',
    templateUrl: './app/shared/breadcrumb/subscriptionbreadcrumb.html',
    //  properties: ['pageName', 'firmId', 'firmName']
})
export class SubscriptionBreadcrumbComponent {
    @Input() pageName: string = '';
    isDashboard: boolean = false;
    firmId: number = 0;
    // firmName: string = 'Subscribe NAME';

    constructor() {
        let tokenhelper = new TokenHelperService();
    }
}
