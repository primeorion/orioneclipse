import { Component,Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { TokenHelperService } from '../../core/tokenhelper.service';
import { IUser } from '../../models/user';

@Component({
    selector: 'breadcrumb',
    templateUrl: './app/shared/breadcrumb/breadcrumb.html',
   // properties: ['pageName','firmId', 'firmName']
})
export class BreadcrumbComponent extends BaseComponent {
    @Input() pageName: string = '';
    isDashboard: boolean = false;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';
    private isSuperAdmin : boolean;
    
    constructor(){
        super();
        let tokenhelper = new TokenHelperService();
        let user = <IUser>tokenhelper.getUser();
        this.firmId = user.firmId;
        this.firmName = user.firmName;
        this.isSuperAdmin = (this.roleTypeId == RoleType.SuperAdmin);
    }
}
