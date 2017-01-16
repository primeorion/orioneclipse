import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { SecurityLeftNavComponent } from '../../../shared/leftnavigation/security.leftnav.component';
import { SecurityMaintenanceTabNavComponent } from '../../../shared/tabnavigation/security.maintenance.tabnav.component'
import { SecurityViewComponent } from './view/security.view.component';
import { SecurityDetailComponent } from './detail/security.detail.component';

@Component({
    selector: 'eclipse-security-maintenance',
    templateUrl: './app/components/security/securitymaintenance/security.maintenance.component.html'
})
export class SecurityMaintenanceComponent extends BaseComponent {
    
    private isSecurityView: boolean = true;
    private isEditSecurity: boolean = true ;
    private isSecuritySelected: boolean = false;
    private selectedSecurityId: number;
    private menuName: string = "Securities Maintenance";
    
}