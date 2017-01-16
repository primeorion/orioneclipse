import { Component, EventEmitter, Output, Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { IPortfolioSimple } from '../../models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
    selector: 'eclipse-portfolio-autocomplete',
    templateUrl: './app/shared/search/portfolio.autocomplete.component.html',
})

export class PortfolioAutoCompleteComponent extends BaseComponent {
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _portfolioService: PortfolioService) {
        super();
    }

    /** To get portfolios for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        Util.responseToObjects<IPortfolioSimple>(this._portfolioService.searchPortfolioSimple(event.query.toLowerCase()))
            .subscribe(model => {
                this.suggestions = model.filter(a => a.isDeleted == 0);
                console.log('portfolio suggestions : ', this.suggestions);
            });
    }

    /** Fires on item select */
    onPortfolioSelect(item) {
        this.selectedItem = item;
        this.parentCallback.emit({value: this.selectedItem});
        //this.parentCallback.subscribe(item => this.selectedItem = undefined);
    }
}

