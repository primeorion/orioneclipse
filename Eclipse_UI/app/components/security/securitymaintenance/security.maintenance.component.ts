import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { SecurityLeftNavComponent } from '../../../shared/leftnavigation/security.leftnav.component';
import { SecurityMaintenanceTabNavComponent } from '../../../shared/tabnavigation/security.maintenance.tabnav.component'
import { SecurityViewComponent } from './view/security.view.component';
import { SecurityDetailComponent } from './detail/security.detail.component';

@Component({
    selector: 'eclipse-security-maintenance',
    templateUrl: './app/components/security/securitymaintenance/security.maintenance.component.html',
     directives: [SecurityLeftNavComponent , SecurityViewComponent , SecurityDetailComponent]
})
export class SecurityMaintenanceComponent extends BaseComponent {
    
    private isSecurityView: boolean = true;
    private isEditSecurity: boolean = true ;
    private isSecuritySelected: boolean = false;
    private selectedSecurityId: number;
    @ViewChild(SecurityDetailComponent) securityDetails: SecurityDetailComponent;
    @ViewChild(SecurityViewComponent) securityView: SecurityViewComponent;
    
    private navigateToSecurityDetail(){
        
        if(this.isSecurityView){
            this.selectedSecurityId = undefined;
            this.isEditSecurity = true;
            this.isSecurityView = false;
        }
    }
    
    private viewSecurityDetail(event){
        this.selectedSecurityId = event.id;
        this.isEditSecurity = event.isEdit;
        this.isSecurityView = false;
    }
    
    private performViewEditActionOnSecurity(isEditSecurity){
        this.isEditSecurity = isEditSecurity;
        this.isSecurityView = false;
        if(this.securityDetails != undefined){
            this.securityDetails.refreshView(this.selectedSecurityId , this.isEditSecurity);
        }
    }
    
    private deleteSecurity(){
        this.securityView.performDeleteAction(this.selectedSecurityId);
    }
    
    private setSelectedSecurity(id){
        this.selectedSecurityId = id;
    }
    
    private displaySecurityList(event){
        this.selectedSecurityId = undefined;
        this.isSecurityView = true;
        
    }
}