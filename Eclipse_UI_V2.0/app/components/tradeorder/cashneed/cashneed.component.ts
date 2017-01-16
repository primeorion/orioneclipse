import { Component, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { IRaiseCash, ISellMethod } from '../../../models/raisecash';
import { TradeOrderFilterComponent } from '../shared/tradeorder.tradefilter.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { IPortfolio, IPortfolioViewModel, IAccount, IPortfolioFilters } from '../../../models/portfolio';
import { IExcelImport, IGenerateTrades, ITradeSecurity, IFileUploadResult } from '../../../models/tradetools';
//import { PortfolioService } from '../../../services/portfolio.service';
import { TradeToolsService } from '../../../services/tradetools.service';
import { ICashNeedParentModel } from '../../../models/cashneed';
@Component({
    selector: 'eclipse-cashneed-cashneed',
    templateUrl: './app/components/tradeorder/cashneed/cashneed.component.html',
    providers: [TradeToolsService]
})

export class CashNeedComponent extends BaseComponent implements AfterViewInit {
    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;
    selectedModel: IRaiseCash;
    generateTradesData = <IGenerateTrades>{};
    noOfAccounts: number;
    uploadedRecords: IFileUploadResult;
    private viewName: string = "SelectionTab";
    instanceId: any;
    private showEmphasisTab: string;
    private portfolios: IPortfolio[] = [];
    queryStringVal: string;
    selectedPortfoliosList: any[] = [];
    disableFilterNextBtn: boolean = true;
    //@Output() excelData = new EventEmitter();
    excelData: IFileUploadResult;
    parentModelData : ICashNeedParentModel;

    constructor(private _router: Router, private activatedRoute: ActivatedRoute, private _tradeToolsService: TradeToolsService) {
        super();
        // this.selectedModel = <IRaiseCash>{ notes: "", sellModel: {} };
        // this.selectedModel.parentModelData = {
        //     selectedVal: '', selectedAccountsList: this.selectedPortfoliosList,
        //     showAccounts: false, showModel: false,
        //     showPortfolio: true, showExcelImport: true, showSleeves: false,
        //     showtradeGroupsForPortfolio: true, showtradeGroupsForAccounts: false,
        //     showExcelImportPortfolio: false, showExcelImportSleeves: false,
        //     portfolioId: ""
        // }
        this.parentModelData = <ICashNeedParentModel>{
            notes: "", sellModel: {}, selectedVal: '', selectedAccountsList: this.selectedPortfoliosList, portfolioId: "",
            displayFilterOptions: {
                showPortfolio: true, showAccounts: false, showModel: false, showSleeves: false, showExcelImport: true, showtradeGroupsForAccounts: false,
                showtradeGroupsForPortfolio: true, showExcelImportPortfolio: false, showExcelImportSleeves: false
            }
        }

        this.activatedRoute.params
            .map(params => params['portfolioId'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
    }

    ngOnInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.parentModelData.portfolioId = this.queryStringVal;
        }
    }
    ngAfterViewInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.getView("finalTab");
        }
    }
    getView(viewName: string) {
        if (this.tradeOrderFilterComponent != undefined && this.tradeOrderFilterComponent.tradeFilterMethod != undefined) {
            this.parentModelData.selectedVal = this.tradeOrderFilterComponent.tradeFilterMethod;
            this.parentModelData.selectedAccountsList = this.tradeOrderFilterComponent.List;
            this.noOfAccounts = this.tradeOrderFilterComponent.List.length;
            this.uploadedRecords = this.tradeOrderFilterComponent.uploadResults;

        }
        if (this.uploadedRecords != null && viewName == "SelectionTab") {
            console.log('uploaded data', this.uploadedRecords);
            this.excelData = this.uploadedRecords;
        }
        this.showEmphasisTab = "none";
        this.viewName = viewName; console.log(this.viewName);
    }



    calculate() {
        //portfolio
        //tradeGroupsForPortfolio
        this.generateTradesData.portfolioIds = [];
        this.generateTradesData.portfolioTradeGroupIds = [];
        switch (this.parentModelData.selectedVal) {
            case 'portfolio':
                this.parentModelData.selectedAccountsList.forEach(element => {
                    this.generateTradesData.portfolioIds.push(element.id);
                });
                this.generateTradesData.reason = this.parentModelData.notes;
                break;
            case 'tradeGroupsForPortfolio':
                this.parentModelData.selectedAccountsList.forEach(element => {
                    this.generateTradesData.portfolioTradeGroupIds.push(element.id);
                });
                this.generateTradesData.reason = this.parentModelData.notes;
                break;
            case 'excelImport':
                //Preparing numeric array from uploaded excel file
                this.uploadedRecords.records.forEach(record => {
                    if (record.isValid) {
                        this.generateTradesData.portfolioIds.push(record.id);
                    }
                });
                break;
        }

        this.ResponseToObjects<number>(this._tradeToolsService.CashNeedGenerateTrade(this.generateTradesData))
            .subscribe(data => {
                this.instanceId = data;
                this._router.navigate(['eclipse/tradeorder/list']);
            })

    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersDate(event) {
        this.disableFilterNextBtn = event.value;
    }

}