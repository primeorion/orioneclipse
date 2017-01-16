import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../../viewmodels/tabnav';
export { ITabNav } from '../../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-admin-user-tabnav',
    templateUrl: './app/components/admin/user/shared/user.tabnav.component.html',
})
export class UserTabNavComponent {
    @Output() showDeletePopup = new EventEmitter();
    @Input() model: ITabNav;

    onDelete() {
        console.log('showDeletePopup event fired.');
        this.showDeletePopup.emit("Display popup event fired.");
    }

}
