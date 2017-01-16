import { Component, ViewChild , ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BaseComponent } from '../../../core/base.component';
import { AdministratorService } from '../../../services/administrator.service';
import { IAdministratorSummary } from '../../../models/administrator.summary';
import { IAdministratorLeftMenu } from '../../../viewmodels/administrator.leftmenu';


@Component({
    selector: 'community-users',
    templateUrl: './app/components/administrator/user/user.component.html'
   
})
export class UserComponent extends BaseComponent {
    
    private isAllUserView: boolean = true;
    private userId: number;
    private isViewMode: boolean = false;
    private selectedUserIds : number[] = [];
    private userSummary: IAdministratorLeftMenu = <IAdministratorLeftMenu>{};
    
    constructor(private _cdr : ChangeDetectorRef, private route: ActivatedRoute, 
                private _administratorService: AdministratorService){
        super();
    }
    
    ngOnInit(){
        this.getUserSummary();
    }
    
    getUserSummary() {
        this.responseToObject<IAdministratorSummary>(
            this._administratorService.getAdministratorSummary(this.dateRenderer(new Date())))
            .subscribe(summary => {
                this.userSummary.all = summary.totalUsers;
                this.userSummary.existingOrActive = summary.existingUsers;
                this.userSummary.newOrPending = summary.newUsers;
                this.userSummary.menuName = "Users";
                
            });
    }
    
    private selectUsers(selectedUsers){
        this.selectedUserIds = selectedUsers;
    }
    
    private navigateToUserDetail(){
        this.userId = undefined;
        this.isAllUserView = false;
        
    }
    
    private editViewUserDetail(event){
        this.userId = event.id;
        this.isViewMode = event.isViewMode;
        this.isAllUserView = false;
    }
    
    private editViewUserAction(isViewMode){
        this.userId = this.selectedUserIds[0];
        this.isViewMode = isViewMode;
        this.isAllUserView = false;
    }
    
    private navigateToUserView(){
        
        this.isAllUserView = true;
        
    }
}