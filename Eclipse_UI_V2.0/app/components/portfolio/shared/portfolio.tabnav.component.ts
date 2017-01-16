import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-portfolio-tabnav',
    templateUrl: './app/components/portfolio/shared/portfolio.tabnav.component.html',
})
export class PortfolioTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        console.log("Parent event :", event);
          this.callParentPopup.emit(param);
    }

    /** Redirect to model details  */
    gotoModelDetails() {
        window.open('#/eclipse/model/view/' + this.model.modelId);
    }
    onModelSelect(value) {
        if(value == 0)
            this.callParentPopup.emit("GlobalTrades");
        else if(value == 1)
            this.callParentPopup.emit("TickerSwap");
        else    
            this.callParentPopup.emit("TradeToTarget");
        // this.callParentPopup.emit(value == 0 ? "GlobalTrades" : "TickerSwap");
    }
}
