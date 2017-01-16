import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ModelMarketingService } from '../../../../services/model.marketing.service';
import { ModelService } from '../../../../services/model.service';
import { ITabNav } from '../../shared/model.tabnav.component';
import { NumericEditorComponent } from '../shared/numeric.editor.component';
import { DateRendererComponent } from '../shared/date.renderer.component';
import * as Util from '../../../../core/functions';
import { FormGroup, FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { IModelList } from '../../../../models/model';
import { IModelPerformance } from '../../../../models/model';
import { GridOptions, ColDef } from 'ag-grid/main';

@Component({
    selector: 'community-model-performance',
    templateUrl: './app/components/model/marketing/performance/performance.component.html'
})
export class ModelPerformanceComponent extends BaseComponent {

    private submitPerformance: boolean = false;
    private tabsModel: ITabNav;
    private modelId: number;
    private model: IModelList = <IModelList>{};
    private performances: IModelPerformance[] = [];
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private toUpdatePerformanceId: number;
    private isStrategistAdmin: boolean;

    constructor(private _modelMarketingService: ModelMarketingService,
        private _modelService: ModelService,
        private activateRoute: ActivatedRoute, private _router: Router) {
        super();
        this.isStrategistAdmin = (this.roleTypeId == RoleType.StrategistAdmin);
        var self = this;
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            onCellValueChanged: function (event) {
                self.detectPerformanceUpdate(event, self);
            }
        };
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'E';
    }

    ngOnInit() {
        this.activateRoute.params.subscribe(params => {
            this.modelId = +params['id'];
            this.reset();
        });
        this.createColumnDefs();

    }


    onGridReady(event) {
        this.gridOptions.api.sizeColumnsToFit();
    }

    reset() {
        if (this.modelId > 0) {
            this.getModelPerformance(this.modelId);
            this.getModelDetail(this.modelId);
        }
        this.submitPerformance = false;
    }

    private onModelChange(modelId) {
        this._router.navigate(['/community/model/marketing/performance', modelId]);
    }

    private getModelPerformance(modelId) {
        Util.responseToObjects<IModelPerformance>(this._modelMarketingService.getModelPerformance(modelId))
            .subscribe(performances => {
                this.performances = performances;
            });
    }

    private addModelPerformance() {
        var performance = <IModelPerformance>{};
        performance.asOnDate = new DatePipe('yMd').transform(new Date(), 'MM/dd/yyyy')
        performance.modelId = this.modelId;
        performance.mtd = 0;
        performance.qtd = 0;
        performance.ytd = 0;
        performance.oneYear = 0;
        performance.threeYear = 0;
        performance.fiveYear = 0;
        performance.tenYear = 0;
        performance.inception = 0;

        this.saveModelPerformance(performance);
    }

    private saveModelPerformance(performance) {
        this.responseToObject<IModelPerformance>(this._modelMarketingService.saveModelPerformance(performance))
            .subscribe(performance => {
                this.performances.push(performance);
                this.gridOptions.api.setRowData(this.performances);

            });

    }

    private detectPerformanceUpdate(event, self) {
        // if (self.toUpdatePerformanceId != undefined &&
        //     event.data.id != self.toUpdatePerformanceId) {
        //     self.updateModelPerformance(self.toUpdatePerformanceId);
        // }
        self.toUpdatePerformanceId = event.data.id;
        self.updateModelPerformance(self.toUpdatePerformanceId)

    }

    private updateModelPerformance(performanceId) {
        var performance = <IModelPerformance>{};
        for (var i = 0; i < this.performances.length; i++) {
            if (this.performances[i].id == performanceId) {
                this.performances[i].mtd = + this.performances[i].mtd;
                this.performances[i].qtd = + this.performances[i].qtd;
                this.performances[i].ytd = + this.performances[i].ytd;
                this.performances[i].oneYear = + this.performances[i].oneYear;
                this.performances[i].threeYear = + this.performances[i].threeYear;
                this.performances[i].fiveYear = + this.performances[i].fiveYear;
                this.performances[i].tenYear = + this.performances[i].tenYear;
                this.performances[i].inception = + this.performances[i].inception;
                performance = this.performances[i];
                break;
            }
        }
        this.responseToObject<IModelPerformance>(this._modelMarketingService.updateModelPerformance(performance))
            .subscribe(performance => {
            });
    }

    private getModelDetail(modelId) {
        this.responseToObject<IModelList>(this._modelService.getModelView(modelId))
            .subscribe(model => {
                this.model = model;

            });

    }

    private createColumnDefs() {
        let self = this;

        this.columnDefs = [
            <ColDef>{
                headerName: "AS ON DATE", width: 100, headerTooltip: 'AS ON DATE', suppressMenu: true, suppressSorting: true, field: 'asOnDate',
                cellEditorFramework: {
                    component: DateRendererComponent,
                    moduleImports: [FormsModule, CalendarModule]
                },
                cellRenderer: function (params) {
                    return self.customDateRenderer(self, params)
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "MTD(%)", width: 150, headerTooltip: 'MTD(%)', suppressMenu: true, suppressSorting: true, field: 'mtd',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "QTD(%)", width: 100, headerTooltip: 'QTD(%)', suppressMenu: true, suppressSorting: true, field: 'qtd',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "YTD(%)", width: 100, headerTooltip: 'YTD(%)', suppressMenu: true, suppressSorting: true, field: 'ytd',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "1YR(%)", width: 100, headerTooltip: '1YR(%)', suppressMenu: true, suppressSorting: true, field: 'oneYear',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "3YR(%)", width: 100, headerTooltip: '3YR(%)', suppressMenu: true, suppressSorting: true, field: 'threeYear',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "5YR(%)", width: 100, headerTooltip: '5YR(%)', suppressMenu: true, suppressSorting: true, field: 'fiveYear',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "10YR(%)", width: 100, headerTooltip: '10YR(%)', suppressMenu: true, suppressSorting: true, field: 'tenYear',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            },
            <ColDef>{
                headerName: "INCEPTION", width: 100, headerTooltip: 'INCEPTION', suppressMenu: true, suppressSorting: true, field: 'inception',
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: this.isStrategistAdmin
            }
        ];
    }

    private customDateRenderer(self, params) {
        if (params != undefined && params.value != undefined && params.value != '') {
            return self.dateRenderer(params);
        } else {
            return '';
        }
    }

}