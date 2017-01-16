import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'notification-item',
    templateUrl: './app/shared/notification/notificationitem.component.html',
})
export class NotificationItemComponent {


    // @Input() notificationslist: any;
    // @Input() notificationCategorylist: any;    
    @Input() notificationModel: any;
    @Input() notice: any[] = [];
    notifications: any[] = [];
    constructor() {
        //console.log('Notice ',this.notice);
    }

    @Output() setReadStatus = new EventEmitter();
    @Output() viewNotification = new EventEmitter();
    takeAction(notificationId, status) {
        this.notifications = [];
        this.notifications.push(notificationId, status);
        this.setReadStatus.emit(this.notifications);

        // console.log('test',this.notice);  
    }
    viewNotificationStory(notificationId) {
        this.viewNotification.emit(notificationId)
    }
}