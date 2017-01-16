import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'community-user-tabnav',
    templateUrl: './app/components/administrator/shared/user.tabnav.component.html',
})
export class UserTabNavComponent {
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