import { Component, ViewChild , ChangeDetectorRef} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { AdministratorLeftNavComponent } from '../../../shared/leftnavigation/administrator.leftnav.component';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb';
import { StrategistDetailComponent } from './detail/strategist.detail.component';
import { StrategistViewComponent } from './view/strategist.view.component';

@Component({
    selector: 'community-strategist',
    templateUrl: './app/components/administrator/strategist/strategist.component.html',
     directives: [AdministratorLeftNavComponent, BreadcrumbComponent , StrategistDetailComponent, StrategistViewComponent]
})
export class StrategistComponent extends BaseComponent {
    
    private isAllStrategistView: boolean = true;
    private strategistId: number;
    
    constructor(private _cdr : ChangeDetectorRef){
        super();
    }
    
    public navigateToStrategistDetail(){
        
        this.isAllStrategistView = false;
        
    }
    private navigateToStrategistView(){
        
        this.isAllStrategistView = true;
        //this._cdr.detectChanges();
    }
    private setSelectedStrategist(id){
        this.strategistId = id;
        this.navigateToStrategistDetail();
    }
}