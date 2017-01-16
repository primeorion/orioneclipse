import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategistSalesDetail } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { FormGroup } from '@angular/forms';



@Component({
    selector: 'community-strategist-sales',
    templateUrl: './app/components/administrator/strategist/detail/sales/sales.component.html'
})
export class StrategistSalesComponent extends BaseComponent {
    
     private salesDetail : IStrategistSalesDetail = <IStrategistSalesDetail>{};
     private submitSalesDetail : boolean =false;
     
     
     @Input() strategistId: number;
     @Input() isViewMode: boolean;
     
     @Output() navigateToOtherView = new EventEmitter();
     
     constructor(private _strategistService : StrategistService){
        super();
        
        
     }
     
     ngOnInit(){
        this.reset();        
     }
     
     private reset() {
         if (this.strategistId != undefined) {
             this.getStrategistSalesDetail(this.strategistId);
         } else {
             this.salesDetail = <IStrategistSalesDetail>{};
             this.salesDetail.salesContact = "";
             this.salesDetail.salesEmail = "";
             this.salesDetail.salesPhone = "";
         }
         this.submitSalesDetail = false;
     }
     
     private getStrategistSalesDetail(strategistId){
        this.responseToObject<IStrategistSalesDetail>(this._strategistService.getStrategistSalesDetail(strategistId))
            .subscribe(model => {                
               this.salesDetail = model;
         });
      
    }
    
    private saveSalesDetail(form){        
        this.salesDetail.salesContact==null? this.salesDetail.salesContact ="" : this.salesDetail.salesContact;
        this.salesDetail.salesEmail==null? this.salesDetail.salesEmail ="" : this.salesDetail.salesEmail;
        this.salesDetail.salesPhone==null? this.salesDetail.salesPhone ="" : this.salesDetail.salesPhone;
        this.submitSalesDetail = true;
        if(form.valid){
           this.responseToObject<IStrategistSalesDetail>(this._strategistService.updateStrategistSalesDetail(this.strategistId ,this.salesDetail)) 
                .subscribe(model => {
                       this.submitSalesDetail = false;
                       this.navigateToOtherView.emit("support");
                },
                err =>{
                     
                });
        }
    }
    
}