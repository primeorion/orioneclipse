import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';


@Component({
    selector: 'community-model-tabnav',
    templateUrl: './app/components/model/shared/model.tabnav.component.html',

})
export class ModelTabNavComponent extends BaseComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;
    private isStrategistUser : boolean;
    constructor() {
        super();
        this.isStrategistUser = (this.roleTypeId == RoleType.StrategistUser);
    }
    /** Action Menu */
    onMenuClick(param) {
        this.callParentPopup.emit(param);
    }
}