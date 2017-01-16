import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'community-stratgeist-tabnav',
    templateUrl: './app/components/administrator/shared/strategist.tabnav.component.html',
})
export class StrategistTabNavComponent extends BaseComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;
    private isSuperAdmin: boolean;
    constructor() {
        super();
        this.isSuperAdmin = (this.roleTypeId == RoleType.SuperAdmin);
    }
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