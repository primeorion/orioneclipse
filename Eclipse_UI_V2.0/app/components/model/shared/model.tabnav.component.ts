import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-model-tabnav',
    templateUrl: './app/components/model/shared/model.tabnav.component.html',
})
export class ModelTabNavComponent {
    // @Output() showDeletePopup = new EventEmitter();
    @Output() callParentPopup = new EventEmitter();
    @Output() onModelsSelect = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        console.log("Parent event :", event);
        this.callParentPopup.emit(param);
    }
    onModelSelect(value)
    {
        this.onModelsSelect.emit(value);
    }
    // onDelete() {
    //     console.log('showDeletePopup event fired.');
    //     this.showDeletePopup.emit("Display popup event fired.");
    // }

}
