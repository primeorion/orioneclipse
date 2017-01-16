import { Component } from '@angular/core';
import { SessionHelper } from '../../core/session.helper';

@Component({
    selector: 'breadcrumb',
    templateUrl: './app/shared/breadcrumb/breadcrumb.html',
    properties: ['pageName', 'isDashboard', 'firmId', 'firmName']
})
export class BreadcrumbComponent {
    pageName: string = 'Dashboard';
    isDashboard: boolean = false;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';

    constructor(){
        let sessionHelper = new SessionHelper();
        let user = sessionHelper.getUser();
        this.firmId = user.firmId;
        this.firmName = user.firmName;
    }
}
