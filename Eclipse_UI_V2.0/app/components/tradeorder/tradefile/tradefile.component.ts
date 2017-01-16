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
import { ITabNav } from '../shared/tradeorder.tabnav.component';
export { ITabNav } from '../../../viewmodels/tabnav';
import { ITradeFiles } from '../../../models/tom';
import { TomService } from '../../../services/tom.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'eclipse-trade-file',
    templateUrl: './app/components/tradeorder/tradefile/tradefile.component.html'
})

export class TradeFileComponent extends BaseComponent {

    private tabsModel: ITabNav;
    private columnDefs: ColDef[];
    private tradeFileGridOptions: GridOptions;
    tradeFile: ITradeFiles[] = [];
    date: string;
    selectedDate: string;
    //startDate: string;
    selectedTradeFileId: number;
    showDeletePopup: boolean;
    fileName: string;

    constructor(private _router: Router, private _tomService: TomService, private _notifier: NotificationService) {
        super(PRIV_APPROVELEVEL1);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'TF';
        this.createColumnDefs();
        this.tradeFileGridOptions = <GridOptions>{};
        this.selectedDate = this.formatDate(new Date());
        console.log('Date Formate', this.selectedDate);
        //this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
        this.tabsModel.isTrue = true;
    }

    ngOnInit() {
        this.date = new DatePipe('yMd').transform(new Date(), 'MM/dd/yyyy');
        this.onTradeFilesLoad(this.date);
    }

    /** Create column headers for ag-grid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "", field: "", width: 30, cellRenderer: this.refreshCellRenderer, cellClass: 'text-center', suppressMenu: true, suppressMultiSort: true },
            <ColDef>{ headerName: "File Name", field: "name", cellRenderer: this.fileFormatCellRenderer, width: 250, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Format", field: "format", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Created By", field: "createdBy", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Time", field: "createdOn", width: 75, cellRenderer: Util.timeRenderer, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Status", field: "status", width: 75, cellRenderer: this.statusCellRender, cellClass: 'text-center', suppressMenu: true }
        ]
    }

    /**status Cell Render */
    statusCellRender(params) {
        return params.data.status == 1 ? 'Sent' : 'Not Sent';
    }

    /**Refresh Cell Render */
    refreshCellRenderer(params) {
        var result = '<span>';
        result += '<i id ="' + params.data.id + '" name="' + params.data.name + '"  title="Reset File" class="fa fa-repeat blue" aria-hidden="true"></i></span>';
        return result;
    }

    /**File Format CellRender */
    fileFormatCellRenderer(params) {
        var result = '<span>';
        result += '<a href="' + params.data.URL + '" id=' + params.data.id + ' target="_blank"  title = "Downloaded File">' + params.data.name + '</a>';
        return result;
    }

    /**Grid load based on date */
    onTradeFilesLoad(date: any) {
        this.ResponseToObjects<ITradeFiles>(this._tomService.gettradeFiles(date))
            .subscribe(model => {
                this.tradeFile = model;//.filter(a => this.formatDate(a.createdOn) == date);
                this.tradeFileGridOptions.api.sizeColumnsToFit();
                this._notifier.notify.emit({ type: "FILES" });
            });
    }

    /**datepicker Render */
    startDateSelect(param) {
        this.date = param;
        this.onTradeFilesLoad(this.date);
    }

    /** Update TradeFile Status */
    updateTradeFileStatus(id: number) {
        Util.responseToObject<any>(this._tomService.updateTradeFile(id))
            .subscribe(model => {
                console.log("Before : ", this.tradeFile);
                this.tradeFile.forEach(element => {
                    if (element.id == id) {
                        element.status = model.status;
                    }
                    console.log("After : ", this.tradeFile);
                });
                this.tradeFileGridOptions.api.setRowData(this.tradeFile);
            }, error => {
                console.log("error : ", error);
            });
    }

    /** Delete trade order by id */
    deleteTradeFiles() {
        Util.responseToObjects<ITradeFiles>(this._tomService.deleteTradeFile(this.selectedTradeFileId))
            .subscribe(model => {
                console.log(this.date);
                this.onTradeFilesLoad(this.date);
                this.showDeletePopup = false;
            },
            error => {
                console.log(error)
            });
    }

    /** Hostlistener for ag-grid context menu actions */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let id = targetElement.id;
        if (targetElement.title == "Downloaded File") {
            this.updateTradeFileStatus(id)
        }
        else if (targetElement.title === "Reset File") {
            this.selectedTradeFileId = id;
            this.tradeFile.forEach(element => {
                if (element.id == id) {
                    this.fileName = element.name;
                }
            })
            this.showDeletePopup = true;
        }
    }
}