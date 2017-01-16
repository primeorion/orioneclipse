import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';



@Component({
    selector: 'eclipse-asset-maintenance',
    templateUrl: './app/components/security/assetmaintenance/asset.maintenance.component.html'
})
export class AssetMaintenanceComponent extends BaseComponent {
    
    private menuName: string = "Asset Maintenance";
}
