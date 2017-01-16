import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITabNav } from '../../../viewmodels/tabnav';
export { ITabNav } from '../../../viewmodels/tabnav';

@Component({
    selector: 'eclipse-holding-tabnav',
    templateUrl: './app/components/holding/shared/holding.tabnav.component.html',
})
export class HoldingTabNavComponent {  
    @Input() model: ITabNav;

}
