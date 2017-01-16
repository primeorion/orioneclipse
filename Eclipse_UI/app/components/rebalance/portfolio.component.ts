
import { Component, HostListener,  Output , EventEmitter} from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { RebalanceService } from '../../services/rebalance.service';
import { PortfolioService } from '../../services/portfolio.service';
import { IRebalance } from '../../models/rebalance';
import { IPortfolio } from '../../models/portfolio';

@Component({
    selector: 'eclipse-rebalance-portfolio',
    templateUrl: './app/components/rebalance/portfolio.component.html',
    directives : [AgGridNg2],
    providers: [RebalanceService, PortfolioService]
})

export class PortfolioComponent extends BaseComponent{ 
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private rebalanceInfo: IRebalance = <IRebalance>{id:0}; 
    private portfolioList = [];
    private selectedPortfolioId;
    
    @Output() viewModelDetail = new EventEmitter();
    
     constructor (private _rebalanceService: RebalanceService, private _portfolioService: PortfolioService) {
         
        super();
          this.gridOptions = <GridOptions>{
            enableColResize: true,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },

        };
        
        this.createColumnDefs();
        
     }
     ngOnInit(){
        this.selectedPortfolioId = 0;
        this.getSimplePortfolioList();
    }
    private getSimplePortfolioList(){
         this.ResponseToObjects<IPortfolio>(this._portfolioService.getSimplePortfolioList())
            .subscribe(portfolios => {
                this.portfolioList = portfolios;
            }) 
    }
     private selectPortfolio(id){
        this.selectedPortfolioId = id;
        this.displayRebalanceDetail();
    }
    private displayRebalanceDetail(){
         this.responseToObject<IRebalance>(this._rebalanceService.getRebalanceDetail(this.selectedPortfolioId))
            .subscribe(data => {
                this.rebalanceInfo = data;
                this.enableGridChildren();
            }) 
    }
    
    
     enableGridChildren(){
        this.gridOptions.getNodeChildDetails = function(rebalanceDetail) {
                if (rebalanceDetail.taxlot != null && rebalanceDetail.taxlot  != undefined &&
                    rebalanceDetail.taxlot .length > 0) {
                    return {
                        group: true,
                        children: rebalanceDetail.taxlot,
                        expanded: true
                    };
                } else {
                    return null;
                }
            }
            
         this.gridOptions.api.refreshView();
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
                         <ColDef >{headerName: "Security Name", field: "securityName", width: 200, headerTooltip: 'Security Name', 
                                   suppressMenu: true,
                                    cellRenderer:  'group', 
                                    cellRendererParams: {
                                         innerRenderer: this.groupRowInnerRendererFunc
                                    },
                                    //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':''); }
                         },
                         <ColDef >{headerName: "Security Quantity", field: "securityQuantity", width: 100, headerTooltip: 'Security Quantity', 
                                   suppressMenu: true,
                                    cellRenderer: function(params){
                                            if(params.data.taxlot != null || params.data.taxlot  != undefined) {
                                                return params.data.securityQuantity;
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                                    //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':''); }
                         },
                         <ColDef >{headerName: "Security Price", field: "currentPrice", width: 100, headerTooltip: 'Security Price', 
                                   suppressMenu: true,
                                    cellRenderer: function(params){
                                            if(params.data.taxlot != null || params.data.taxlot  != undefined) {
                                                return '$ '+params.data.currentPrice.toFixed(2);
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                         },
                         <ColDef >{headerName: "Market value", field: "marketValue", width: 100, headerTooltip: 'Market Value', 
                                   suppressMenu: true,
                                    cellRenderer: function(params){
                                            if(params.data.taxlot != null || params.data.taxlot  != undefined) {
                                                return '$ '+ params.data.marketValue.toFixed(2);
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                                    //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':''); }
                         },
                         <ColDef >{headerName: "Tax Lot Id", field: "id", width: 100, headerTooltip: 'Tax Lord Id', 
                                   suppressMenu: true,
                                    cellRenderer: function(params){
                                            if(params.data.taxlot == null || params.data.taxlot  == undefined) {
                                                return params.data.id;
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                                    //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':''); }
                         },
                         <ColDef>{headerName: "Account Number", field: "accountNumber", width: 200, headerTooltip: 'Account Number', 
                                   suppressMenu: true,
                                   //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':'width200'); }
                         },
                         <ColDef>{headerName: "Account Type", field: "accountType", width: 200, headerTooltip: 'Account Type', 
                                   suppressMenu: true,
                                    //cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':'width200'); }
                         },
                         <ColDef>{headerName: "Quantity", field: "quantity", width: 100, headerTooltip: 'Quantity',
                                 suppressMenu: true,suppressSorting: true,
                                //  cellClass: function(params) { return ( (params.data.taxlot != null || params.data.taxlot  != undefined) ?'hideBorder':'width200'); }
                         },
                         <ColDef>{headerName: "Tax Lot Price", field: "price", width: 150, headerTooltip: 'Price',
                                 suppressMenu: true,suppressSorting: true,
                                 cellRenderer: function(params){
                                            if(params.data.taxlot == null || params.data.taxlot  == undefined) {
                                                return '$ '+params.data.price.toFixed(2);
                                            }
                                            else {
                                                return "";
                                            }
                                        
                                    },
                         }
                 ]
                    
    }
 
    
}