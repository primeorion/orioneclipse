
import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';

import * as Util from '../../../core/functions';
import { IUIPrivilege } from '../../../viewmodels/ui.privileges';


@Component({
    selector: 'eclipse-security-dashboard',
    templateUrl: './app/components/security/dashboard/dashboard.component.html'
})
export class SecuritytDashboardComponent extends BaseComponent {
    
    private uiprivilege: IUIPrivilege;
    
    constructor(){
        super();
        this.uiprivilege = <IUIPrivilege>{};
        this.uiprivilege.security = Util.getPermission(PRIV_SECURITIES);
        this.uiprivilege.hasSecurities = (this.uiprivilege.security != undefined) && (this.uiprivilege.security.canAdd || this.uiprivilege.security.canDelete || this.uiprivilege.security.canRead || this.uiprivilege.security.canUpdate);
    }
    
}
