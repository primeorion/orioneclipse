
import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { SecurityLeftNavComponent } from '../../../shared/leftnavigation/security.leftnav.component';
import { AssetMaintenanceTabNavComponent } from '../../../shared/tabnavigation/asset.maintenance.tabnav.component'


@Component({
    selector: 'eclipse-asset-maintenance',
    templateUrl: './app/components/security/assetmaintenance/asset.maintenance.component.html',
     directives: [SecurityLeftNavComponent , AssetMaintenanceTabNavComponent]
})
export class AssetMaintenanceComponent extends BaseComponent {}
