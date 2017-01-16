import { Component, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as Util from '../../../core/functions';
import { ModelMarketingService } from '../../../services/model.marketing.service';
import { ModelService } from '../../../services/model.service';
import { DonutChartService } from '../../../services/donutchart.service';
import { IModelCommentary, IModelMarketingDocument, IModelAdvertisement, IModelPerformance, IModelList } from '../../../models/model';
import { StrategistMarketingComponent } from '../../subscription/view/strategistmarketing.component';
@Component({
    selector: 'model-marketing',
    templateUrl: './app/components/subscription/view/modelmarketing.component.html'
})

export class ModelMarketingComponent extends BaseComponent {
    private modelId: number;
    private commentary: IModelCommentary = <IModelCommentary>{};
    private documents: IModelMarketingDocument[] = [];
    private advertisement: IModelAdvertisement = <IModelAdvertisement>{};
    private performance: IModelPerformance[] = [];
    private performanceByDate: any;
    private colorCodes: string[] = [];
    private model: IModelList = <IModelList>{};
    private performanceDate: string[] = [];
    private asOnDate: string;
    private strategistId: number;
    private checkDonutChart: boolean = true;
    @ViewChild(StrategistMarketingComponent) strategistComponent: StrategistMarketingComponent;
    constructor(private activateRoute: ActivatedRoute,
        private _router: Router,
        private _modelMarketingService: ModelMarketingService,
        private _modelService: ModelService, private _donutChartService: DonutChartService) {
        super();
        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.modelId = params['id'];
            if (params['strategistId'] != undefined)
                this.strategistId = params['strategistId'];
        });

        this.modelId = Util.getRouteParam<number>(this.activateRoute);
        this.getMarketingComentary(this.modelId);
        this.getModelDocuments(this.modelId);
        this.getModelAdvertisment(this.modelId);
        this.getModelPerformance(this.modelId);
        this.modelDetails(this.modelId);
        // if (this.strategistComponent != undefined)
        //     this.strategistId = this.strategistComponent.strategistId;
    }
    //get model marketing commentary
    getMarketingComentary(modelId) {
        this.responseToObject<IModelCommentary>(this._modelMarketingService.getModelCommentary(modelId))
            .subscribe(commentary => {
                this.commentary = commentary;
            });
    }
    //get model documents
    getModelDocuments(modelId) {
        this.responseToObject<IModelMarketingDocument>(this._modelMarketingService.getMarketingDocuments(modelId))
            .subscribe(documents => {
                this.documents = <any>documents;
            });
    }
    // get model advertisment based on modelId
    getModelAdvertisment(modelId) {
        this.responseToObject<IModelAdvertisement>(this._modelMarketingService.getModelAdvertisement(modelId))
            .subscribe(advertisment => {
                this.advertisement = advertisment;
            });
    }
    // get model performances based on modelId
    getModelPerformance(modelId) {
        this.responseToObject<IModelPerformance>(this._modelMarketingService.getModelPerformance(modelId))
            .subscribe(performance => {
                this.performance = <any>performance;
                let checkDateUnque = {};
                for (var i = 0; i < this.performance.length; i++) {
                    if (!checkDateUnque[this.performance[i].asOnDate]) {
                        checkDateUnque[this.performance[i].asOnDate] = true;
                        this.performanceDate.push(this.performance[i].asOnDate);
                    }
                }
                this.performanceDate.sort();
                this.asOnDate = this.performanceDate.reverse()[0];
                this.performanceByDate = this.performance.filter(x => x.asOnDate == this.asOnDate);
            });
    }

    //performance based on date
    getPerformanceByDate() {
        this.performanceByDate = this.performance.filter(x => x.asOnDate == this.asOnDate);

    }

    //model details
    modelDetails(modelId) {
        this.responseToObject<IModelList>(this._modelService.getModelView(modelId))
            .subscribe(model => {
                this.model.securities = model.securities;
                this.allocatiionChart(model.securities, "category");
            });
    }
    //allocation Chart
    allocatiionChart(modelSecurities, type) {
        let check = {}, chartData = [];
        for (var i = 0; i < modelSecurities.length; i++) {
            if (type == "category") {
                this.colorCodes = [];
                if (!check[modelSecurities[i].category]) {
                    check[modelSecurities[i].category] = true;
                    // Filter
                    let filterResult = modelSecurities.filter(x => x.category == modelSecurities[i].category);
                    if (filterResult.length == 1) {
                        chartData.push({ "name": (modelSecurities[i].category == null) ? "" : modelSecurities[i].category, 
                        "value": filterResult[0].allocation });
                    }
                    else {
                        let value = 0;
                        filterResult.forEach(element => {
                            value = value + element.allocation
                        });
                        chartData.push({ "name": (modelSecurities[i].category == null) ? "" : modelSecurities[i].category, 
                        "value": value });
                    }
                    chartData.forEach((item) => {
                        this.colorCodes.push(this.getRandomColor());
                    })
                }
            }
            else {
                this.colorCodes = [];
                if (!check[modelSecurities[i].assetClass]) {
                    check[modelSecurities[i].assetClass] = true;
                    // Filter
                    let filterResult = modelSecurities.filter(x => x.assetClass == modelSecurities[i].assetClass);
                    if (filterResult.length == 1) {
                        chartData.push({ "name": (modelSecurities[i].assetClass == null) ? "" : modelSecurities[i].assetClass, 
                        "value": filterResult[0].allocation });
                    }
                    else {
                        let value = 0;
                        filterResult.forEach(element => {
                            value = value + element.allocation
                        });
                        chartData.push({ "name": (modelSecurities[i].assetClass == null) ? "" : modelSecurities[i].assetClass,
                         "value": value });
                    }
                }
            }

        }
        chartData.forEach((item) => {
            this.colorCodes.push(this.getRandomColor());
        })
        let count = 0;
        chartData.forEach(item => {
            if (item.name == ""){
               count ++;
            }
        })
        if(chartData.length == count)
         this.checkDonutChart = false;
         else
         this.checkDonutChart = true;
         count = 0;
        if(this.checkDonutChart)
        this._donutChartService.renderDonutChart("#modelDonut", chartData, this.colorCodes, "modelMarketing")

    }
    //generate chart based on category or class
    chart(type: string) {
        this.checkDonutChart = true;
        this.allocatiionChart(this.model.securities, type);
    }

}