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
    selector: 'community-model',
    templateUrl: './app/components/overview/model/model.component.html',
    directives: [OverviewTabNavComponent, OverviewLeftNavComponent, OverviewBreadcrumbComponent],
    providers: [DonutChartService, OverviewService]
})
export class ModelComponent extends BaseComponent {
    private tabsModel: ITabNav;
    aumModelData: any[] = [];
    colorCodes: string[] = [];
    totalMarketValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    percentChange: number;

    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService) {
        super();
        this.selectedDate = (new Date()).toLocaleDateString();
    }
    ngOnInit() {
        this.type = "model";
        this.getAumModelSummery(this.type, this.selectedDate);
    }
    getAumModelSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                //this.aumSummaryData = model;
                this.totalMarketValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.aumModelData = model.models;
                this.aumModelData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._donutChartService.renderDonutChart("#modelDonut", this.aumModelData, this.colorCodes);
            });
    }
     getAumDataByDate(){
        this.getAumModelSummery("model", this.selectedDate);
    }
}