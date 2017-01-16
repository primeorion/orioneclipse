import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-account-tabnav',
    templateUrl: './app/components/account/shared/account.tabnav.component.html',
})
export class AccountsTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        console.log("Parent event :", event);
        this.callParentPopup.emit(param);
    }
    onModelSelect(value) {
        if (value == 0)
            this.callParentPopup.emit("GlobalTrades");
        else if(value == 1)
             this.callParentPopup.emit("TickerSwap");
        else if(value == 2)   
           this.callParentPopup.emit("TradeToTarget");
           // this.callParentPopup.emit(value == 0 ? "GlobalTrades" : "TickerSwap");
    }

}
