import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../../viewmodels/tabnav';
export { ITabNav } from '../../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-admin-team-tabnav',
    templateUrl: './app/components/admin/team/shared/team.tabnav.component.html',
})
export class TeamTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    onMenuClick(param: string) {
        console.log('callParentPopup event fired.');
        this.callParentPopup.emit(param);
    }

}
