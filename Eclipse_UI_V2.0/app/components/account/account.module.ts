import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import { FormsModule } from '@angular/forms';
import {ACCOUNT_ROUTE_PROVIDERS} from './account.routes';
import {SharedModule} from '../../shared/shared.module';
import {AccountsTabNavComponent} from '../account/shared/account.tabnav.component';
import {AccountComponent} from './account.component';
import {AccountListComponent} from '../account/list/accountlist.component';
import {AccountFilterComponent} from '../account/list/accountfilter.component';
import {AccountViewComponent} from '../account/view/accountview.component';
import { ViewsService }  from '.././../services/views.service';
import {AccountDashboardComponent} from '../account/dashboard/dashboard.component';
import { ConfirmDeactivateGuard } from '../portfolio/shared/confirm.deactivatedguard';
//import{AccountViewComponent} from '../../../components/account/view/accountview.component';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, ACCOUNT_ROUTE_PROVIDERS],
    declarations: [AccountComponent, AccountDashboardComponent, AccountsTabNavComponent,
        AccountListComponent, AccountViewComponent, AccountFilterComponent],
    providers: [ConfirmDeactivateGuard, ViewsService]
})

export class AccountModule { }