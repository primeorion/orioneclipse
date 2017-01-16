import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategist } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { Editor } from 'primeng/components/editor/editor';

@Component({
    selector: 'community-strategist-commentary',
    templateUrl: './app/components/administrator/strategist/detail/commentary/commentary.component.html'
    
})
export class StrategistCommentaryComponent extends BaseComponent {
    
     private strategist : IStrategist = <IStrategist>{};
     private submitCommentary : boolean =false;
     
     @Input() strategistId: number;
     
     constructor(private _strategistService : StrategistService){
        super();
     }
     
     ngOnInit(){
         
        if(this.strategistId != undefined){
            this.getStrategistDetail(this.strategistId);
        }else{
            this.strategist = <IStrategist>{};
        }
        
     }
     
     private getStrategistDetail(strategistId){
        this.responseToObject<IStrategist>(this._strategistService.getStrategistProfileDetail(strategistId))
            .subscribe(model => {
               this.strategist = model;
         });
      
    }
}