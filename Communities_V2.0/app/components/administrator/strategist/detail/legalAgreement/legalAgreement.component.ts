import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategistAgreement } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { FormGroup } from '@angular/forms';


@Component({
    selector: 'community-strategist-agreement',
    templateUrl: './app/components/administrator/strategist/detail/legalAgreement/legalAgreement.component.html'
})
export class StrategistAgreementComponent extends BaseComponent {
    
     private agreement : IStrategistAgreement = <IStrategistAgreement>{};
     private submitAgreement : boolean =false;
     
     
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
            this.getStrategistAgreement(this.strategistId);
        }else{
            this.agreement = <IStrategistAgreement>{};
        }
        this.submitAgreement = false;
     }
     
     private getStrategistAgreement(strategistId){
        this.responseToObject<IStrategistAgreement>(this._strategistService.getStrategistAgreement(strategistId))
            .subscribe(model => {
               this.agreement = model;
         });
      
    }
    
    private saveAgreement(form: FormGroup){
        this.submitAgreement = true;
        if(form.valid){
        this.responseToObject<IStrategistAgreement>(this._strategistService.updateStrategistAgreement(this.strategistId , this.agreement)) 
                .subscribe(model => {
                       this.submitAgreement = false;
                       this.navigateToOtherView.emit("advertisement");
                },
                err =>{
                     
                });
        }
    }
    
}