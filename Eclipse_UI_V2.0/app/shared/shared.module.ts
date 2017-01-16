import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb';
import { Accounts } from './accounts/assign.accounts';
import { SavedViewComponent } from './savedviews/savedview.component';
/** PrimeNG Modules */
import { ButtonModule } from 'primeng/components/button/button';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { MultiSelectModule } from 'primeng/components/multiselect/multiselect';
import { AgGridModule } from 'ag-grid-ng2/main';
/** Tags Component */
import { TagInputItemComponent } from './tags/tag-input-item.component';
import { TagInputComponent } from './tags/tag-input.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationItemComponent } from './notification/notificationitem.component';
import { NotificationService } from '../app/../services/notification.service';
import { UserService } from '../app/../services/user.service';

/** Progress bar in Notification Module */
import { ProgressBarModule } from 'primeng/components/progressbar/progressbar';
import { MessagesModule } from 'primeng/components/messages/messages';
// import { Message } from 'primeng/primeng';
import { GrowlModule } from 'primeng/components/growl/growl';
import { CurrencyMillionPipe, CurrencyAmountPipe } from '../pipes/FilterPipe';

let   pipes: any[]=[CurrencyMillionPipe, CurrencyAmountPipe];

@NgModule({
    imports: [CommonModule, FormsModule, DialogModule, RouterModule,
        ProgressBarModule, MessagesModule, GrowlModule,
        MultiSelectModule, AutoCompleteModule, CalendarModule,
        ButtonModule, CheckboxModule, AgGridModule.forRoot()],
    declarations: [BreadcrumbComponent, Accounts, SavedViewComponent,
        TagInputItemComponent, TagInputComponent, NotificationComponent, NotificationItemComponent, pipes],
    exports: [BreadcrumbComponent, Accounts, SavedViewComponent, DialogModule,
        ProgressBarModule, MessagesModule, GrowlModule,
        MultiSelectModule, AutoCompleteModule, CalendarModule, AgGridModule,
        TagInputComponent, NotificationComponent, ButtonModule, CheckboxModule, pipes],
    providers: [NotificationService, UserService]
})
export class SharedModule { }
