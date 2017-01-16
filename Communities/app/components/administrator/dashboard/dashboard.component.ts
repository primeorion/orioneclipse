import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { AdministratorService } from '../../../services/administrator.service';
import { IAdministratorSummary } from '../../../models/administrator.summary';


@Component({
    selector: 'community-administrator-dashboard',
    templateUrl: './app/components/administrator/dashboard/dashboard.component.html'
})
export class AdministratorDashboardComponent extends BaseComponent {
    
    private administratorSummary: IAdministratorSummary = <IAdministratorSummary>{};
    
    constructor(private _administratorService : AdministratorService){
        super();
        
    }
    
    ngOnInit() {
        this.onAdministratorDashboardLoad();
    }

    onAdministratorDashboardLoad() {
        this.responseToObject<IAdministratorSummary>(
            this._administratorService.getAdministratorSummary(this.dateRenderer(new Date())))
            .subscribe(summary => {
                this.administratorSummary = summary;
            });
    }
}
