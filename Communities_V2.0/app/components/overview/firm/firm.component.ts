import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import {Response} from '@angular/http';
import { ITabNav, OverviewTabNavComponent } from '../shared/overview.tabnav.component';
import { OverviewLeftNavComponent } from '../../../shared/leftnavigation/overview.leftnav.component';
import { OverviewBreadcrumbComponent } from '../../../shared/breadcrumb/overviewbreadcrumb';
import { DonutChartService } from '../../../services/donutchart.service';
import { LineChartService } from '../../../services/linechart.service';
import {OverviewService}  from '../../../services/overview.service';
import {IAumSummery, IAccountSummery, ICashFlowSummery} from '../../../models/overview'
import { ActivatedRoute }    from '@angular/router';

@Component({
    selector: 'community-firm',
    templateUrl: './app/components/overview/firm/firm.component.html',
})

export class FirmComponent extends BaseComponent {
    private tabsModel: ITabNav;
    firmData: any[] = [];
    totalValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    colorCodes: string[] = [];
    percentChange: number;
    paramsSub: any;
    overtype: any;
    startDate: string;
    endDate: string;
    cashFlowSummery: any = [];
    cashFlowFirmData: any[] = [];
    SelectedTimeFrame: string;
    dateRangeCheck: boolean = false;
    maxDateValue : Date = new Date();
    
    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService,
        private activatedRoute: ActivatedRoute, private _lineChartService: LineChartService) {
        super();
        this.tabsModel = <ITabNav>{};
        // this.paramsSub = Util.getRouteParam<string>(this.activatedRoute, 'overtype');
        this.selectedDate = (new Date()).toLocaleDateString();
        this.endDate = this.selectedDate;
        this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
        this.activeRoute = Util.activeRoute(this.activatedRoute);
        console.log('activeRoute: ', this.activeRoute);
        if (this.activeRoute == "aumfirm") {
            this.tabsModel.route = 'aum';
            this.getAumFirmSummery("firm", this.selectedDate);
        } else if (this.activeRoute == "accountsfirm") {
            this.tabsModel.route = 'accounts';
            this.getAccountFirmSummery("firm", this.selectedDate);
        } else {
            this.tabsModel.route = 'cashflow';
            this.SelectedTimeFrame = "Daily";
            this.getCashFlowFirmSummery("firm", this.startDate, this.endDate);
        }
    }

    ngOnInit() {
    }

    getAumFirmSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                //this.aumSummaryData = model;
                this.totalValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.firmData = model.firms;
                this.firmData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._donutChartService.renderDonutChart("#firmDonut", this.firmData, this.colorCodes, this.tabsModel.route);
            });
    }
    getAccountFirmSummery(type, date) {
        this._overviewService.getAccountSummary(type, date)
            .map((response: Response) => <IAccountSummery>response.json())
            .subscribe(model => {
                this.totalValue = model.totalManagedAccount;
                this.totalPercent = model.totalPercent;
                //this.percentChange = model.percentChange;
                this.firmData = model.firms;
                this.firmData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._donutChartService.renderDonutChart("#firmDonut", this.firmData, this.colorCodes, this.tabsModel.route);
            });
    }
    getCashFlowFirmSummery(type, startDate, endDate) {
        this._overviewService.getCashFlowSummary(type, startDate, endDate)
            .map((response: Response) => <ICashFlowSummery>response.json())
            .subscribe(model => {
                this.cashFlowSummery = model;
                console.log("cashflow", this.cashFlowSummery);
                this.cashFlowFirmData = model.firms;
                this.cashFlowFirmData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._lineChartService.renderLineChart("#firmLineChart", this.cashFlowFirmData, this.SelectedTimeFrame, this.colorCodes,'firm');
            });
    }
    timeFrameOnChange(event) {
        if (event == "Custom") {
            this.dateRangeCheck = true;
        } else {
            this.dateRangeCheck = false;
        }
    }
    getFirmDataByDate() {
        if (this.selectedDate && this.activeRoute == "aumfirm") {
            this.colorCodes = [];
            this.getAumFirmSummery("firm", this.selectedDate);
        } else if (this.selectedDate && this.activeRoute == "accountsfirm") {
            this.colorCodes = [];
            this.getAccountFirmSummery("firm", this.selectedDate);
        } else if (this.startDate && this.endDate && this.activeRoute == "cashflowfirm") {
            this.colorCodes = [];
            if (this.SelectedTimeFrame == "Daily" || this.SelectedTimeFrame == "Weekly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
            }
            else if (this.SelectedTimeFrame == "Monthly" || this.SelectedTimeFrame == "Quarterly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setFullYear(new Date().getFullYear() - 1))).toLocaleDateString();
            }
            this.getCashFlowFirmSummery("firm", this.startDate, this.endDate);
        }
    }
     print(divName) {

        var printContents = document.getElementById(divName).innerHTML;
        var originalContents = document.body.innerHTML;
        alert(originalContents);
        //var inpText = document.getElementsByTagName("input")[0].value;
        //printContents += inpText
        document.body.innerHTML = printContents;
        window.print();
         document.body.innerHTML = originalContents;
    }

} 