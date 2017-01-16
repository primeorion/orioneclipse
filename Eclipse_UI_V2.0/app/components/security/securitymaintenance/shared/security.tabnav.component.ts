import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../../viewmodels/tabnav';
export { ITabNav } from '../../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-security-tabnav',
    templateUrl: './app/components/security/securitymaintenance/shared/security.tabnav.component.html',
})
export class SecurityTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        this.callParentPopup.emit(param);
    }

    

}