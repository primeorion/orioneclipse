
import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { RebalanceModelDetailComponent } from './model/detail/model.detail.component';
import { RebalanceModelListComponent } from './model/list/model.list.component';
import {PortfolioComponent} from './../rebalance/portfolio.component';
import {RebalancerComponent} from './../rebalance/rebalancer.component';

@Component({
    selector: 'eclipse-model',
    templateUrl: './app/components/rebalance/rebalance.component.html',
    directives : [RebalanceModelDetailComponent, RebalanceModelListComponent, PortfolioComponent, RebalancerComponent]
})

export class RebalanceComponent extends BaseComponent{ 
    private selectedModelId: number;
    private viewName : string;
     @ViewChild(RebalanceModelDetailComponent) modelDetails: RebalanceModelDetailComponent;
     @ViewChild(RebalanceModelListComponent) modelList: RebalanceModelListComponent;
     @ViewChild(PortfolioComponent) portfolio: PortfolioComponent;
     @ViewChild(RebalancerComponent) rebalance: RebalancerComponent;
    constructor () {     
        super();
        this.viewName = "dashboard";
    } 
    private viewModelDetail(event) {
          this.selectedModelId = event.id;
           this.viewName = "detail";
    }
    private setLinkStyle(value) {
        this.viewName = value;
        this.selectedModelId = 0;
    }
     private treeChart(value){
         this.viewName = value;
    }
    private displayModelList(event){
         this.viewName = "list";
        
    }
    private displayRebalanceDetail(event) {
        this.viewName = "portfolio";
    }
}