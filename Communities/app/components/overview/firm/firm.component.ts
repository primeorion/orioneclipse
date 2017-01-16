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
    selector: 'community-firm',
    templateUrl: './app/components/overview/firm/firm.component.html',
    directives: [OverviewTabNavComponent, OverviewLeftNavComponent, OverviewBreadcrumbComponent],
    providers: [DonutChartService, OverviewService]
})

export class FirmComponent extends BaseComponent {
    private tabsModel: ITabNav;
    aumFirmData: any[] = [];
    // aumSummaryData: any = [];
    totalMarketValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    colorCodes: string[] = [];
    percentChange: number;

    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService) {
        super();
        this.selectedDate = (new Date()).toLocaleDateString();
    }

    ngOnInit() {
        this.type = "firm";
        this.getAumFirmSummery(this.type, this.selectedDate);
    }

    getAumFirmSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                //this.aumSummaryData = model;
                this.totalMarketValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.aumFirmData = model.firms;
                this.aumFirmData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                 this._donutChartService.renderDonutChart("#aumFirmDonut", this.aumFirmData, this.colorCodes);
                console.log("aumdddd", model);
            });
    }
    getAumDataByDate(){
        this.getAumFirmSummery("firm", this.selectedDate);
    }

} 