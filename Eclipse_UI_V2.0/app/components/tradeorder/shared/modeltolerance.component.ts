import { Component, ViewChild } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { NotificationService } from '../../../core/customSubService';
import * as Util from '../../../core/functions';
import { TomService } from '../../../services/tom.service';
import { ITradeOrder, IModelTolerance, IIdName } from '../../../models/tom';
import { GroupBarChartCompnent } from '../../../shared/charts/groupchart/groupbarchart.component';
import * as d3 from 'd3';

@Component({
    selector: 'tradeorder-modeltolerance',
    templateUrl: './app/components/tradeorder/shared/modeltolerance.component.html'
})
export class ModelToleranceComponent {
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private gridRowData: IModelTolerance[];
    private orderSecurities: IModelTolerance[];
    private orderSubClasses: IModelTolerance[];
    private orderClasses: IModelTolerance[];
    private orderCategories: IModelTolerance[];
    private modelLevels: IIdName[];
    private tradeOrder: ITradeOrder;
    private selectedCellValueType: number = 1;
    private selectedTab: string = "securityset";
    private tabs: string[] = ["", "category", "class", "subclass", "securityset"];
    refreshSubscription: any;

    @ViewChild(GroupBarChartCompnent) groupBarChartCompnent: GroupBarChartCompnent;

    constructor(private _notifier: NotificationService, private _tomService: TomService) {
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.tradeOrder = <ITradeOrder>{};
        this.gridRowData = <IModelTolerance[]>[];
        this.orderSecurities = <IModelTolerance[]>[];
        this.orderSubClasses = <IModelTolerance[]>[];
        this.orderClasses = <IModelTolerance[]>[];
        this.orderCategories = <IModelTolerance[]>[];
        this.modelLevels = [{ id: 4, name: "Security Set" }];
    }

    ngOnInit() {
        this.refreshSubscription = this._notifier.tomRightPanelMT.subscribe((data: any) => {
            console.log('start');
            if (data == undefined || data.model == undefined || !data.model.id) {
                console.log('undefined: ', data);
                this.tradeOrder = <ITradeOrder>{};
                if (data != undefined && data.id > 0)
                    this.tradeOrder.id = data.id;
                this.disposeData();
            } else if (data.id != this.tradeOrder.id) {
                // data.portfolio.id = 1;
                data.account.accountId = 1;
                this.tradeOrder = data;
                console.log('first load: ', this.tradeOrder);
                this.disposeData();
                this.loadModelLevels(data.model.id);
                this.loadModelTolerance(data);
            }
        });
    }

    ngOnDestroy() {
        this.refreshSubscription.unsubscribe();
    }

    onTabChange(tabName) {
        console.log('onTabChange(): ', tabName);
        this.selectedTab = tabName;
        let gridRowData = [];
        switch (this.selectedTab) {
            case this.tabs[3]:
                gridRowData = this.orderSubClasses;
                break;
            case this.tabs[2]:
                gridRowData = this.orderClasses;
                break;
            case this.tabs[1]:
                gridRowData = this.orderCategories;
                break;
            default:
                gridRowData = this.orderSecurities;
        }
        if (gridRowData != undefined && gridRowData.length > 0) {
            console.log(tabName + 'tab refreshing data');
            this.gridRowData = gridRowData
            this.gridOptions.api.setRowData(this.gridRowData);
            this.setColumnsVisible(this.selectedCellValueType);
            this.gridOptions.api.sizeColumnsToFit();
            this.createBarGraphChart(gridRowData);
        } else {
            console.log(tabName + 'tab loading data');
            this.loadModelTolerance(this.tradeOrder);
        }
    }

    createBarGraphChart(gridRowData: IModelTolerance[]) {
        let barGraphData = [
            { name: 'upper', data: [] },
            { name: 'lower', data: [] },
            { name: 'Post_Trade', data: [] }
        ];
        let targetArray = [];
        gridRowData.forEach(item => {
            barGraphData[0].data.push({
                label: item.assetName,
                value: item.upperModelTolerancePercentage,
                series: 'upper',
                postTrade: item.postTradeInPercentage,
                lowerRange: item.targetInPercentage - item.lowerModelTolerancePercentage,
                upperRange: item.targetInPercentage + item.upperModelTolerancePercentage,
                upper: item.upperModelTolerancePercentage,
                lower: item.lowerModelTolerancePercentage,
                target: item.targetInPercentage,
            });
            barGraphData[1].data.push({
                label: item.assetName,
                value: -(item.lowerModelTolerancePercentage),
                series: 'lower',
                postTrade: item.postTradeInPercentage,
                lowerRange: item.targetInPercentage - item.lowerModelTolerancePercentage,
                upperRange: item.targetInPercentage + item.upperModelTolerancePercentage,
                upper: item.upperModelTolerancePercentage,
                lower: item.lowerModelTolerancePercentage,
                target: item.targetInPercentage,
            });
            barGraphData[2].data.push({
                label: item.assetName,
                value: item.targetInPercentage - item.postTradeInPercentage,
                series: 'Post_Trade',
                postTrade: item.postTradeInPercentage,
                lowerRange: item.targetInPercentage - item.lowerModelTolerancePercentage,
                upperRange: item.targetInPercentage + item.upperModelTolerancePercentage,
                upper: item.upperModelTolerancePercentage,
                lower: item.lowerModelTolerancePercentage,
                target: item.targetInPercentage,
            });
            targetArray.push(item.upperModelTolerancePercentage);
            targetArray.push(item.lowerModelTolerancePercentage);
            targetArray.push(item.postTradeInPercentage)
        });
        let min = d3.min(targetArray);
        let max = d3.max(targetArray);
        let target: any = (min + max) / 2;
        // get portfolio name from the list
        let portfolioName = this.getLabelForGraph();
        barGraphData.forEach(val => {
            val['target'] = parseInt(target);
            val['portfolioName'] = portfolioName;
        });
        this.groupBarChartCompnent.CreateSvgForgroupChart(barGraphData);
    }

    getLabelForGraph() {
        let labelName = '';
        let trade = this.tradeOrder;
        if (trade != undefined) {
            if (trade.portfolio != undefined) {
                if (trade.portfolio.isSleevedPorfolio === true) {
                    labelName = trade.account.name + " (Sleeve)";
                } else
                    labelName = trade.portfolio.name;
            }
        }
        return labelName;
    }

    disposeBarGraphChart() {
        if (this.groupBarChartCompnent != undefined)
            this.groupBarChartCompnent.removeBarGraphChart();
    }

    loadModelLevels(modelId: number) {
        Util.responseToObjects<IIdName>(this._tomService.getModelLevels(modelId))
            .subscribe(levels => {
                console.log("levels: ", levels);
                // levels = levels.filter(m => )
                this.modelLevels = Util.sortByDesc(levels, "id");
            });
    }

    loadModelTolerance(trade: ITradeOrder) {
        Util.responseToObjects<IModelTolerance>(this._tomService.getModelTolerance(this.selectedTab, trade))
            .subscribe(models => {
                this.gridRowData = models;
                switch (this.selectedTab) {
                    case this.tabs[3]:
                        this.orderSubClasses = models;
                        break;
                    case this.tabs[2]:
                        this.orderClasses = models;
                        break;
                    case this.tabs[1]:
                        this.orderCategories = models;
                        break;
                    default:
                        this.orderSecurities = models;
                }
                this.setColumnsVisible(this.selectedCellValueType);
                this.gridOptions.api.sizeColumnsToFit();
                this.createBarGraphChart(models);
                console.log("orderSecurities: ", this.gridRowData);
            });
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Name", field: "assetName", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Current", field: "currentInPercentage", valueGetter: 'data.currentInPercentage + "%"', width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInPercentage", valueGetter: 'data.targetInPercentage + "%"', width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInPercentage", valueGetter: 'data.differenceInPercentage + "%"', width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInPercentage", valueGetter: 'data.postTradeInPercentage + "%"', width: 125, cellClass: 'text-right' },
            <ColDef>{ headerName: "Current", field: "currentInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 125, cellClass: 'text-right' },
            <ColDef>{ headerName: "Current", field: "currentInShares", hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInShares", hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInShares", hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInShares", hide: true, cellRenderer: this.postTradeRenderer, width: 125, cellClass: 'text-right' }
        ];
    }

    private postTradeRenderer(params) {
        let item = <IModelTolerance>params.data;
        if (item.postTradeInPercentage < (item.targetInPercentage - item.lowerModelTolerancePercentage) ||
            item.postTradeInPercentage > (item.targetInPercentage + item.upperModelTolerancePercentage)) {
            return '<span class="text-danger">' + item.postTradeInPercentage + '</span>';
        }
        return item.postTradeInPercentage + "";
    }

    private selectCellValueType(type: number) {
        this.selectedCellValueType = type;
        this.setColumnsVisible(type);
    }

    private setColumnsVisible(type: number) {
        let percentageColumns = ["currentInPercentage", "targetInPercentage", "differenceInPercentage", "postTradeInPercentage"];
        let dollarColumns = ["currentInDollar", "targetInDollar", "differenceInDollar", "postTradeInDollar"];
        let sharesColumns = ["currentInShares", "targetInShares", "differenceInShares", "postTradeInShares"];
        let columnsToHide = percentageColumns.concat(dollarColumns, sharesColumns);
        this.gridOptions.columnApi.setColumnsVisible(columnsToHide, false);
        columnsToHide = (type == 1) ? percentageColumns : ((type == 2) ? dollarColumns : sharesColumns);
        this.gridOptions.columnApi.setColumnsVisible(columnsToHide, true);
    }

    private disposeData() {
        this.gridRowData = [];
        this.orderSecurities = [];
        this.orderSubClasses = [];
        this.orderClasses = [];
        this.orderCategories = [];
        this.disposeBarGraphChart();
    }

}
