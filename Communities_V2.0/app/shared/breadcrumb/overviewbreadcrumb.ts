import { Component, Input } from '@angular/core';
import { TokenHelperService } from '../../core/tokenhelper.service';
import { IUser } from '../../models/user';

@Component({
    selector: 'overview-breadcrumb',
    templateUrl: './app/shared/breadcrumb/overviewbreadcrumb.html',
    //  properties: ['pageName', 'firmId', 'firmName']
})
export class OverviewBreadcrumbComponent {
    @Input() pageName: string = '';
    isDashboard: boolean = false;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';

    constructor() {
        let tokenhelper = new TokenHelperService();
        let user = <IUser>tokenhelper.getUser();
        this.firmId = user.firmId;
        this.firmName = user.firmName;
    }
}
