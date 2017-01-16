import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../core/base.component';

@Component({
    selector: 'eclipse-holding',
    templateUrl: './app/components/holding/holding.component.html'
})
export class HoldingComponent extends BaseComponent { 
      constructor() {
        super(PRIV_HOLDINGS);
        //this.canView = this.permission.canRead || this.permission.canUpdate;
        console.log('holding permission: ' + JSON.stringify(this.permission));
    }
}
