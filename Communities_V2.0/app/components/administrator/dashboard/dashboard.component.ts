import { Component} from '@angular/core';
import { NavigationExtras , Router} from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import { AdministratorService } from '../../../services/administrator.service';
import { IAdministratorSummary } from '../../../models/administrator.summary';


@Component({
    selector: 'community-administrator-dashboard',
    templateUrl: './app/components/administrator/dashboard/dashboard.component.html'
})
export class AdministratorDashboardComponent extends BaseComponent {
    
    private administratorSummary: IAdministratorSummary = <IAdministratorSummary>{};
    private isSuperAdmin : boolean;
    
    
    
    constructor(private _administratorService : AdministratorService, private router: Router){
        super();
        this.isSuperAdmin = (this.roleTypeId == RoleType.SuperAdmin);
        
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
    
    navigateToStrategistDetail(){
        let navigationExtras: NavigationExtras = {
            queryParams: { 'isAllStrategistView': false }
        };
        this.router.navigate(['/community', 'administrator', 'strategist'], navigationExtras);
    }
    
    navigateToUserDetail(){
        let navigationExtras: NavigationExtras = {
            queryParams: { 'isAllUserView': false }
        };
        this.router.navigate(['/community', 'administrator', 'user'], navigationExtras);
    }
}
