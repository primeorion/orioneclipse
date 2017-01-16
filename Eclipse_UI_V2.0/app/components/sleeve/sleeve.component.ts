import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../core/base.component';

@Component({
    selector: 'eclipse-sleeve',
    templateUrl: './app/components/sleeve/sleeve.component.html',
    //directives : []
})

export class SleeveComponent extends BaseComponent {
    constructor() {
        super();
    }
}
