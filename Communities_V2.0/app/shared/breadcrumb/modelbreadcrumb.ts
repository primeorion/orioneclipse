import { Component, Input } from '@angular/core';
import { TokenHelperService } from '../../core/tokenhelper.service';


@Component({
    selector: 'model-breadcrumb',
    templateUrl: './app/shared/breadcrumb/overviewbreadcrumb.html',
    //  properties: ['pageName', 'firmId', 'firmName']
})
export class ModelBreadcrumbComponent {
    @Input() pageName: string = '';
    isDashboard: boolean = false;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';

    constructor() {
        let tokenhelper = new TokenHelperService();
    }
}
