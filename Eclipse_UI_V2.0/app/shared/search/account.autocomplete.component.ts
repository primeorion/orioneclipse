import { Component, EventEmitter, Output, Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import * as Util from '../../core/functions';
import { AccountService } from '../../services/account.service';

@Component({
    selector: 'eclipse-account-autocomplete',
    templateUrl: './app/shared/search/account.autocomplete.component.html',
})

export class AccountsAutoCompleteComponent extends BaseComponent {
    @Input() isSpendCash: any;
    suggestions: any[] = [];
    selectedItem: string;

    @Output() parentCallback = new EventEmitter();
    constructor(private _accountService: AccountService) {
        super();
    }

    /** To get accounts for search autoComplete  */
    loadSuggestions(event) {
        this.suggestions = [];
        Util.responseToObjects<any>(this._accountService.searchAccountsByIdValue(event.query.toLowerCase(), this.isSpendCash))
            .subscribe(model => {
                this.suggestions = model.filter(a => a.isDeleted == 0);
                console.log('account suggestions : ', this.suggestions);
            });
    }

    /** Fires on item select */
    onAccountSelect(item) {
         this.selectedItem = item;
        //this.parentCallback.emit({ value: item });
         this.parentCallback.emit({value: this.selectedItem});
    }

}

