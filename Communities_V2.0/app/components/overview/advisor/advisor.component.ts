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
import {IAumSummery, IAccountSummery, ICashFlowSummery} from '../../../models/overview';
import { ActivatedRoute }    from '@angular/router';

@Component({
    selector: 'community-advisor',
    templateUrl: './app/components/overview/advisor/advisor.component.html',
})

export class AdvisorComponent extends BaseComponent {
    private tabsModel: ITabNav;
    advisorData: any[] = [];
    colorCodes: string[] = [];
    totalValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    percentChange: number;
    startDate: string;
    endDate: string;
    cashFlowSummery: any = [];
    cashFlowAdvisorData: any[] = [];
    SelectedTimeFrame: string;
    dateRangeCheck: boolean = false;
    maxDateValue : Date = new Date();

    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService,
        private activatedRoute: ActivatedRoute, private _lineChartService: LineChartService) {
        super()
        this.selectedDate = (new Date()).toLocaleDateString();
        this.endDate = this.selectedDate;
        this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
        this.tabsModel = <ITabNav>{};
        // this.paramsSub = Util.getRouteParam<string>(this.activatedRoute, 'overtype');
        this.activeRoute = Util.activeRoute(this.activatedRoute);
        console.log('activeRoute: ', this.activeRoute);
        if (this.activeRoute == "aumadvisor") {
            this.tabsModel.route = 'aum';
            this.getAumAdvisorSummery("advisor", this.selectedDate);
        } else if (this.activeRoute == "accountsadvisor") {
            this.tabsModel.route = 'accounts';
            this.getAccountAdvisorSummery("advisor", this.selectedDate);
        } else
            this.tabsModel.route = 'cashflow';
        this.SelectedTimeFrame = "Daily";
        this.getCashFlowAdvisorSummery("advisor", this.startDate, this.endDate);
    }

    ngOnInit() {
    }

    getAumAdvisorSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                this.totalValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.advisorData = model.advisors;
                this.advisorData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });

                this._donutChartService.renderDonutChart("#advisorDonut", this.advisorData, this.colorCodes, this.tabsModel.route);
            });
    }
    getAccountAdvisorSummery(type, date) {
        this._overviewService.getAccountSummary(type, date)
            .map((response: Response) => <IAccountSummery>response.json())
            .subscribe(model => {
                this.totalValue = model.totalManagedAccount;
                this.totalPercent = model.totalPercent;
                //this.percentChange = model.percentChange;
                this.advisorData = model.advisors;
                this.advisorData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });

                this._donutChartService.renderDonutChart("#advisorDonut", this.advisorData, this.colorCodes, this.tabsModel.route);
            });
    }
    getCashFlowAdvisorSummery(type, startDate, endDate) {
        this._overviewService.getCashFlowSummary(type, startDate, endDate)
            .map((response: Response) => <ICashFlowSummery>response.json())
            .subscribe(model => {
                this.cashFlowSummery = model;
                this.cashFlowAdvisorData = model.advisors;
                this.cashFlowAdvisorData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._lineChartService.renderLineChart("#advisorLineChart", this.cashFlowAdvisorData, this.SelectedTimeFrame, this.colorCodes,'advisor');
            });

    }
    timeFrameOnChange(event) {
        if (event == "Custom") {
            this.dateRangeCheck = true;
        } else {
            this.dateRangeCheck = false;
        }
    }
    getAdvisorDataByDate() {
        if (this.selectedDate && this.activeRoute == "aumadvisor") {
            this.colorCodes = [];
            this.getAumAdvisorSummery("advisor", this.selectedDate);
        } else if (this.selectedDate && this.activeRoute == "accountsadvisor") {
            this.colorCodes = [];
            this.getAccountAdvisorSummery("advisor", this.selectedDate);
        } else if (this.startDate && this.endDate && this.activeRoute == "cashflowadvisor") {
            this.colorCodes = [];
            if (this.SelectedTimeFrame == "Daily" || this.SelectedTimeFrame == "Weekly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
            }
            else if (this.SelectedTimeFrame == "Monthly" || this.SelectedTimeFrame == "Quarterly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setFullYear(new Date().getFullYear() - 1))).toLocaleDateString();
            }
            this.getCashFlowAdvisorSummery("advisor", this.startDate, this.endDate);
        }
    }
}
