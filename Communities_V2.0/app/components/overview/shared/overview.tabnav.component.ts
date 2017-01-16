import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'community-overview-tabnav',
    templateUrl: './app/components/overview/shared/overview.tabnav.component.html',
})
export class OverviewTabNavComponent {
    @Output() showDeletePopup = new EventEmitter();
    @Input() model: ITabNav;

    onDelete() {
        console.log('showDeletePopup event fired.');
        this.showDeletePopup.emit("Display popup event fired.");
    }

}
