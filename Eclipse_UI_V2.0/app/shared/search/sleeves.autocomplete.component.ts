import { Component, EventEmitter, Output } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { SleeveService } from '../../services/sleeves.service';

@Component({
    selector: 'eclipse-sleeves-autocomplete',
    templateUrl: './app/shared/search/sleeves.autocomplete.component.html',
})

export class SleevesAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _sleeveService: SleeveService) {
        super();
    }

    /** To get accounts for search autoComplete  */
    // loadSuggestions(event) {
    //     this.suggestions = [];
    //     Util.responseToObjects<any>(this._sleeveService.searchportfolioSleeveAccounts(event.query.toLowerCase()))
    //         .subscribe(model => {
    //             this.suggestions = model.filter(a => a.isDeleted == 0);
    //             console.log('account suggestions : ', this.suggestions);
    //         });
    // }

    /** Fires on item select */
    onSleeveSelect(item) {
        this.selectedItem = item;
        //this.parentCallback.emit({ value: item });
        this.parentCallback.emit({ value: this.selectedItem });
    }

    /** To get accounts for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        Util.responseToObjects<any>(this._sleeveService.getSleevedAccountSearch(event.query.toLowerCase()))
            .subscribe(model => {
                this.suggestions = model.filter(a => a.isDeleted == 0);
                console.log('account suggestions : ', this.suggestions);
            });
    }

}

