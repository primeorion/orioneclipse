
import { Component, HostListener,  Output , EventEmitter} from '@angular/core';
import { DatePipe, FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { BaseComponent } from '../../core/base.component';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { PortfolioService } from '../../services/portfolio.service';
import { RebalanceModelService } from '../../services/rebalance.model.service'
import { RebalanceService } from '../../services/rebalance.service';
import { TradeService } from '../../services/trade.service';
import { IPortfolio } from '../../models/portfolio';
import { IModelDetail } from '../../models/modelDetail';
import { ITrade } from '../../models/trade';
import { IRebalanceResponse } from '../../models/rebalanceResponse';

@Component({
    selector: 'eclipse-rebalance-rebalancerDetail',
    templateUrl: './app/components/rebalance/rebalancer.component.html',
    directives : [AgGridNg2, FORM_DIRECTIVES],
    providers: [PortfolioService, RebalanceModelService, RebalanceService, TradeService]
})

export class RebalancerComponent extends BaseComponent{ 
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private portfolioList = [];
    private modelList = [];
    private tradeList = [];
    private selectedPortfolio = {id:null}
    private selectedModel = {id:null};
    
    private rebalanceForm: ControlGroup;
    private modelId: Control;
    private portfolioId: Control;
    private rebalanceModel: boolean = false;
    private tradeCode :string;
    private rebalancerLogs: string;
    private isAssignedModel: boolean;
    private canRebalnce : boolean;
    
    @Output() viewModelDetail = new EventEmitter();
    
     constructor (private _portfolioService: PortfolioService, private _modelService: RebalanceModelService,
     private _rebalanceService: RebalanceService, private _tradeService: TradeService,
     private builder: FormBuilder) {
         
        super();
          this.gridOptions = <GridOptions>{
            enableColResize: true,
          
        };
        
        this.createColumnDefs();
        this.createRebalanceFormControl();
     }
     ngOnInit(){
        this.getSimpleModelList();
        this.getSimplePortfolioList();
        this.isAssignedModel = false;
        this.canRebalnce = false;
        //this.getTradeList(null);
    }
    
    private disableRebalanceAndLog() {
        this.canRebalnce = false;
        this.tradeCode = null;
    }
    private createRebalanceFormControl(){
        
        this.rebalanceForm = this.builder.group({
            modelId: new Control(this.selectedModel.id , Validators.required),
            portfolioId: new Control(this.selectedPortfolio.id , Validators.required)
        });
    }
    
    private getSimpleModelList(){
         this.ResponseToObjects<IModelDetail>(this._modelService.getModelData())
            .subscribe(models => {
                this.modelList = models;
            }) 
    }
    private getSimplePortfolioList(){
         this.ResponseToObjects<IPortfolio>(this._portfolioService.getSimplePortfolioList())
            .subscribe(portfolios => {
                this.portfolioList = portfolios;
            }) 
    }
    private assignModel() {
        this.rebalanceModel = true;
         if(this.rebalanceForm.valid) {
            this.responseToObject(this._rebalanceService.assignModel(this.selectedModel.id, this.selectedPortfolio.id))
            .subscribe(res => {
               console.log(res)
                this.isAssignedModel = true;
                this.canRebalnce = true;
                 var self = this;
                setTimeout(function (){ 
                    self.isAssignedModel = false;
                },5000);
             });
         }
    }
    private rebalance(){
        this.rebalanceModel = true;
         if(this.rebalanceForm.valid) {
            this.responseToObject<IRebalanceResponse>(this._rebalanceService.rebalancePortfolio(this.selectedModel.id, this.selectedPortfolio.id))
            .subscribe(res => {
                this.tradeCode = res.tradeCode;
                this.getTradeList(res.tradeCode);
                 this.rebalanceModel  = false;
            },
            error => {
                console.log("Error found");
                throw error;
            })
         }
            
    }
    
    private downloadLogs(){
       // this.tradeCode = '10431309';
         if(this.tradeCode!= null) {
           this._rebalanceService.dowloadLogs(this.tradeCode).subscribe(data => {
               this.rebalancerLogs = data._body
         });  
         }
    }
    private getTradeList(tradeCode) {
         this.ResponseToObjects<ITrade>(this._tradeService.getTradeListByPortfolio(this.selectedPortfolio.id, tradeCode))
            .subscribe(trades => {
                this.tradeList = trades;
                this.gridOptions.api.setRowData(this.tradeList);
            })
        }
    ngOnDestroy() {
        console.log("destroyed");
    }
    groupRowInnerRendererFunc(params) {
         if (params.data.taxlot != null || params.data.taxlot  != undefined) {
            return params.data.securityName;
        }
        else {
            return '';
        }
    }


    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
                         <ColDef >{headerName: "Portfolio Name", field: "portfolioName", width: 200, headerTooltip: 'Portfolio Name', 
                                   suppressMenu: true,
                         },
                         <ColDef >{headerName: "Security name", field: "securityName", width: 100, headerTooltip: 'Security Name', 
                                   suppressMenu: true,
                         },
                         <ColDef >{headerName: "Account Number", field: "accountNumber", width: 100, headerTooltip: 'Account Number', 
                                   suppressMenu: true,
                         },
                         <ColDef >{headerName: "Account Type", field: "accountType", width: 100, headerTooltip: 'Account Type', 
                                   suppressMenu: true,
                         },
                         <ColDef>{headerName: "Trade Amount", field: "tradeAmount", width: 100, headerTooltip: 'Trade Amount',
                                 suppressMenu: true,suppressSorting: true,
                                 cellRenderer: function(params){
                                            if(params.data.tradeAmount != null || params.data.tradeAmount  != undefined) {
                                                return '$ '+ params.data.tradeAmount;
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                         },
                         <ColDef>{headerName: "Trade Action", field: "action", width: 150, headerTooltip: 'Trade Action',
                                 suppressMenu: true,suppressSorting: true,
                                 // cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':'width200'); }
                         },
                          <ColDef>{headerName: "Created Date", field: "createdOn", width: 200, headerTooltip: 'Created Date', 
                                 suppressMenu: true,
                                 cellRenderer: function(params){
                                    var timestamp = Date.parse(params.value)
                                    
                                    if(isNaN(timestamp)==false){
                                        var datePipe = new DatePipe();
                                        return datePipe.transform(params.value, 'dd/MM/yyyy h:m:s');
                                    }
                                    
                                   return '';
                             }    
                         }
                 ]
                    
    }
    
 
    
}