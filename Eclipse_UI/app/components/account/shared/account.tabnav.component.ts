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
 
}
