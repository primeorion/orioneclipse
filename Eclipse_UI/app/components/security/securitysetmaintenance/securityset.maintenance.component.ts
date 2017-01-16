import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { SecurityLeftNavComponent } from '../../../shared/leftnavigation/security.leftnav.component';
import { SecuritySetViewComponent } from './view/securityset.view.component';
import { SecuritySetDetailComponent } from './detail/securityset.detail.component';

@Component({
    selector: 'eclipse-securityset-maintenance',
    templateUrl: './app/components/security/securitysetmaintenance/securityset.maintenance.component.html',
     directives: [SecurityLeftNavComponent , SecuritySetDetailComponent , SecuritySetViewComponent]
})
export class SecuritySetMaintenanceComponent extends BaseComponent {
    
    private isSecuritySetView: boolean = true;
    private isDetailEditMode: boolean = true;
    private isCopyMode:boolean = false;
    private selectedSecuritySetId: number;
    @ViewChild(SecuritySetDetailComponent) securitySetDetails: SecuritySetDetailComponent;
    @ViewChild(SecuritySetViewComponent) securitySetView: SecuritySetViewComponent;
    
    private editSecurity(event){
        this.selectedSecuritySetId = event.id;
        this.isDetailEditMode = event.isDetailEditMode;
        this.isCopyMode = event.isCopyMode;
        this.isSecuritySetView = false;
    }
    
    private navigateToSecuritySetDetail(){
        
        if(this.isSecuritySetView){
            this.selectedSecuritySetId = undefined;
            this.isDetailEditMode = true;
            this.isCopyMode = false;
            this.isSecuritySetView = false; 
        }
        
    }
    
    private performViewEditActionOnSecuritySet(isEditSecuritySet){
        this.isDetailEditMode = isEditSecuritySet;
        if(!this.isSecuritySetView && this.securitySetDetails != undefined){
            this.securitySetDetails.refreshGrid(this.isDetailEditMode,this.selectedSecuritySetId);
        }else{
           this.isSecuritySetView = false; 
        }
        
    }
    
    private deleteSecurity(){
        this.securitySetView.performDeleteAction(this.selectedSecuritySetId);
    }
    
    private setSelectedSecuritySet(id){
        this.selectedSecuritySetId = id;
    }
    
    private displaySecuritySetList(){
        this.selectedSecuritySetId = undefined;
        this.isSecuritySetView = true;
    }
}