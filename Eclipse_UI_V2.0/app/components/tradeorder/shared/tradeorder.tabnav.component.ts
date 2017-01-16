import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as Util from '../../../core/functions';
import { IRolePrivilege } from '../../../models/user.models';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-trade-tabnav',
    templateUrl: './app/components/tradeorder/shared/tradeorder.tabnav.component.html',
})
export class TradeOrderTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;
    private executePriv: IRolePrivilege;

    constructor() {
        this.executePriv = Util.getPermission(PRIV_ORDEXEC); 
    }

    /** Action Menu */
    onMenuClick(param) {
        console.log("Parent event :", event);
        this.callParentPopup.emit(param);
    }

}
