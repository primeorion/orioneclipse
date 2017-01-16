import { Component, Injectable, Inject, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Response } from '@angular/http';
import { SessionHelper } from '../../core/session.helper';
import { DashboardLeftNavComponent } from '../../shared/leftnavigation/dashboard.leftnav.component';
import { NotificationsService, SimpleNotificationsComponent, PushNotificationsService } from 'angular2-notifications';
import { NotificationService } from '../../services/notification.service';
import { ILogin } from '../../login/login';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as io from 'socket.io-client';
import {
    INotificationModel, INotificationTopics, INotification,
    INotificationsList, INotificationCategory, ISubscribeNotificationTopics,
    ISubscribeNotifications, ISelectedNotifications, IActivities, INotificationVM, IProgressNotification
} from '../../models/notification';
import * as Util from '../../core/functions';
import { BaseComponent } from '../../../app/core/base.component';
import { GridOptions, ColDef } from 'ag-grid/main';
import { IUser } from '../../../app/models/user';
import { IRole } from '../../../app/models/role';
import { UserService } from '../../../app/services/user.service';
import { ActivityUser } from '../../../app/models/notification';

/** PROGRESS BAR IMPORTS */
import { ProgressBar } from 'primeng/components/progressbar/progressbar';
import { Messages } from 'primeng/components/messages/messages';
import { Message } from 'primeng/primeng';
import { Growl } from 'primeng/components/growl/growl';

@Component({
    selector: 'eclipse-layout',
    templateUrl: './app/shared/notification/notification.component.html',
})
export class NotificationComponent extends BaseComponent {
    private noti: any;
    socket: any;
    //Notifications Options
    messages: any = [];
    ids: any = [];
    connection;
    message: string;
    results: any;
    token: any
    msgCount = 0;
    showMe: boolean = true;
    showPreferencesDiv: boolean = false;
    showNotificationStoryDiv: boolean = false;
    displayAddActivity: boolean = false;
    displayUsers: boolean = false;
    PreferencesDiv: boolean = false;
    showNotificationDiv: boolean = true;
    notificationTopics: ISubscribeNotificationTopics[] = [];
    notificationTopic: INotificationTopics[] = [];
    notificationCategoryList: INotificationTopics[] = [];
    subscribeNotifications = <ISubscribeNotifications>{};

    @Output() msgCounter = new EventEmitter();
    selectedDisplayCategory: string = "Date";
    displayGroups: string[] = [];
    displayActivityGroups: string[] = [];
    notificationsList: INotificationsList[] = [];   //This variable will be used to hold the api returned result
    finalList: INotificationsList[] = [];           //this variable will be used to hold UI display records with filters and conditions
    notificationInformation: INotificationsList[];
    selectedNotificationFilter: string = "All";     //this variable will be used to hold selected filter
    activityList: IActivities[] = [];                //This variable will be used to hold the api returned result of activities
    activity: IActivities = <IActivities>{};
    finalActivitiesList: IActivities[] = [];

    userEmail: string;
    private selectedTab: string = "All";
    topFour: number = 4;                    //This variable is to display top 4 Notifications
    showAllNotificaitons: boolean = false;  //This variable is used to display more for Notifications
    topSixActivities = 4;                   //This variable is to display top 5 Activities
    showAllActivities: boolean = false;     //This variable is used to display more for Activities

    private columnDefs: ColDef[];
    errorMessage: string;
    private gridOptions: GridOptions;
    private selectedUsersGridOptions: GridOptions;
    private masterUsersData: any[] = [];
    private usersData: any[] = [];
    private selectedUsers: any[] = [];
    private assignUserErrorMsg: string = "";
    notification = <INotificationModel>{};
    private selectedActivityId: number;
    private iUser: IUser;
    private isNormalUser: boolean = false;
    private showTodo: boolean = false;
    private filterNotificationsText: any;
    notificationVM = <INotificationVM>{};
    public options = {
        timeOut: 5000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: 'visible',
        rtl: false,
        animate: 'scale',
        position: ['right', 'bottom']
    };

    /******* PROGRESS BAR VARIABLES **/
    value: number = 0;
    msgs: Message[];

    analyticsProgress: string;
    displayProgressBar: boolean = false;
    hideProgressBar: boolean = false;


    @Output() ShowProfilePopup = new EventEmitter();
    constructor(private _router: Router, private _service: NotificationsService, private _push: PushNotificationsService, private notificationService: NotificationService, private _userService: UserService, @Inject('NotificationEndpoint') private _apiEndpoint: string) {
        super();
        this.token = this._sessionHelper.get<ILogin>("accessTokenInfo");
        this.getSubscribeNotificationTopic();
        this.gridOptions = <GridOptions>{};
        this.selectedUsersGridOptions = <GridOptions>{};
        this.createColumnDefs();
    }

    ngOnInit() {
        this.notificationService.ConnectSocket(this._apiEndpoint, this.token);
        this.loadNotifications();
        this.loadNotificationList();
        let user = this._sessionHelper.getUser();
        //this.getActivities();
        this.onUsersLoad();
        //this.showProgress();
        let role = this._sessionHelper.getUser().role;
        if (role.roleTypeId == UserType.User)
            this.isNormalUser = true;
    }
    loadNotifications() {
        //this.createNotification(1, "TEST", "SUBJECT", 10000);
        this.connection = this.notificationService.getNotifications().subscribe(notification => {
            console.log("Notification - received-> ", notification);
            // this.notification = JSON.parse(<any>notification);
            this.notificationVM = JSON.parse(<any>notification);
            //TODO: Notification Notification here
            switch (+this.notificationVM.typeId) {
                case EmitNotificationType.NotificationWindow: /** FOR NOTIFICATION WINDOW MESSAGE/S */
                    if (this.notificationVM.userNotification != null) {
                        this.createHtmlNotification(this.notificationVM.userNotification.id, this.notificationVM.userNotification.subject, this.notificationVM.userNotification.body, 2000);
                        //this.createNotification(this.notificationVM.userNotification.id, this.notificationVM.userNotification.subject, + "/n" + this.notificationVM.userNotification.body, 5000);                        
                        this.msgCount++;
                        this.msgCounter.emit(this.msgCount);
                    }
                    break;
                case EmitNotificationType.ProgressWindow: /**FOR PROGRESS WINDOW NOTIFICATION */
                    this.hideProgressBar = true;
                    if (this.notificationVM.progressNotification) {
                        this.value = this.notificationVM.progressNotification.progress;
                        this.analyticsProgress = this.notificationVM.progressNotification.message;
                        if (this.notificationVM.progressNotification.progress == 100) {
                            this.showProgress(this.notificationVM.progressNotification);
                        }
                    }
                    break;
            }
        });
    }

    createNotification(id: number, title: string, content: string, timeOut: number) {
        var notification = this._service.success(title, content, { id: id, timeOut: timeOut });
        notification.click.subscribe(item => this.onShowToaster());
    }
    onShowToaster() {
        this.viewNotificationResult(this.notificationVM.userNotification.id);
        this.showNotificationDiv = true;
        this.showNotificationStoryDiv = false;
    }

    onShowNewTask() {
        this.displayAddActivity = true;

    }

    updateEnable(topics) {
        if (topics.enabled) {
            topics.sendEmail = false;
        }
    }


    //this method will be called in page load to get total notifications list from API
    loadNotificationList() {
        Util.responseToObjects<INotificationsList>(this.notificationService.GetNotificationList())
            .subscribe(model => {
                this.notificationsList = model;
                this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.notificationsList);
                let sessionHelper = new SessionHelper();
                this.userEmail = sessionHelper.getUser().email;
            });
    }

    getFilterList(filterBy: string) {
        this.selectedTab = filterBy;
        this.filterNotificationsText = "";
        this.FilterList(filterBy);
    }
    // method to filter the notifcations by readStatus
    FilterList(filterBy: string) {
        this.showTodo = false;
        this.selectedNotificationFilter = filterBy;
        let readStatus = false;
        switch (filterBy) {
            case "Read":
                readStatus = true;
                this.finalList = this.notificationsList.filter(notification => notification.readStatus == readStatus);
                break;
            case "Unread":
                this.finalList = this.notificationsList.filter(notification => notification.readStatus == readStatus);
                break;
            case "All":
                this.finalList = this.notificationsList;
                break;
            case "ToDo":
                this.showTodo = true;
                break;
            default:
                this.finalList = this.notificationsList;
                break;
        }
        if (filterBy != "ToDo")
            this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.finalList);
    }

    //this method will be called while changing the group by elemennt in UI
    groupNotifications(param) {
        this.selectedDisplayCategory = param;
        this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.finalList);
    }

    //This method is used to update the status of the notification
    updateNotificationStatus($event) {
        let notificationId = $event[0];
        let operationName: string = $event[1];
        this.updateStatus(notificationId, operationName);
    }

    updateStatus(notificationId: number, operationName: string) {
        switch (operationName) {
            case "Read": // Read the Notification
            case "UnRead": // UnRead the Notification              
                let newStatus = ((operationName == 'Read') ? false : true);
                this.notificationService.ReadNotification({ 'ids': [notificationId], 'readStatus': newStatus })
                    .subscribe(model => {
                        console.clear();
                        console.log("start time:", new Date());
                        let notlst = this.finalList.filter(rec => rec.id == notificationId);
                        notlst[0].readStatus = ((operationName == 'Read') ? false : true);
                        //This should be moved when Live(Toast) notifications take place             
                       // this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.notificationsList); // commented for reduce the time to update status
                        console.log("After ProcessNotificationDisplay time:", new Date());
                        this.FilterList(this.selectedNotificationFilter);
                        console.log("End time:", new Date());
                    });
                break;
            case "Delete": // Delete the Notification 

                this.notificationService.DeleteNotification(notificationId)
                    .subscribe(deleteNotification => {
                        this.finalList = this.finalList.splice(this.finalList.findIndex(x => x.id == notificationId), 1);
                        this.FilterList(this.selectedNotificationFilter);
                    });
                break;
        }
    }

    viewNotificationResult(notificationId) {
        // //this.loadNotificationList();        
        // Util.responseToObjects<INotificationsList>(this.notificationService.GetNotificationList())
        //     .subscribe(model => {
        //         this.notificationsList = Util.sortBy(model, 'createdOn');
        //         this.finalList = this.notificationsList;
        //         this.notificationInformation = this.notificationsList.filter(e => e.id == notificationId);
        //         this.updateStatus(notificationId, "UnRead");
        //         this.routeLink();
        //     });        
        this.notificationInformation = this.notificationsList.filter(e => e.id == notificationId);
        this.updateStatus(notificationId, "UnRead");
        this.showNotificationDiv = false;
        this.showNotificationStoryDiv = true;
    }


    //This method is used to display the notification in UI
    private ProcessNotificationDisplay(groupBy: string, notificationsList: INotificationsList[]) {
        //console.log("grouBy: ", groupBy);
        let groupNames: string[] = [];
        //Loop each notification
        notificationsList.forEach(notification => {
            if (groupBy == "Date")
            { 
                notification.displayGroup = this.getDayNotation(notification.createdOn); 
            }
            else {
                notification.displayGroup = notification.notificationCategoryType.name;
            }
            let catExists = groupNames.find(c => c == notification.displayGroup);
            if (catExists == undefined) {
                groupNames.push(notification.displayGroup);
            }
        });
        this.displayGroups = groupNames;
        this.finalList = notificationsList;
        this.notificationsCounter();
    }

    //This method is used to Display the Notifications with date filter
    private getDayNotation(date) {
        let shortDate = this.formatDate(date);
        let yesterday = this.formatDate(this.getDate(-1));
        let lastWeekStart = this.formatDate(this.getDate(-2));
        let lastWeekEnd = this.formatDate(this.getDate(-7));

        if (shortDate == this.formatDate(new Date()))
            return "Today";
        else if (shortDate == yesterday)
            return "Yesterday";
        else if (Date.parse(lastWeekStart) >= Date.parse(shortDate) && Date.parse(shortDate) <= Date.parse(lastWeekEnd)) {
            return "Last Week";
        }
        else {
            return "Older";
        }
    }

    //This method is used to show the preferences div
    showPreferences(param) {
        this.showPreferencesDiv = param;
        this.showNotificationStoryDiv = false;
        this.showNotificationDiv = true;
        if (param == true) {
            Util.responseToObjects<ISubscribeNotificationTopics>(this.notificationService.getAllSubscribeNotificationTopic())
                .subscribe(notificationCategoryModel => {
                    this.notificationTopics = notificationCategoryModel;
                });
        }

    }

    //This method is used to Save the preferences
    onSave() {

        this.subscribeNotifications = <ISubscribeNotifications>{ email: this.userEmail, notificationTopics: [] };
        this.notificationTopics.forEach(t => {
            this.subscribeNotifications.notificationTopics.push(<ISelectedNotifications>{ id: t.id, isEmail: t.sendEmail, isEnable: t.enabled });
        })
        //console.log(this.saveNotifications);
        Util.responseToObjects<ISubscribeNotifications>(this.notificationService.subscribeNotifications(this.subscribeNotifications))
            .subscribe(model => {
                //console.log('success message:', model);
            });
        // alert('Notification preferences successfully saved');
        // this.showPreferencesDiv = false;
        // this.showNotificationDiv = true;
    }

    getSubscribeNotificationTopic() {
        Util.responseToObjects<INotificationTopics>(this.notificationService.getAllNotificationCategories())
            .subscribe(notificationCategoryTypeModel => {
                this.notificationTopic = notificationCategoryTypeModel;
                this.notificationTopic.forEach(cat => {
                    let catExists = this.notificationCategoryList.find(c => c.notificationCategoryId == cat.notificationCategoryId);
                    if (catExists == undefined) {
                        this.notificationCategoryList.push(<INotificationTopics>{
                            notificationCategoryId: cat.notificationCategoryId,
                            notificationCategoryName: cat.notificationCategoryName,
                            code: cat.code,
                            iconUrl: cat.iconUrl,
                            subjects: [cat.subject]
                        });
                    }

                    else {
                        catExists.subjects.push(cat.subject);
                    }
                })
            });

        Util.responseToObjects<ISubscribeNotificationTopics>(this.notificationService.getAllSubscribeNotificationTopic())
            .subscribe(notificationCategoryModel => {
                this.notificationTopics = notificationCategoryModel;
            });
    }

    //search Notification
    onFilterkeyUp(event) {
        this.emptySearch(event.key);
    }

    emptySearch(key) {
        if (key == "Backspace") {
            if (!this.filterNotificationsText) {
                if (this.showTodo) {
                    this.finalActivitiesList = this.activityList;
                    this.ProcessActivitiesDisplay("Date", this.finalActivitiesList);
                }
                else {
                    this.FilterList(this.selectedNotificationFilter);
                    this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.finalList);
                }
            }
            else {

                if (this.showTodo) {
                    this.finalActivitiesList = this.activityList.filter(x => x.name.toLowerCase().indexOf(this.filterNotificationsText.toLowerCase()) >= 0)
                    this.ProcessActivitiesDisplay("Date", this.finalActivitiesList);
                }
                else {
                    this.FilterList(this.selectedNotificationFilter);
                    this.finalList = this.finalList.filter(x => x.subject.toLowerCase().indexOf(this.filterNotificationsText.toLowerCase()) >= 0);
                    this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.finalList)
                }
            }
        }
    }

    filterNotifications(event) {
        let filterText;
        if (!this.filterNotificationsText) {
            filterText = event.key;
        }
        else {
            filterText = this.filterNotificationsText + event.key;
        }

        //Filter data here
        if (this.showTodo == true) {
            this.finalActivitiesList = this.activityList.filter(x => x.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
            this.ProcessActivitiesDisplay("Date", this.finalActivitiesList)
        }
        else {
            this.FilterList(this.selectedNotificationFilter);
            this.finalList = this.finalList.filter(x => x.subject.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
            this.ProcessNotificationDisplay(this.selectedDisplayCategory, this.finalList)
        }
    }
    //End search Notification

    //ToDo-Activities
    //Get Activities from API
    getActivities() {
        this.showTodo = true;
        this.selectedTab = "ToDo";
        this.filterNotificationsText = "";
        Util.responseToObjects<IActivities>(this.notificationService.getActivities())
            .subscribe(activities => {
                activities = Util.sortBy(activities);
                activities = activities.filter(act => act.isCompleted != true);
                this.activityList = Util.sortBy(activities);
                this.ProcessActivitiesDisplay("Date", this.activityList);
            });
    }

    //This method is used to display ToDo activities in grouped format.
    ProcessActivitiesDisplay(groupBy: string, activitiesList: IActivities[]) {
        let groupNames: string[] = [];
        //Loop each activity
        activitiesList.forEach(activity => {
            if (groupBy == "Date") {
                activity.displayGroup = this.getDayNotation(activity.createdOn);
            }
            let catExists = groupNames.find(c => c == activity.displayGroup);
            if (catExists == undefined) {
                groupNames.push(activity.displayGroup);
            }
        });
        this.displayActivityGroups = groupNames;
        this.finalActivitiesList = activitiesList;
    }
    //Activity Creation
    createActivity() {
        //console.log("tesr:", JSON.stringify(this.activity));
        if (this.activity.name == "" || this.activity.name == undefined || this.activity.description == "" || this.activity.description == undefined) {
            alert("Please fill all the fields.");
            this.displayAddActivity = true;
            return;
        }
        Util.responseToObjects<IActivities>(this.notificationService.createActivity(this.activity))
            .subscribe(result => {
                //console.log('Activity success message', result);
                this.closePopup();
                this.getActivities();
            });
    }

    //Close popup
    closePopup() {
        this.activity.name = "";
        this.activity.description = "";
        this.displayAddActivity = false;
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "", field: "chck", width: 30, checkboxSelection: true, filter: 'number' },
            <ColDef>{ headerName: "User ID", field: "id", width: 75, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "User Name", field: "name", width: 125, filter: 'text' },
            <ColDef>{ headerName: "Role", field: "role.name", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Status", field: "status", width: 110, cellClass: 'text-center', cellRenderer: this.statusRenderer, floatCell: true, filterParams: { cellRenderer: this.statusFilterRenderer }, suppressMenu: true }
        ];
    }

    /** renders status for row data */
    private statusRenderer(params) {
        return '<span><img src="../app/assets/img/' + (params.value == 1 ? 'green' : 'grey') + '-dot.png"/></span>';
    }

    /** Renders based on status filter  */
    statusFilterRenderer(params) {
        let filterParam = true;
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png"/>';
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png"/>';
        else
            return null;

        if (filterParam && params.value === 1) {
            result += '(no records)';
        }
        return result + '</span>';
    }

    /** Default method for on load*/
    onUsersLoad() {
        this.errorMessage = '';
        this.ResponseToObjects<IUser>(this._userService.getUsers())
            .subscribe(users => {
                this.masterUsersData = users;
                this.usersData = users;
                this.gridOptions.api.sizeColumnsToFit();
            });
    }

    /** * method to display module updates on console*/
    private onModelUpdated() {
        //console.log('onModelUpdated');
    }

    //This method will update the status of the activity
    markComplete(id: number) {
        let activity = this.activityList.filter(record => record.id == id)[0];
        if (activity != undefined) {
            activity.isCompleted = true;
            return this.notificationService.updateActivity(id, activity)
                .subscribe(msg => {
                    //console.log("Activity Status updated");
                    this.activityList.find(a => a.id == id).isCompleted = true;
                    this.finalActivitiesList = this.activityList.filter(act => act.isCompleted != true);
                    this.ProcessActivitiesDisplay("Date", this.finalActivitiesList)
                },
                error => (console.log("Error: " + error)));
        }
    }

    showUsers(id: number) {
        //console.log("Id:" + id);
        this.selectedActivityId = id;
        this.displayUsers = true;

        //Setting users data from master Dataset
        this.usersData = this.masterUsersData;
        //Cast ActivityUser to IUser        
        Util.responseToObjects<ActivityUser>(this.notificationService.getUsersAssignedToActivity(this.selectedActivityId))
            .subscribe(users => {
                users.forEach(record => {
                    this.iUser = <IUser>{}
                    this.iUser.role = <IRole>{};
                    this.iUser.name = record.userName,
                        this.iUser.id = record.userId,
                        this.iUser.role.name = record.role,
                        this.iUser.status = record.status,
                        this.selectedUsers.push(this.iUser);
                })
                //this.selectedUsers = users;
                // console.log("Users:" + JSON.stringify(this.selectedUsers));
                this.selectedUsersGridOptions.api.setRowData(this.selectedUsers);
                this.selectedUsers.forEach(item =>
                    this.usersData = this.usersData.filter(record => record.id != item.id)
                );
                this.gridOptions.api.setRowData(this.usersData);

            });
    }

    private assignUser() {
        let selUsers = this.gridOptions.api.getSelectedRows();
        if (selUsers == undefined || selUsers.length == 0) {
            this.assignUserErrorMsg = "Please select atleast one record to assign.";
        }
        else {
            this.assignUserErrorMsg = "";

            selUsers.forEach(item => {
                //Remove selected values from 'All Users'. 
                this.usersData = this.usersData.filter(record => record.id != item.id)
                //Push selected values to 'Assigned Users'    
                this.selectedUsers.push(item);
            });
            this.selectedUsersGridOptions.api.setRowData(this.selectedUsers);
            this.gridOptions.api.setRowData(this.usersData);
        }
    }
    private removeUser() {
        let users = this.selectedUsersGridOptions.api.getSelectedRows();
        if (users == undefined || users.length == 0) {
            this.assignUserErrorMsg = "Please select atleast one record to remove.";
        } else {
            this.assignUserErrorMsg = "";
            users.forEach(item => {
                this.selectedUsers = this.selectedUsers.filter(record => record.id != item.id);
                this.usersData.push(item);
                this.gridOptions.api.setRowData(this.usersData);
                this.selectedUsersGridOptions.api.setRowData(this.selectedUsers);
            });
        }
    }
    private assignAllUsers() {
        this.selectedUsers = this.selectedUsers.concat(this.usersData);
        this.usersData = [];
        this.selectedUsersGridOptions.api.setRowData(this.selectedUsers);
        this.gridOptions.api.setRowData(this.usersData);

    }
    private removeAllUsers() {
        this.usersData.length == 0 ?
            this.usersData = this.selectedUsers.concat(this.usersData) : this.usersData = this.usersData.concat(this.selectedUsers);
        this.selectedUsers = [];
        this.selectedUsersGridOptions.api.setRowData(this.selectedUsers);
        this.gridOptions.api.setRowData(this.usersData);
    }

    AssignUsersToActivity() {
        var userIds = [];
        this.selectedUsers.forEach(record => {
            userIds.push(record.id);
        });
        if (userIds.length != 0) {
            return this.notificationService.AssignUsersToActivity(this.selectedActivityId, userIds)
                .subscribe(msg => {
                    //console.log("Assign User:" + JSON.stringify(msg));
                    this.closeUsersPopup();
                },
                error => (console.log("Error: " + error))
                );
        }
    }
    closeUsersPopup() {
        this.assignUserErrorMsg = "";
        this.displayUsers = false;
        this.selectedActivityId = 0;
        this.usersData = []
        this.selectedUsers = []
    }
    //End Activity

    /** Shows progress bar when the actual process starts */
    showProgress(progressNotification: IProgressNotification) {
        /******** COULD BE USED WHEN PROGRESS BAR IS NEEDED WHENEVER PROCESS GETS INITIATED *****/
        //this.analyticsProgress = 'Data Analytics is in progress ....... ';
        let interval = setInterval(() => {
            //this.value = this.value + Math.floor(Math.random() * 10) + 1;
            if (progressNotification.progress == 100) {
                this.hideProgressBar = false;
                // progressPercent = 100;
                this.msgs = [{ severity: 'info', summary: progressNotification.status, detail: progressNotification.message }];
                clearInterval(interval);
            }
        }, 2000);
        this.loadNotificationList();
    }

    showNotifications() {
        this.showNotificationDiv = true;
        this.showNotificationStoryDiv = false;
    }
    notificationsCounter() {
        this.msgCount = this.notificationsList.filter(notification => notification.readStatus == false).length;
        this.msgCounter.emit(this.msgCount);
    }
    clearSearch() {
        this.filterNotificationsText = "";
        this.emptySearch("Backspace");
    }
    updateUserEmail() {
        this.ShowProfilePopup.emit();
    }

    // /** Close Progress bar and let the progress run behind */
    // closeProgressBar() {
    //     this.hideProgressBar = true;
    // }

    //This methos is to display top 4 Notifications
    viewAllNotifications() {
        this.showAllNotificaitons = true;
    }

    //This methos is to display top 5 Activities
    viewAllActivities() {
        this.showAllActivities = true;
    }
    routeLink() {
        //console.log('Not Info', this.notificationInformation[0].notificationCategoryType.name);
        if (this.notificationInformation[0].notificationCategoryType.name == "Trade Generation") {
            this._router.navigate(['/eclipse/tradeorder/list']);
        }
        else if (this.notificationInformation[0].notificationCategoryType.name == "Model Assignment Approval") {
            this._router.navigate(['/eclipse/model/list']);
        }
        else if (this.notificationInformation[0].notificationCategoryType.name == "Model Change Approval") {
            this._router.navigate(['/eclipse/model/list']);
        }
    }

    createHtmlNotification(id: number, body: string, subject: string, timeOut: number) {
        this._service.html("<div class='toaster'><h5>" + "<i class='fa fa-area-chart text-info'>" + "</i>" + body + "</h5><p>" + "<div class='notification-cat'>" + subject + "<div>" + '</p><p><a href="javascript:void(0);">click here</a></p></div>', "success", { timeOut: timeOut, clickToClose: false, showProgressBar: false });
        // this._service.html("<div class='toaster'><h5>" + "<div class='fa fa-area-chart text-info'" + body + "</div>"
        //     + "</h5><p>" + "<div class='notification-cat'" + subject + "</div>" + '</p><p><a href="javascript:void(0); class="fa fa-trash-o"">click here</a></p></div>', "success", { timeOut: timeOut, clickToClose: false, showProgressBar: false });
    }
}


