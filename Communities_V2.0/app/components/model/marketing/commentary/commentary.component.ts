import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModelMarketingService } from '../../../../services/model.marketing.service';
import { ITabNav} from '../../shared/model.tabnav.component';
import * as Util from '../../../../core/functions';
import { FormGroup } from '@angular/forms';
import { IModelList } from '../../../../models/model';
import { IModelCommentary } from '../../../../models/model';

@Component({
    selector: 'community-model-marketing-commentary',
    templateUrl: './app/components/model/marketing/commentary/commentary.component.html'
})
export class ModelCommentaryComponent extends BaseComponent {
    
     private submitCommentary : boolean =false;
     private tabsModel: ITabNav;
     private modelId: number;
     private model: IModelList = <IModelList>{};
     private commentary: IModelCommentary = <IModelCommentary>{};
     
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
            this.getMarketingComentary(this.modelId);
        } 
        this.submitCommentary =false;
     }
     
     private onModelChange(modelId){
         this._router.navigate(['/community/model/marketing/commentary',modelId]);
     }
     
     private getMarketingComentary(modelId){
        Util.responseToObject<IModelCommentary>(this._modelMarketingService.getModelCommentary(modelId))
            .subscribe(commentary => {
                this.model.id = this.modelId;
                this.model.name = commentary.modelName;
                this.commentary = commentary;
        });
     }
    
    private saveCommentary(form){
        this.submitCommentary = true;
        if(form.valid){
           Util.responseToObject<IModelCommentary>(this._modelMarketingService.saveCommentary(this.commentary))
            .subscribe(commentary => {
                this._router.navigate(['/community/model/marketing/advertisement',this.model.id]);
           });
        }
    }
    
}