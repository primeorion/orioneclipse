import { Component, ViewChild, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs/Rx';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef, CsvExportParams } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../core/base.component';
import { NotificationService } from '../../../core/customSubService';
import * as Util from '../../../core/functions';
import { TradeOrderTabNavComponent } from '../../tradeorder/shared/tradeorder.tabnav.component';
//import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
import { TomService } from '../../../services/tom.service';
import { ITradeOrder } from '../../../models/tom';
import { ITabNav } from '../shared/tradeorder.tabnav.component';

@Component({
    selector: 'eclipse-editorder-list',
    templateUrl: './app/components/tradeorder/list/Editorder.component.html'
})

export class EditOrderComponenet extends BaseComponent {
    private tabsModel: ITabNav;
    private columnDefs: ColDef[];
    private tradeOrderData: ITradeOrder = <ITradeOrder>{};
    private orderTypes: any[] = [];
    private actionTypes: any[] = [];
    private qualifiers: any[] = [];
    private durations: any[] = []
    private tradeid:number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute,
        private builder: FormBuilder, private _tomService: TomService,
        private _notifier: NotificationService) {        
        super();
           this.tradeid = Util.getRouteParam<number>(this.activateRoute);
    };

    ngOnInit() {

        this.getDurations();
        this.getOrderTypes();
        this.getTradeActions();
        this.getQualifiers();
    }


    getDurations() {

        Util.responseToObjects<any>(this._tomService.getDurations())
            .subscribe(model => {
                this.durations = model;
            },
            error => {
                console.log(error)
            });
    }

    getOrderTypes() {
        Util.responseToObjects<any>(this._tomService.getOrderTypes())
            .subscribe(model => {
                this.orderTypes = model;
            },
            error => {
                console.log(error)
            });

    }

    getQualifiers() {

        Util.responseToObjects<any>(this._tomService.getQualifiers())
            .subscribe(model => {
                this.qualifiers = model;
            },
            error => {
                console.log(error)
            });

    }

    getTradeActions() {
        Util.responseToObjects<any>(this._tomService.getTradeActions())
            .subscribe(model => {
                this.actionTypes = model;
            },
            error => {
                console.log(error)
            });

    }


//     onSubmit(_orderSave: ITradeOrder) {
//        console.log("Save Data", JSON.stringify(_orderSave));       

//               this.responseToObject<ITradeOrder>(this._tomService.updateOrder(this.tradeid, _orderSave))
//                 .subscribe(model => {
//                     console.log(model)
//                 },
//                     error => {
//                 console.log(error)
//                 });

                
//     }

//   onSend(_orderSave: ITradeOrder) {
//         this.responseToObject<ITradeOrder>(this._tomService.updateOrder(this.tradeid,_orderSave))
//             .subscribe(model => {

//             }, error => {
//                 console.log(error);
//                 throw error;
//             });
//     }

    //
}





