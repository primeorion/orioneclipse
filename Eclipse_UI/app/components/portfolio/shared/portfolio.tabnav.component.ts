import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-portfolio-tabnav',
    templateUrl: './app/components/portfolio/shared/portfolio.tabnav.component.html',
})
export class PortfolioTabNavComponent {
    @Output() callParentPopup = new EventEmitter();
    @Input() model: ITabNav;

    /** Action Menu */
    onMenuClick(param) {
        console.log("Parent event :", event);
          this.callParentPopup.emit(param);
    }

    hideMenu() {
        console.log('tabs model: ', this.model);
        return this.model.id == undefined ||
            (this.model.action == 'E' && !this.model.canRead) ||
            (this.model.action == 'V' && !this.model.canUpdate) ||
            (this.model.action == 'L' && !this.model.canRead && !this.model.canUpdate && !this.model.canDelete);
    }

}
