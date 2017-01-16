import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { BaseComponent } from '../../../../core/base.component';
import { StrategistGeneralInfoComponent } from './generalInfo/strategist.general.info.component';
import { StrategistCommentaryComponent } from './commentary/commentary.component';
import { IStrategist } from '../../../../models/strategist';
import { StrategistService } from '../../../../services/strategist.service';

@Component({
    selector: 'community-strategist-detail',
    templateUrl: './app/components/administrator/strategist/detail/strategist.detail.component.html',
    directives: [StrategistGeneralInfoComponent , StrategistCommentaryComponent]
    
})
export class StrategistDetailComponent extends BaseComponent {
    
    private viewName : string = "generalInfo";
    private strategist: IStrategist = <IStrategist>{};
    
    @Input() strategistId: number; 
    
    constructor(private _strategistService : StrategistService){
        super();
    }
    
    
    
}