import { Component } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { NotificationService } from '../../../core/customSubService';
import * as Util from '../../../core/functions';
import { TomService } from '../../../services/tom.service';
import { IModelTolerance, IModelSummary, IIdName } from '../../../models/tom';
import { ITabGrid } from '../../../viewmodels/tom.rightpanel';
declare var $: JQueryStatic;

@Component({
    selector: 'tradeorder-modelanalysis',
    templateUrl: './app/components/tradeorder/shared/modelanalysis.component.html'
})
export class ModelAnalysisComponent {
    isCostBasis: boolean = true;
    isTradeBlock: boolean = true;
    isExcludeAsset: boolean = false;
    selectedModelId: number;
    filteredModels: IIdName[];
    modelLevels: IIdName[];
    private tabGrid: ITabGrid;
    private summary: IModelSummary;
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private gridRowData: any[];
    private tradeIds: number[];
    private strTradeIds: string;
    private selectedTab: string = "securityset";
    private tabs: string[] = ["", "category", "class", "subclass", "securityset"];
    private selectedCellValueType: number = 1;
    selectedPortfolioTab: number = 1;
    selectedAsset: IModelTolerance;
    refreshSubscription: any;
    showCalculateBox: boolean = false;
    targetTolerance: number = 0;
    gridContext: any = this;

    constructor(private _notifier: NotificationService, private _tomService: TomService) {
        this.filteredModels = <IIdName[]>[];
        this.modelLevels = [{ id: 4, name: "Security Set" }];
        this.disposeAll();
    }

    ngOnInit() {
        this.refreshSubscription = this._notifier.tomRightPanelMA.subscribe((data: any) => {
            console.log('start');
            if (data.tradeIds == undefined || data.tradeIds.length == 0) {
                console.log('undefined: ', data.tradeIds);
                this.strTradeIds = "";
                this.tradeIds = undefined;
                this.disposeAll();
            } else if (data.tradeIds.length > 0) {
                console.log('first load: ', data.tradeIds);
                if (this.strTradeIds == data.tradeIds.join[","] && this.filteredModels.length > 0)
                    return;
                console.log('first load strTradeIds: ', this.strTradeIds);
                this.tradeIds = data.tradeIds;
                this.strTradeIds = data.tradeIds.join[","];
                this.disposeAll();
                this.loadModelsByTrades(this.tradeIds);
            }
        });
    }

    refreshClick() {
        if (this.selectedModelId != undefined) {
            this.summary = undefined;
            this.disposeAll();
            this.onModelSelect(this.selectedModelId);
        }
    }

    onModelSelect(modelId: number) {
        // console.log("onModelSelect(): ", modelId);
        this.disposeAll();
        if (!modelId) {
            this.selectedModelId = undefined;
            return;
        }
        this.selectedModelId = modelId;
        this.loadModelSummary(modelId);
        this.loadModelLevels(modelId);
        this.loadLevelDataByModelId(this.selectedTab, modelId);
        // this.disposePortfolio();
    }

    loadModelsByTrades(tradeIds: number[]) {
        Util.responseToObjects<IIdName>(this._tomService.getModelsByTrades(tradeIds))
            .subscribe(models => {
                this.filteredModels = models;
            });
    }

    loadModelLevels(modelId: number) {
        Util.responseToObjects<IIdName>(this._tomService.getModelLevels(modelId))
            .subscribe(levels => {
                this.modelLevels = Util.sortByDesc(levels, "id");
            });
    }

    loadModelSummary(modelId: number) {
        Util.responseToObject<IModelSummary>(this._tomService.getModelSummary(modelId, this.isCostBasis, this.isTradeBlock, this.isExcludeAsset))
            .subscribe(model => {
                this.summary = model;
            });
    }

    recalculateTolerance(hide: boolean = false) {
        if (hide === true) {
            this.targetTolerance = 0;
            this.showCalculateBox = false;
        }
        // console.log("getRowStyle: ", this.tabGrid.gridOptions.api);
        this.tabGrid.gridOptions.api.refreshView();
    }

    onTabChange(tabName) {
        console.log('onTabChange(): ', tabName);
        this.selectedTab = tabName;
        let gridRowData = [];
        switch (this.selectedTab) {
            case this.tabs[3]:
                gridRowData = this.tabGrid.orderSubClasses;
                break;
            case this.tabs[2]:
                gridRowData = this.tabGrid.orderClasses;
                break;
            case this.tabs[1]:
                gridRowData = this.tabGrid.orderCategories;
                break;
            default:
                gridRowData = this.tabGrid.orderSecurities;
        }
        if (gridRowData != undefined && gridRowData.length > 0) {
            this.tabGrid.gridRowData = gridRowData
            this.tabGrid.gridOptions.api.setRowData(this.tabGrid.gridRowData);
            this.tabGrid.gridOptions.api.sizeColumnsToFit();
        } else {
            this.loadLevelDataByModelId(this.selectedTab, this.selectedModelId);
        }
    }

    loadLevelDataByModelId(levelName: string, modelId: number) {
        Util.responseToObjects<IModelTolerance>(this._tomService.getLevelDataByModelId(levelName, modelId, this.isCostBasis, this.isTradeBlock, this.isExcludeAsset))
            .subscribe(models => {
                this.tabGrid.gridRowData = models;
                this.SaveAssetData(models);
                console.log(this.selectedTab + " tabGrid.gridRowData: ", this.tabGrid.gridOptions.api);
                if (this.tabGrid.gridOptions.api != undefined)
                    this.tabGrid.gridOptions.api.sizeColumnsToFit();
            },
            error => {
                this.SaveAssetData([]);
            });
    }

    SaveAssetData(models) {
        switch (this.selectedTab) {
            case this.tabs[3]:
                this.tabGrid.orderSubClasses = models;
                break;
            case this.tabs[2]:
                this.tabGrid.orderClasses = models;
                break;
            case this.tabs[1]:
                this.tabGrid.orderCategories = models;
                break;
            default:
                this.tabGrid.orderSecurities = models;
        }
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.tabGrid.columnDefs = [
            <ColDef>{ headerName: "Name", field: "assetName" },
            <ColDef>{ headerName: "Current", field: "currentInPercentage", valueGetter: 'data.currentInPercentage + "%"', width: 85, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInPercentage", valueGetter: 'data.targetInPercentage + "%"', width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInPercentage", valueGetter: 'data.differenceInPercentage + "%"', width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInPercentage", valueGetter: 'data.postTradeInPercentage + "%"', width: 100, cellClass: 'text-right' },
        ];
    }

    private createColumnDefsPortfolio() {
        this.columnDefs = [
            <ColDef>{ headerName: "ID", field: "portfolioId", width: 50, cellClass: 'text-right' },
            <ColDef>{ headerName: "Portfolio Name", field: "portfolioName" },
            <ColDef>{ headerName: "ID", field: "accountId", hide: true, width: 50, cellClass: 'text-right' },
            <ColDef>{ headerName: "Account Name", field: "accountName", hide: true },
            <ColDef>{ headerName: "Current", field: "currentInPercentage", valueGetter: 'data.currentInPercentage + "%"', width: 85, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInPercentage", valueGetter: 'data.targetInPercentage + "%"', width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInPercentage", valueGetter: 'data.differenceInPercentage + "%"', width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInPercentage", valueGetter: 'data.postTradeInPercentage + "%"', width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Current", field: "currentInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 85, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInDollar", cellRenderer: Util.currencyCellRenderer, hide: true, width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Current", field: "currentInShares", hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Target", field: "targetInShares", hide: true, width: 75, cellClass: 'text-right' },
            <ColDef>{ headerName: "Difference", field: "differenceInShares", hide: true, width: 100, cellClass: 'text-right' },
            <ColDef>{ headerName: "Post Trade", field: "postTradeInShares", hide: true, width: 100, cellClass: 'text-right' }
        ];
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let model = event.node.data;
        // console.log("onRowSelected in tradeOrders: ", event.node);
        // this.disposePortfolio();
        this.selectedAsset = model;
        this.loadPortfoliosByAssetId(this.selectedAsset);
    }

    /** Applying styles for asset grid row */
    getRowStyle(params) {
        let model = <IModelTolerance>params.data;
        if (params.context.showCalculateBox) {
            if (params.context.targetTolerance > 0 && params.context.targetTolerance < model.targetInPercentage) {
                return { 'color': '#fe6161' }
            } else {
                return { 'color': '#ccc' }
            }
        } else {
            if (model.postTradeInPercentage < (model.targetInPercentage - model.lowerModelTolerancePercentage) ||
                model.postTradeInPercentage > (model.targetInPercentage + model.upperModelTolerancePercentage))
                return { 'color': '#fe6161' }
            else
                return { 'color': '#ccc' }
        }
    }

    loadPortfoliosByAssetId(asset: IModelTolerance) {
        let modelId = this.selectedModelId;
        let serviceToExecute = (this.selectedPortfolioTab == 1)
            ? this._tomService.getPortfoliosByAssetId(this.selectedTab, modelId, asset.assetId)
            : this._tomService.getAccountsByAssetId(this.selectedTab, modelId, asset.assetId);
        Util.responseToObjects<IModelTolerance>(serviceToExecute)
            .subscribe(models => {
                models.forEach(item => {
                    item.targetInPercentage = asset.targetInPercentage;
                    item.differenceInPercentage = item.currentInShares - asset.targetInPercentage;
                    // item.targetInDollar = -999;
                    // item.differenceInDollar = -999;
                    // item.targetInShares = -999;
                    // item.differenceInShares = -999;
                });
                this.gridRowData = models;
                console.log(this.selectedTab + " gridRowData: ", models);
                if (this.gridOptions.api != undefined)
                    this.gridOptions.api.sizeColumnsToFit();
            },
            error => {
                this.gridRowData = [];
            });
    }

    onPortfolioTabChange(tabId: number) {
        this.selectedPortfolioTab = tabId;
        this.setColumnsVisible(this.selectedCellValueType);
        this.loadPortfoliosByAssetId(this.selectedAsset);
    }

    private selectCellValueType(type: number) {
        this.selectedCellValueType = type;
        this.setColumnsVisible(type);
    }

    private setColumnsVisible(type: number) {
        let portfolioColumns = ["portfolioId", "portfolioName"];
        let accountColumns = ["accountId", "accountName"];
        let percentageColumns = ["currentInPercentage", "targetInPercentage", "differenceInPercentage", "postTradeInPercentage"];
        let dollarColumns = ["currentInDollar", "targetInDollar", "differenceInDollar", "postTradeInDollar"];
        let sharesColumns = ["currentInShares", "targetInShares", "differenceInShares", "postTradeInShares"];
        let columnsToHide = portfolioColumns.concat(accountColumns, percentageColumns, dollarColumns, sharesColumns);
        this.gridOptions.columnApi.setColumnsVisible(columnsToHide, false);
        columnsToHide = (type == 1) ? percentageColumns : ((type == 2) ? dollarColumns : sharesColumns);
        columnsToHide = columnsToHide.concat((this.selectedPortfolioTab == 1) ? portfolioColumns : accountColumns);
        this.gridOptions.columnApi.setColumnsVisible(columnsToHide, true);
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onPortfolioRowSelected(event) {
        let model = event.node.data;
        // console.log("onRowSelected in tradeOrders: ", event.node);
        this._notifier.ordersNotify.emit({ id: model.id });
    }

    disposeAll() {
        this.summary = undefined;
        this.disposeTabGrid();
        this.disposePortfolio();
    }

    private disposeTabGrid() {
        this.tabGrid = <ITabGrid>{
            gridOptions: <GridOptions>{},
            gridRowData: <IModelTolerance[]>[],
            orderSecurities: <IModelTolerance[]>[],
            orderSubClasses: <IModelTolerance[]>[],
            orderClasses: <IModelTolerance[]>[],
            orderCategories: <IModelTolerance[]>[]
        }
        this.createColumnDefs();
    }

    private disposePortfolio() {
        this.gridOptions = <GridOptions>{};
        this.gridRowData = <IModelTolerance[]>[];
        this.createColumnDefsPortfolio();
    }

}
