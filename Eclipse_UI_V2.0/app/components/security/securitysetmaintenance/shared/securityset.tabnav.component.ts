import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../../viewmodels/tabnav';
export { ITabNav } from '../../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-securityset-tabnav',
    templateUrl: './app/components/security/securitysetmaintenance/shared/securityset.tabnav.component.html',
})
export class SecuritySetTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        this.callParentPopup.emit(param);
    }

    // hideMenu() {
    //     return this.model.id == undefined ||
    //         (this.model.action == 'E' ) ||
    //         (this.model.action == 'V' && !this.model.canUpdate) ||
    //         (this.model.action == 'L' && !this.model.canRead && !this.model.canUpdate && !this.model.canDelete);
    // }

}