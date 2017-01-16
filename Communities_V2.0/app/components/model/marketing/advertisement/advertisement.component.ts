import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModelMarketingService } from '../../../../services/model.marketing.service';
import { ITabNav} from '../../shared/model.tabnav.component';
import * as Util from '../../../../core/functions';
import { FormGroup } from '@angular/forms';
import { IModelList } from '../../../../models/model';
import { IModelAdvertisement } from '../../../../models/model';

@Component({
    selector: 'community-model-marketing-advertisement',
    templateUrl: './app/components/model/marketing/advertisement/advertisement.component.html'
})
export class ModelAdvertisementComponent extends BaseComponent {
    
     private submitAdvertisement : boolean =false;
     private tabsModel: ITabNav;
     private modelId: number;
     private model: IModelList = <IModelList>{};
     private advertisement: IModelAdvertisement = <IModelAdvertisement>{};
     
     constructor(private _modelMarketingService : ModelMarketingService , 
                 private activateRoute : ActivatedRoute, private _router : Router){
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'E';
     }
     
     ngOnInit(){
         this.activateRoute.params.subscribe(params => {
           this.modelId = +params['id']; 
           this.reset();
        });
     }
     
     reset(){
        if(this.modelId > 0){
            this.getMarketingAdvertisement(this.modelId);
        } 
        this.submitAdvertisement =false;
     }
     
     private onModelChange(modelId){
         this._router.navigate(['/community/model/marketing/advertisement',modelId]);
     }
     
     private getMarketingAdvertisement(modelId){
        Util.responseToObject<IModelAdvertisement>(this._modelMarketingService.getModelAdvertisement(modelId))
            .subscribe(advertisement => {
                this.model.id = this.modelId;
                this.model.name = advertisement.modelName;
                this.advertisement = advertisement;
        });
     }
    
    private saveAdvertisement(form){
        this.submitAdvertisement = true;
        if(form.valid){
           Util.responseToObject<IModelAdvertisement>(this._modelMarketingService.saveAdvertisement(this.advertisement))
            .subscribe(advertisement => {
                this._router.navigate(['/community/model/marketing/downloads',this.model.id]);
           });
        }
    }
    
}