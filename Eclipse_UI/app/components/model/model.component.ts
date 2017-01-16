
import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { ModelDetailComponent } from './detail/model.detail.component';
import { ModelListComponent } from './list/model.list.component';
import {PortfolioComponent} from './../rebalance/portfolio.component';
import {RebalancerComponent} from './../rebalance/rebalancer.component';
import {TreeComponent} from './sample/sample.component';
import {SingleLevelTreeComponent} from './sample/singleleveltree.component';

@Component({
    selector: 'eclipse-model',
    templateUrl: './app/components/model/model.component.html',
    directives : [ModelDetailComponent, ModelListComponent, PortfolioComponent, RebalancerComponent,TreeComponent,SingleLevelTreeComponent]
})

export class ModelComponent extends BaseComponent{ 
    private selectedModelId: number;
    private viewName : string;
     @ViewChild(ModelDetailComponent) modelDetails: ModelDetailComponent;
     @ViewChild(ModelListComponent) modelList: ModelListComponent;
     @ViewChild(PortfolioComponent) portfolio: PortfolioComponent;
     @ViewChild(RebalancerComponent) rebalance: RebalancerComponent;
     @ViewChild(TreeComponent) tree: TreeComponent;
     @ViewChild(SingleLevelTreeComponent) singleLevelTree : SingleLevelTreeComponent;
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
    private singleLevelTreeChart(value){
        this.viewName = value;
    }
}