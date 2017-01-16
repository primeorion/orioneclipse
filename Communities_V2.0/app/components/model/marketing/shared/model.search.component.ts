import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { IModelList } from '../../../../models/model';
import { Router, ActivatedRoute } from '@angular/router';
import { ModelService } from '../../../../services/model.service';
import * as Util from '../../../../core/functions';
import { FormGroup } from '@angular/forms';



@Component({
    selector: 'community-model-search',
    templateUrl: './app/components/model/marketing/shared/model.search.component.html'
})
export class ModelSearchComponent extends BaseComponent {

    private autoCompleteSelectedModel: any;
    private filteredModelResult: IModelList[];
    private btnDisableModel: boolean = true;

    @Input() model: IModelList = <IModelList>{};
    @Output() onModelChange = new EventEmitter();

    constructor(private _modelService: ModelService, private _router: Router) {
        super();
    }

    autoModelSearch(event) {
        Util.responseToObjects<IModelList>(this._modelService.searchModel(event.query.toLowerCase()))
            .subscribe(model => {
                this.filteredModelResult = model;
            });
    }

    handleSelectedModel(model) {

        if (model.name) {
            this.btnDisableModel = false;

        } else {
            this.btnDisableModel = true;
        }
    }

    searchModel(model) {
        this.onModelChange.emit(model.id);
        this.btnDisableModel = true;
        this.autoCompleteSelectedModel = undefined;
        if (this.roleTypeId == RoleType.StrategistUser)
            this._router.navigate(['/community/model/marketing/performance', model.id]);
    }

}