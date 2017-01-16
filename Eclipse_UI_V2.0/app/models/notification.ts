export interface INotification {
    subject: string,
    body: string,
    timestamp: string,
    notificationCategory: INotificationCategory,
    notificationCategoryType: INotificationCategoryType,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}
export interface INotificationCategory {
    notificationCategoryTypeId: number,
    code: string,
    enabled: boolean,
    sendEmail: boolean,
    isDeleted: boolean,
    createdOn: Date,
    editedOn: Date,
    createdBy: number,
    editedBy: number

}

export interface INotificationCategoryType {
    id: number,
    name: string,
    code: string
    iconUrl: string
}
// export interface INotificationTopics {
//     id: number,
//     name: string,
//     code: string,
//     description: string,
//     iconUrl: string,
//     subject: string,
//     deliveryMode: number,
//     notificationCategoryId: number,
//     notificationCategoryName: string,
//     enabled: number,
//     sendEmail: number,
//     isDeleted: number,
//     createdOn: Date,
//     editedOn: Date,
//     createdBy: string,
//     editedBy: string
// }

export interface INotificationTopics {
    id: number,
    name: string,
    code: string,
    description: string,
    iconUrl: string,
    subject: string,
    deliveryMode: number,
    notificationCategoryId: number,
    notificationCategoryName: string,
    subjects: any[]

}
export interface ISubscribeNotificationTopic {
    notificationCategoryTypeId: number,
    sendEmail: boolean
}
export interface INotificationsList {
    id: number,
    subject: string,
    body: string,
    readStatus: boolean,
    notificationCategory: INotificationCategory,
    notificationCategoryType: INotificationCategoryType,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number,
    displayGroup: string
}

export interface NotificationViewModel {
    notificationsList: INotificationsList[],
    categories: INotificationCategory[]
}

export interface notificationStausUpdate {
    ids: number[],
    readStatus: boolean
}

export interface ISubscribeNotificationTopics {
    id: number,
    name: string,
    code: string,
    description: string,
    iconUrl: string,
    subject: string,
    deliveryMode: number,
    notificationCategoryId: number,
    notificationCategoryName: string,
    enabled: boolean,
    sendEmail: boolean,
    isDeleted: boolean,
    createdOn: Date,
    editedOn: Date,
    createdBy: number,
    editedBy: number
}

// export interface INotificationTopicsvm {
//     notificationList: INotificationsList[],
//     notificationTopics: INotificationTopics[]
// }

export interface ISubscribeNotifications {
    email: string,
    notificationTopics: ISelectedNotifications[]
}

export interface ISelectedNotifications {
    id: number,
    isEnable: boolean,
    isEmail: boolean
}

export interface IActivities {
    name: string,
    description: string,
    id: number,
    isCompleted: boolean,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string,
    displayGroup: string

}
export interface INotificationModel {
    typeId: number,
    code: string,
    detail: INotificationsList
}
export interface ActivityUser {
    userId : number,
	userName: string,
	role: string,
	status:number
}

/** NOTIFICATION VIEW MODEL */
export interface INotificationVM {
    typeId: number;
    menuNotification: IMenuNotification;
    progressNotification: IProgressNotification;
    userNotification: IUserNotification;
}

/** PROGRESS NOTIFICATION */
export interface IProgressNotification {
    message: string,
    progress: number,
    status: string
}

/** MENU NOTIFICATION */
export interface IMenuNotification {
    type: string,
    total: number,
    increment: number;
}

/** USER NOTIFICATION */
export interface IUserNotification {
    id: number,
    subject: string,
    body: string,
    readStatus: number,
    notificationCategory: INotificationCategory,
    notificationCategoryType: INotificationCategoryType,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}





