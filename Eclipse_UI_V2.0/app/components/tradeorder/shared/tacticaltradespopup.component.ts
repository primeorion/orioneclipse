import { Component, Output, Input, EventEmitter } from '@angular/core';
import { ITacticalQuery} from '../../../models/tactical';
@Component({
    selector: 'eclipse-taticltrades-popup',
    templateUrl: './app/components/tradeorder/shared/tacticaltradespopup.component.html',
})
export class TacticalTradesPopupComponent {
selectedItem:any;
isSleevePortfolio:boolean;
    @Output() callParentMethod = new EventEmitter();
    @Output() callContinueMethod = new EventEmitter();
    valueChecked:boolean;
    queryparams:ITacticalQuery = <ITacticalQuery>{};
    constructor(){
        this.queryparams=<ITacticalQuery>{defaultAction:"NotSpecified"};
    }
    /** Action Menu */

    usePending(val){
        this.queryparams.usePending=val;
    }
    onDefaultAction(val){

    }
    closePopup() {
        console.log("Parent event :", event);
        this.callParentMethod.emit();
    }
    continueClick(){
          console.log("Continue-Load TacticalTool and values here:",this.queryparams);
           this.callContinueMethod.emit();
    }
    getSelectedPortfolio(item) {
        this.selectedItem = item.value;
        this.queryparams.portfolioId=this.selectedItem.id;
        this.isSleevePortfolio = this.selectedItem.sleevePortfolio;
        console.log('SelectedItem from AutoComplete : SelevedPortfolio',   this.queryparams.portfolioId);
    }
}