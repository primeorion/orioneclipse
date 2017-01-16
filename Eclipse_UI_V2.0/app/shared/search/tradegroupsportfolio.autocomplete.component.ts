import { Component, EventEmitter, Output } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { ITradeGroupsPortfolio } from '../../models/tradetools';
import { TradeToolsService } from '../../services/tradetools.service';
//import { ChildSubscriber } from '../../core/customSubService';

@Component({
    selector: 'eclipse-tragegroupsportfolio-autocomplete',
    templateUrl: './app/shared/search/tradegroupsportfolio.autocomplete.component.html',
})

export class TradeGroupsPortfolioAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _tradeToolsService: TradeToolsService) {
        super();
    }

    /** To get trade groups portfolios for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        this.suggestions = this._tradeToolsService.getTradeGroupsPortfolios();
    }

    /** Fires on item select */
    onTrageGroupsPortfolioSelect(item) {
        this.selectedItem = item;
        this.parentCallback.emit({ value: this.selectedItem });
        //this._childSubscriber.process.emit({value: this.selectedItem});
    }
}

