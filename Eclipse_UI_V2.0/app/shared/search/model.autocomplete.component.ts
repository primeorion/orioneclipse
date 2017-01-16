import { Component, EventEmitter, Output} from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { IModel } from '../../models/modeling/model';
import { ModelService } from '../../services/model.service';

@Component({
    selector: 'eclipse-model-autocomplete',
    templateUrl: './app/shared/search/model.autocomplete.component.html',
})

export class ModelAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _modelService: ModelService) {
        super();
    }

    /** To get models for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        Util.responseToObjects<IModel>(this._modelService.getModelSearch(event.query.toLowerCase()))
            .subscribe(model => {
                this.suggestions = model.filter(a => a.isDeleted == false && a.statusId != null);
            });
    }

    /** Fires on item select */
    onModelSelect(item) {
        this.parentCallback.emit({ value: item });
    }
}

