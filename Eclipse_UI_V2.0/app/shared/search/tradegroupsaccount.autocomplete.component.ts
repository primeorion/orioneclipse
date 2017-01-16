import { Component, EventEmitter, Output } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { ITradeGroupsAccount } from '../../models/tradetools';
import { TradeToolsService } from '../../services/tradetools.service';

@Component({
    selector: 'eclipse-tragegroupsaccount-autocomplete',
    templateUrl: './app/shared/search/tradegroupsaccount.autocomplete.component.html',
})

export class TradeGroupsAccountAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _tradeToolsService: TradeToolsService) {
        super();
    }

    /** To get trade group accounts for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        this.suggestions = this._tradeToolsService.getTradeGroupsAccounts();
    }

    /** Fires on item select */
    onTrageGroupsAccountSelect(item) {
        this.parentCallback.emit({value: item});
    }
}

