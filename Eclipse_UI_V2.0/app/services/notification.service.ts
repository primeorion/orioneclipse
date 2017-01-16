import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { SessionHelper } from '../core/session.helper';
import { HttpClient } from '../core/http.client';
import { INotificationTopics, ISubscribeNotificationTopic, IActivities } from '../models/notification';
import * as Util from '../core/functions';
@Injectable()
export class NotificationService {
  socket: any;
  private allNotificationEndPoint = "notification/notifications/topics/master";
  private subscribeNotificationEndPoint = "notification/notifications/topics";
  private notificationsEndPoint = "notification/notifications";
  private readNotificationsEndPoint = "notification/notifications/read";
  private activityEndPoint = "notification/activities";

  constructor(private _httpClient: HttpClient) { }

  ConnectSocket(_apiEndpoint: string, token: any) {
    this.socket = io(_apiEndpoint,
      {
        'query': 'token=' + token.eclipse_access_token
      });
  }
  GetSubscribedNotificationTopics() {
    return this._httpClient.getData(this.subscribeNotificationEndPoint);
  }

  getNotifications() {
    let observable = new Observable(observer => {
      Util.responseToObjects<INotificationTopics>(this.GetSubscribedNotificationTopics())
        .subscribe(model => {
          model.forEach(topic => {
            this.socket.on(topic.code, (data) => {
              observer.next(data);
            });
          });
          return () => {
            this.socket.disconnect();
          };
        })
    });
    return observable;
  }
  GetAllNotificationTopics() {
    return this._httpClient.getData(this.allNotificationEndPoint);
  }

  SubscribeNotificationTopic(ISubscribeNotificationTopic) {
    return this._httpClient.postData(this.subscribeNotificationEndPoint, ISubscribeNotificationTopic);
  }
  GetNotificationList() {
    return this._httpClient.getData(this.notificationsEndPoint, false);
  }
  ReadNotification(ids) {
    return this._httpClient.updateData(this.readNotificationsEndPoint, ids, false);
  }
  DeleteNotification(id) {
    return this._httpClient.deleteData(this.notificationsEndPoint + "/" + id);
  }

  getAllNotificationCategories() {
    return this._httpClient.getData(this.allNotificationEndPoint);
  }

  getAllSubscribeNotificationTopic() {
    return this._httpClient.getData(this.subscribeNotificationEndPoint);
  }

  subscribeNotifications(notifications) {
    return this._httpClient.updateData(this.subscribeNotificationEndPoint, notifications);
  }

  searchNotification(notificationId: number) {
    return this._httpClient.getData(this.notificationsEndPoint + '?search=' + notificationId);
  }

  getActivities() {
    return this._httpClient.getData(this.activityEndPoint,false);
  }

  createActivity(activity: IActivities) {
    return this._httpClient.postData(this.activityEndPoint, activity);
  }
  AssignUsersToActivity(id: any, userIds) {
    let data = { "userIds": userIds };
    return this._httpClient.postData(this.activityEndPoint + "/" + id + "/users", data);
  }
  getUsersAssignedToActivity(activityId: number) {
    return this._httpClient.getData(this.activityEndPoint + "/" + activityId + "/users");
  }
  updateActivity(activityId: number, activity: any) {
    return this._httpClient.updateData(this.activityEndPoint + "/" + activityId, activity);
  }
}