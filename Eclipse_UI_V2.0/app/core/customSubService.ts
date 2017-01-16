
import { Injectable } from '@angular/core';
import { RequestEventEmitter, ResponseEventEmitter, NotifyEventEmitter, AlertEventEmitter } from './emitter';

@Injectable()
export class CustomSubService {
    beforeRequest: RequestEventEmitter;
    afterRequest: ResponseEventEmitter;
    constructor() {
        this.beforeRequest = new RequestEventEmitter();
        this.afterRequest = new ResponseEventEmitter();
    }
}

@Injectable()
export class NotificationService {
    notify: NotifyEventEmitter;
    ordersNotify: NotifyEventEmitter;
    tomRightPanelMT: NotifyEventEmitter;
    tomRightPanelMA: NotifyEventEmitter;
    constructor() {
        this.notify = new NotifyEventEmitter();
        this.ordersNotify = new NotifyEventEmitter();
        this.tomRightPanelMT = new NotifyEventEmitter();
        this.tomRightPanelMA = new NotifyEventEmitter();
    }
}

@Injectable()
export class AlertService {
    alert: AlertEventEmitter;
    constructor() {
        this.alert = new AlertEventEmitter();
    }
}
