import { Component, EventEmitter, Output } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
    selector: 'eclipse-sleeveportfolio-autocomplete',
    templateUrl: './app/shared/search/sleeveportfolio.autocomplete.component.html',
})

export class SleevePfAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _portfolioService: PortfolioService) {
        super();
    }

    /** To get portfolios for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        Util.responseToObjects<any>(this._portfolioService.searchSleevePortfolioSimple(event.query.toLowerCase()))
            .subscribe(model => {
                this.suggestions = model.filter(a => a.isDeleted == 0 && a.sleevePortfolio == 1);
            });
    }

    /** Fires on item select */
    onPortfolioSelect(item) {
        this.selectedItem = item;
        this.parentCallback.emit({ value: this.selectedItem });
    }
}

