import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { IAdministratorLeftMenu } from '../../viewmodels/administrator.leftmenu';
import { RouterModule, Router} from '@angular/router';

@Component({
    selector: 'community-overview-leftnav',
    templateUrl: './app/shared/leftnavigation/overview.leftnav.component.html'
})
export class OverviewLeftNavComponent extends BaseComponent {
    @Input() model: IAdministratorLeftMenu = <IAdministratorLeftMenu>{};
    existingLabel: string = 'Existing';
    newLabel: string = 'New';

    constructor(private router: Router) {
        super();
    }

    getLinkStyle(path) {
        return this.router.url.indexOf(path) > -1;
    }

}