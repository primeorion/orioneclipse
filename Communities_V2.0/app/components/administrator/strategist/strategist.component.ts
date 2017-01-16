import { Component, ViewChild , ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BaseComponent } from '../../../core/base.component';
import { AdministratorService } from '../../../services/administrator.service';
import { IAdministratorSummary } from '../../../models/administrator.summary';
import { IAdministratorLeftMenu } from '../../../viewmodels/administrator.leftmenu';

@Component({
    selector: 'community-strategist',
    templateUrl: './app/components/administrator/strategist/strategist.component.html'
   
})
export class StrategistComponent extends BaseComponent {
    
    private isAllStrategistView: boolean = true;
    private strategistId: number;
    private isViewMode: boolean = false;
    private selectedStrategistIds : number[] = [];
    private strategistSummary: IAdministratorLeftMenu = <IAdministratorLeftMenu>{};
    
    constructor(private _cdr : ChangeDetectorRef, private route: ActivatedRoute, 
                private _administratorService : AdministratorService){
        super();
        
    }
    
    ngOnInit(){
        this.getStrategistSummary();
    }
    
    getStrategistSummary() {
        this.responseToObject<IAdministratorSummary>(
            this._administratorService.getAdministratorSummary(this.dateRenderer(new Date())))
            .subscribe(summary => {
                this.strategistSummary.all = summary.totalStrategist;
                this.strategistSummary.existingOrActive = summary.existingStrategist;
                this.strategistSummary.newOrPending = summary.newStrategist;
                this.strategistSummary.menuName = "Strategists";
                
            });
    }
    
    private selectStrategist(selectedStrategists){
        this.selectedStrategistIds = selectedStrategists;
    }
    
    private navigateToStrategistDetail(){
        this.strategistId = undefined;
        this.isAllStrategistView = false;
        
    }
    
    private editViewStrategistDetail(event){
        this.strategistId = event.id;
        this.isViewMode = event.isViewMode;
        this.isAllStrategistView = false;
    }
    
    private editViewStrategistAction(isViewMode){
        this.strategistId = this.selectedStrategistIds[0];
        this.isViewMode = isViewMode;
        this.isAllStrategistView = false;
    }
    
    private navigateToStrategistView(){
        this.selectedStrategistIds = [];
        this.isAllStrategistView = true;
        
    }
}