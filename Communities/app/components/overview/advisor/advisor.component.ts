import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import {Response} from '@angular/http';
import { ITabNav, OverviewTabNavComponent } from '../shared/overview.tabnav.component';
import { OverviewLeftNavComponent } from '../../../shared/leftnavigation/overview.leftnav.component';
import { OverviewBreadcrumbComponent } from '../../../shared/breadcrumb/overviewbreadcrumb';
import { DonutChartService } from '../../../services/donutchart.service';
import {OverviewService}  from '../../../services/overview.service';
import {IAumSummery} from '../../../models/overview'

@Component({
    selector: 'community-advisor',
    templateUrl: './app/components/overview/advisor/advisor.component.html',
    directives: [OverviewTabNavComponent, OverviewLeftNavComponent, OverviewBreadcrumbComponent],
    providers: [DonutChartService, OverviewService]
})

export class AdvisorComponent extends BaseComponent {
    private tabsModel: ITabNav;
    aumAdvisorData: any[] = [];
    colorCodes: string[] = [];
    totalMarketValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    percentChange: number;

    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService) {
        super()
        this.selectedDate = (new Date()).toLocaleDateString();
    }

    ngOnInit() {
        this.type = "advisor";
        this.getAumAdvisorSummery(this.type, this.selectedDate);
    }

    getAumAdvisorSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                //this.aumSummaryData = model;
                this.totalMarketValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.aumAdvisorData = model.advisors;
                this.aumAdvisorData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });

                this._donutChartService.renderDonutChart("#advisorDonut", this.aumAdvisorData, this.colorCodes);
            });
    }
    getAumDataByDate() {
        this.getAumAdvisorSummery("advisor", this.selectedDate);
    }
}
