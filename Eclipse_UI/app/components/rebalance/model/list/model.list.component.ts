
import { Component, ViewChild, HostListener,  Output , EventEmitter} from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { RebalanceModelService } from '../../../../services/rebalance.model.service';
import { IModelDetail } from '../../../../models/modelDetail';

@Component({
    selector: 'eclipse-model-list',
    templateUrl: './app/components/rebalance/model/list/model.list.component.html',
    directives : [AgGridNg2],
    providers: [RebalanceModelService]
})

export class RebalanceModelListComponent extends BaseComponent{ 
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allModels : IModelDetail[];
    private modelData: IModelDetail[];
    private selectedModelId: number;
    private showRebalanceDetail: boolean;
    @Output() viewModelDetail = new EventEmitter();
    @Output() displayRebalanceDetail = new EventEmitter();
     constructor (private _modelService: RebalanceModelService) {
         
        super();
          this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        this.createColumnDefs();
        
     }
     ngOnInit(){
        this.selectedModelId = 0;
        this.displayModelList();
        this.showRebalanceDetail = false;
        
    }
    
    displayModelList(){
         this.ResponseToObjects<IModelDetail>(this._modelService.getModelData())
            .subscribe(model => {
                this.allModels = model;
                this.modelData =  this.allModels.filter(a => a.isDeleted == 0);
   
                this.gridOptions.api.setRowData(this.modelData);
                this.gridOptions.api.sizeColumnsToFit();
            }) 
       /* Observable.forkJoin(
           
        ).subscribe(data => {
            
        });*/
        
    }
    ngOnDestroy() {
        console.log("destroyed");
    }
    
    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            
                         <ColDef>{headerName: "Model Name", field: "name", width: 200, cellClass: 'text-center', headerTooltip: 'Model Name', 
                                   suppressMenu: true
                         },
                         <ColDef>{headerName: "Model Id", field: "id", width: 200, cellClass: 'text-center', headerTooltip: 'Model Id',
                                 suppressMenu: true,suppressSorting: true
                          },
                         <ColDef>{headerName: "Model Description", field: "securityType", width: 200, cellClass: 'text-center', headerTooltip: 'Model Type',
                                 suppressMenu: true,suppressSorting: true
                         },
                         
                         <ColDef>{headerName: "Edit" , width: 50, headerTooltip: 'Edit', suppressMenu: true,suppressSorting: true,
                        cellRenderer: this.editCellRenderer, cellClass: 'text-center '},
                ]
            
    }
    private editCellRenderer(params) {
       
            var result = '<span>';
            result += '<i class="fa fa-edit cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Edit"></i>';
            return result;
      
        
    }
    
    private createModel() {
        this.viewModelDetail.emit({id : 0});
    }
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.title === "Edit") {
                this.selectedModelId = parseInt(targetElement.outerHTML.split('id="')[1].split("value=")[0].replace(/['"]+/g, '').toString());   
                this.viewModelDetail.emit({id : this.selectedModelId});
               
             }
        }
        
    }
    private viewRebalancePortfolio() {
        this.displayRebalanceDetail.emit("Rebalance detail");
    }
    
}