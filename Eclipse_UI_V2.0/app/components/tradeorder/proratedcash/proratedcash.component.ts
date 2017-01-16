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
import { TradeOrderFilterComponent } from '../shared/tradeorder.tradefilter.component';
import * as Util from '../../../core/functions';
import { ITabNav } from '../shared/tradeorder.tabnav.component';
import { IProratedCash, ISellMethod } from '../../../models/raisecash';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
    selector: 'eclipse-prorated-cash',
    templateUrl: './app/components/tradeorder/proratedcash/proratedcash.component.html',
    providers: [PortfolioService]
})


export class ProratedCashComponent extends BaseComponent {

    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;

    private viewName: string = "SelectionTab";
    selectedModel: IProratedCash;
    selectedPortfoliosList: any[] = [];
    queryStringVal: string;
    noOfAccounts: number;
    action: string;
    showEmphasisTab: string;

    constructor(private _portfolioService: PortfolioService, private activatedRoute: ActivatedRoute) {
        super();
        this.selectedModel = <IProratedCash>{ notes: "", sellModel: {} };
        this.selectedModel.proratedModelData = { selectedVal: '', selectedAccountsList: this.selectedPortfoliosList, 
                                                 showPortfolio: true, showAccounts: false, showCalculatePortfolio: true, 
                                                 showModel: true, showtradeGroupsForAccounts:false, showSleeves:false,
                                                 showtradeGroupsForPortfolio:true, showExcelImport: true,
                                                 accountId: "" }
        this.activatedRoute.params
            .map(params => params['accountId'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
    }

    ngOnInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.selectedModel.proratedModelData.accountId = this.queryStringVal;
        }
    }

    ngAfterViewInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.getView("finalTab");
        }
    }
    getView(viewName: string) {
        if (this.tradeOrderFilterComponent != undefined && this.tradeOrderFilterComponent.tradeFilterMethod != undefined) {
            this.selectedModel.proratedModelData.selectedVal = this.tradeOrderFilterComponent.tradeFilterMethod;
            this.selectedModel.proratedModelData.selectedAccountsList = this.tradeOrderFilterComponent.List;
            this.noOfAccounts = this.tradeOrderFilterComponent.List.length;
        }
        this.showEmphasisTab = "none";
        this.viewName = viewName;
    }

    calculate() {
        this.selectedModel.sellModelList = <ISellMethod[]>[];
        this.selectedModel.proratedModelData.selectedAccountsList.forEach(element => {
            this.selectedModel.sellModelList.push(<ISellMethod>{ selectedVal: this.selectedModel.proratedModelData.selectedVal, selectedAccount: element });
        });
    }

}