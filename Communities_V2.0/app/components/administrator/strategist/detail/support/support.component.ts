import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategistSupportDetail } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { FormGroup } from '@angular/forms';



@Component({
    selector: 'community-strategist-support',
    templateUrl: './app/components/administrator/strategist/detail/support/support.component.html'
})
export class StrategistSupportComponent extends BaseComponent {
    
     private supportDetail : IStrategistSupportDetail = <IStrategistSupportDetail>{};
     private submitSupportDetail : boolean =false;
     
     
     @Input() strategistId: number;
     @Input() isViewMode: boolean;
     
     @Output() navigateToOtherView = new EventEmitter();
     
     constructor(private _strategistService : StrategistService){
        super();
        
        
     }
     
     ngOnInit(){
         
        this.reset();
        
     }
     
     private reset(){
         if(this.strategistId != undefined){
            this.getStrategistSupportDetail(this.strategistId);
        }else{
            this.supportDetail = <IStrategistSupportDetail>{};
            this.supportDetail.supportContact = "";
             this.supportDetail.supportEmail = "";
             this.supportDetail.supportPhone = "";
        }
        this.submitSupportDetail = false;
     }
     
     private getStrategistSupportDetail(strategistId){
        this.responseToObject<IStrategistSupportDetail>(this._strategistService.getStrategistSupportDetail(strategistId))
            .subscribe(model => {
               this.supportDetail = model;
         });
      
    }
    
    private saveSupportDetail(form){
        this.supportDetail.supportContact ==null? this.supportDetail.supportContact ="" : this.supportDetail.supportContact;
        this.supportDetail.supportEmail==null? this.supportDetail.supportEmail ="" : this.supportDetail.supportEmail;
        this.supportDetail.supportPhone==null? this.supportDetail.supportPhone ="" : this.supportDetail.supportPhone;
        this.submitSupportDetail = true;
        if(form.valid){
          this.responseToObject<IStrategistSupportDetail>(this._strategistService.updateStrategistSupportDetail(this.strategistId , this.supportDetail)) 
                .subscribe(model => {
                       this.submitSupportDetail = false;
                       this.navigateToOtherView.emit("legalAgreement");
                },
                err =>{
                     
                });
        }
    }
    
}