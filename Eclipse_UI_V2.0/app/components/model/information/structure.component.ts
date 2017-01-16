import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ModelInformationTabNavComponent } from '../shared/modelInformation.tabnav.component';

@Component({
    selector: 'eclipse-dashboard-overview',
    templateUrl: './app/components/model/information/structure.component.html'
})
export class ModelStructureComponenet extends BaseComponent {
    constructor() {
        super();
    }
    ngOnInit() { }
}
