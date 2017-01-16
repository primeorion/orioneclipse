
import { Component, HostListener,  Output , EventEmitter} from '@angular/core';
import { DatePipe} from '@angular/common';
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
import { IAccount } from '../../models/account';
import { IRebalanceResponse } from '../../models/rebalanceResponse';
import * as Util from '../../core/functions';

@Component({
    selector: 'eclipse-rebalance-rebalancerDetail',
    templateUrl: './app/components/rebalance/rebalancer.component.html',
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
    private rebalanceModel: boolean = false;
    private tradeCode :string;
    private logFileUrl : string;
    private rebalancerLogs: string;
    private isAssignedModel: boolean;
    private canRebalnce : boolean;
    private rebalanceTypeList = [];
    private selectedRebalanceType = {};
    private selectedAccount = {id:0};
    private accounts: IAccount[];
    private isEnableAmount : boolean;
    private amount: number;
    private showAccountError : boolean;
    private isAccessLambda: boolean = false;
    @Output() viewModelDetail = new EventEmitter();
    
     constructor (private _portfolioService: PortfolioService, private _modelService: RebalanceModelService,
     private _rebalanceService: RebalanceService, private _tradeService: TradeService) {
         
        super();
          this.gridOptions = <GridOptions>{
            enableColResize: true,
          
        };
        
        this.createColumnDefs();
      }
     ngOnInit(){
        this.getSimpleModelList();
        this.getSimplePortfolioList();
        this.getRebalanceTypeList();
        this.isAssignedModel = false;
        this.canRebalnce = false;
        this.selectedRebalanceType = {id:"fullRebalance", name: "Full Rebalance"};
        this.isEnableAmount = false;
        this.amount = 0;
        this.showAccountError = false;
        //this.getTradeList(null);
    }
    
    private disableRebalanceAndLog() {
        this.canRebalnce = false;
        this.tradeCode = null;
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
    private changeRebalanceType(event) {
        this.isEnableAmount = false;
        if(event.target.value == "CASH_DISTRIBUTION" || event.target.value == "CASH_CONTRIBUTION") {
            this.isEnableAmount = true;    
        }
    }
    private getPortfolioAccounts(portfolioId: number) {
        Util.responseToObjects<IAccount>(this._portfolioService.getPortfolioAccounts(portfolioId))
            .subscribe(m => {
                this.accounts = m;
            });
    }
    private getRebalanceTypeList() {
        var rebalanceType = {id:"fullRebalance", name: "Full Rebalance"};
        this.rebalanceTypeList.push(rebalanceType);
        rebalanceType = {id:"cashNeed", name: "Cash Need"};
        this.rebalanceTypeList.push(rebalanceType);
        rebalanceType = {id:"CASH_DISTRIBUTION", name: "Raise Cash"};
        this.rebalanceTypeList.push(rebalanceType);
        rebalanceType = {id:"CASH_CONTRIBUTION", name: "Spend Cash"};
        this.rebalanceTypeList.push(rebalanceType);

    }
    private assignModel(form) {
        this.rebalanceModel = true;
         if(form.valid) {
            this.responseToObject(this._rebalanceService.assignModel(this.selectedModel.id, this.selectedPortfolio.id))
            .subscribe(res => {
                this.isAssignedModel = true;
                this.canRebalnce = true;
                 var self = this;
                 this.getPortfolioAccounts(this.selectedPortfolio.id);
                setTimeout(function (){ 
                    self.isAssignedModel = false;
                },5000);
             });
         }
    }
    private rebalance(){
        this.rebalanceModel = true;
        this.showAccountError = false;
        if((this.selectedRebalanceType["id"] == "CASH_DISTRIBUTION" || this.selectedRebalanceType["id"]  == "CASH_CONTRIBUTION")
           && this.selectedAccount["id"] == 0){
               this.showAccountError = true;
           }
         if(!this.showAccountError) {
            this.responseToObject<IRebalanceResponse>(this._rebalanceService.rebalancePortfolio(
                this.selectedModel.id, this.selectedPortfolio.id, this.selectedRebalanceType["id"], this.selectedAccount["id"], this.amount,
                this.isAccessLambda))
            .subscribe(res => {
                this.tradeCode = res.tradeCode;
                this.logFileUrl = res.data;
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
         if(this.logFileUrl != undefined && this.logFileUrl.length > 0){
             this._rebalanceService.downloadLogsFromLambda(this.logFileUrl).subscribe(data => {
               this.rebalancerLogs = data['_body'];
            });
         }else if(this.tradeCode!= null) {
            this._rebalanceService.dowloadLogs(this.tradeCode).subscribe(data => {
                this.rebalancerLogs = data['_body'];
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
                                        var datePipe = new DatePipe('ymd');
                                        return datePipe.transform(params.value, 'dd/MM/yyyy h:m:s');
                                    }
                                    
                                   return '';
                             }    
                         }
                 ]
                    
    }
    
 
    
}