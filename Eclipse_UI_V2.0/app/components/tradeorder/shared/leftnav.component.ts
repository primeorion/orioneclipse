import { Component, Input, OnInit } from '@angular/core';
import { IRole } from '../../../models/role';
import { SessionHelper } from '../../../core/session.helper';
import { PreferenceHelper } from '../../../shared/preference/preference.helper';
import * as Util from '../../../core/functions';
import { NotificationService } from '../../../core/customSubService';
import { TomService } from '../../../services/tom.service';

class MenuCount {
    total: number;
    updownCount: number;
    isdown: boolean;
    showUpdown: boolean;
}

@Component({
    selector: 'trade-leftmenu',
    templateUrl: './app/components/tradeorder/shared/leftnav.component.html',
    providers: [PreferenceHelper]

})
export class TradeLeftNavComponent {
    orders: MenuCount;
    files: MenuCount;
    notifySubscription: any;

    constructor(private _notifier: NotificationService, private _tomService: TomService) {
        this.orders = <MenuCount>{ total: 0, updownCount: 0 };
        this.files = <MenuCount>{ total: 0, updownCount: 0 };
    }

    ngOnInit() {
        this.notifySubscription = this._notifier.notify.subscribe((data: any) => {
            // if (data.type == "ORDERS")
            this.getTradeOrderCount();
            // else if (data.type == "FILES")
            this.getTradeFilesCount();
        });
    }

    ngOnDestroy() {
        this.notifySubscription.unsubscribe();
    }

    /** Get trade orders count to display in left menu */
    getTradeOrderCount() {
        Util.responseToObject<any>(this._tomService.getTradeOrderCount())
            .subscribe(model => {
                let tradeCount = model.noOfTrades;
                // console.log("trades with difference: previous ", this.orders.total, " current ", model);
                if (this.orders.total != 0 && this.orders.total != tradeCount) {
                    this.showUpdownCount(this.orders, model.noOfTrades);
                }
                this.orders.total = tradeCount;
            });
    }

    /** Get trade orders count to display in left menu */
    getTradeFilesCount() {
        Util.responseToObject<any>(this._tomService.getTradeFilesCount())
            .subscribe(model => {
                let fileCount = model.count;
                if (this.files.total != 0 && this.files.total != fileCount) {
                    this.showUpdownCount(this.files, model.count);
                }
                this.files.total = fileCount;
                // console.log("files with difference: previous ", this.files.total, " current ", model);
            });
    }

    showUpdownCount(model, count) {
        let updown = count - model.total;
        model.updownCount = updown < 0 ? -(updown) : updown;
        model.isdown = updown < 0;
        model.showUpdown = true;
        setTimeout(() => model.showUpdown = false, 3000);
    }

}
