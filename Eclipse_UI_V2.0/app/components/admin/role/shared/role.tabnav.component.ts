import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../../viewmodels/tabnav';
export { ITabNav } from '../../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-admin-role-tabnav',
    templateUrl: './app/components/admin/role/shared/role.tabnav.component.html',
})
export class RoleTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    onMenuClick(param: string) {
        console.log('callParentPopup event fired.');
        this.callParentPopup.emit(param);
    }

}
