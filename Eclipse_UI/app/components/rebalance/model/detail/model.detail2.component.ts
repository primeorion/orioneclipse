import { Component , ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import {Router} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import { OrderBy } from '../../../../pipes/FilterPipe';
import { ModelService } from '../../../../services/model.service';
import { SecuritySetService} from '../../../../services/securityset.service';
import 'ag-grid-enterprise/main';

import { BaseComponent } from '../../../../core/base.component';
import { IModelDetail } from '../../../../models/modelDetail';
import {IModelElement} from '../../../../models/modelElement';
import {ISecuritySet} from '../../../../models/securitySet';

@Component({
    selector: 'eclipse-model-detail',
    templateUrl: './app/components/rebalance/model/detail/model.detail.component.html',
    pipes: [OrderBy],
    providers: [ModelService, SecuritySetService],
    directives: [AgGridNg2, FORM_DIRECTIVES, Dialog, Button, AutoComplete]
})
export class RebalanceModelDetailComponent extends BaseComponent {
    
    private selectedModel:IModelDetail = <IModelDetail>{id: 0};
    private modelForm: ControlGroup;
    private modelName: Control;
    private modelElement: ControlGroup;
    private modelElementName: Control;
    private newElement:IModelElement;
    private classColorIndex: number;
    private displayConfirm: boolean;
    private deletedElementIndex: number;  
    private securitySetList = [];
    private securitySetDetail: ISecuritySet = <ISecuritySet>{};
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private selectedModelElement = <IModelElement>{};
    private previousRelatedTypeId = 0;
    
    @Input() modelId: number;
    @Output() displayModelList = new EventEmitter(); 
    constructor (private _modelService: ModelService, private _securitySetService: SecuritySetService,
                 private builder: FormBuilder, private _cdr: ChangeDetectorRef, private _router: Router) {
        super();
        this.selectedModel.name = "M";
        this.createModelFormControl();
         this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },

        };
        
        this.createColumnDefs();
     }
     
     ngOnInit(){
         this.displayConfirm = false;
         this.selectedModel.modelElements = [];
         this.classColorIndex = 0; 
         this.getsecuritySetList();
         if(this.modelId != undefined && this.modelId != 0) {
            this.getModelDetail();  
        }
        if(this.selectedModel.modelElements == null || this.selectedModel.modelElements.length == 0) {
             
             this.createModelElement(null, -1, false);
        }
     }
     
     
    ngOnDestroy() {
        this.selectedModel = <IModelDetail>{id: 0};
        this.modelId = 0;
        console.log("destroyed");
    }
    private getsecuritySetList() {
        this.ResponseToObjects<ISecuritySet>(this._securitySetService.getSecuritySetData())
        .subscribe(data => {
            this.securitySetList = data; 
        });
    }
    private selectSecuritySet(event, modelElement){
       modelElement.name = event.target.selectedOptions[0].innerText.trim();
       modelElement.relatedTypeId = event.target.value;
       this.getSecuritySetDetail(modelElement);
    }
    private getSecuritySetDetail(selectedModelElement){
        var securitySetId = selectedModelElement.relatedTypeId;
        if(securitySetId != this.previousRelatedTypeId){
                this.securitySetDetail = <ISecuritySet>{};
                this.securitySetDetail.securities = [];
                if(securitySetId != undefined && securitySetId != null && securitySetId != 0){
                
                this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(securitySetId))
                .subscribe(data => {
                    this.securitySetDetail = data;
                    this.enableGridChildren();
                
                });
            }
        }
        this.previousRelatedTypeId = selectedModelElement.relatedTypeId;
          this.selectedModelElement = selectedModelElement;
    }
    
    enableGridChildren(){
        this.gridOptions.getNodeChildDetails = function(security) {
                if (security.equivalences != null && security.equivalences != undefined &&
                    security.equivalences.length > 0) {
                    return {
                        group: true,
                        children: security.equivalences,
                        expanded: true
                    };
                } else {
                    return null;
                }
            }
            
          var self = this;
          this.gridOptions.api.refreshView();
        /*  setTimeout(function (){
            self.gridOptions.api.refreshView();
          },500);*/
    }
    private getModelDetail(){
       if(this.modelId != 0){
            this.responseToObject<IModelDetail>(this._modelService.getModelDetail(this.modelId))
            .subscribe(model => {
                this.selectedModel = model;
                this.convertJsonToModel(); 
            });
       }
      
    }
    
    private createColumnDefs() {
        let self = this;
        this.columnDefs =  [
            <ColDef>{headerName: "Security ID" , width: 100, headerTooltip: 'Security ID', field: 'id',
                cellRenderer:  'group', 
                cellRendererParams: {
                    innerRenderer: function(params){
                        return params.data.id;
                    }
                }
            },
            <ColDef>{headerName: "Security Name" , width: 150, headerTooltip: 'Security Name',suppressSorting: true,field: 'name'},
            <ColDef>{headerName: "Symbol" , width: 100, headerTooltip: 'Symbol',suppressSorting: true,field: 'symbol'},
            <ColDef>{headerName: "Type" , width: 150, headerTooltip: 'Type', suppressSorting: true,field: 'securityType'},
            <ColDef>{headerName: "Security Rank" , width: 150, headerTooltip: 'Security Rank',
                      cellClass: 'text-center ', field: 'rank'},
            <ColDef>{headerName: "T" , width: 50, headerTooltip: 'T', suppressSorting: true,field: 'taxableSecurity',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     }
                    },
            <ColDef>{headerName: "TD" , width: 50, headerTooltip: 'TD', suppressSorting: true,field: 'taxDeferredSecurity',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     } 
                    },
            <ColDef>{headerName: "TE" , width: 50, headerTooltip: 'TE', suppressSorting: true,field: 'taxExemptSecurity',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     }
                    },
            <ColDef>{headerName: "Allocation %" , width: 150, headerTooltip: 'Allocation %', suppressSorting: true,field: 'targetPercent'},
            <ColDef>{headerName: "Lower Tol.(%)" , width: 150, headerTooltip: 'Lower Tol.(%)', suppressSorting: true,field: 'lowerModelTolerancePercent'},
            <ColDef>{headerName: "Upper Tol.(%)" , width: 150, headerTooltip: 'Upper Tol.(%)', suppressSorting: true,field: 'upperModelTolerancePercent'}
 
        ]
    }
    
    
    private addEquivalenceCellRenderer(params) {
        
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
            var result = '<span>';
            result += '<i class="material-icons addEquivalenceClass cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Add Equivalence">queue</i>';
            return result;
        }else{
            return '';
        }
    }
     
    private alternativeCellRenderer(params){
        
        var result;
        if(params.colDef.headerName == 'T'){
            result = params.data.taxableSecurity;
        }else if(params.colDef.headerName == 'TD'){
            result = params.data.taxDeferredSecurity;
        }else if(params.colDef.headerName == 'TE'){
            result = params.data.taxExemptSecurity;
        }
        
        
        var symbol =  (result == undefined ? '' : result.symbol);
        
        if(symbol == undefined){
            params.data[params.colDef.field] = '';
            return '';
        }else{
            return symbol;
        }
    }
   
    private createModelFormControl(){
        
        this.modelForm = this.builder.group({
            modelName: new Control(this.selectedModel.name , Validators.required),
        });
    }
    private  createModelElement(clickedElement, index, isChild) {
       this.newElement = <IModelElement>{id: 0};
       this.addElement(clickedElement, this.newElement, index, isChild) 
    }
    private addElement(clickedElement, newElement, index, isChild) {
        // add model element to the list
        if(this.classColorIndex > 15) {
            this.classColorIndex = 0;
        }
        if(clickedElement == undefined || clickedElement == null) {
            newElement.parentElement = null;
            newElement.level = 1;
            index = index;
            newElement.colorCounter = ++this.classColorIndex;
        }
        else {
            if(!isChild) {
                newElement.colorCounter = clickedElement.colorCounter;
                newElement.parentElement = clickedElement.parentElement;
                newElement.level = clickedElement.level;
                index = index+1;
            }
            else {
                var isChildFound = false;
                newElement.parentElement = clickedElement;
                newElement.level = parseInt(clickedElement.level.toString())+1;
                var siblingIndex = index;
                var iteratorIndex = index+1;
                while(iteratorIndex<this.selectedModel.modelElements.length){
                    if(this.selectedModel.modelElements[iteratorIndex].parentElement == clickedElement) { 
                        siblingIndex = iteratorIndex;
                        isChildFound = true;
                    }
                    iteratorIndex = iteratorIndex+1;
                }
                
                if(index == siblingIndex && !isChildFound) {
                    index = iteratorIndex;
                    newElement.colorCounter = ++this.classColorIndex;
                }
                else {
                    newElement.colorCounter = this.selectedModel.modelElements[siblingIndex].colorCounter;
                    index = siblingIndex+1;
                }
                clickedElement.hasChild = true;
            }
        }
        newElement.relatedTypeId = 0;
        newElement.lowerModelToleranceAmount = 0;
        newElement.upperModelToleranceAmount = 0;
        newElement.isSecuritySet = false;
        this.selectedModel.modelElements.splice(index,0,newElement);
    }

    private removeElement(i: number) {
        // remove elemnt from the model
        this.displayConfirm = true;
        this.deletedElementIndex = i;
    }
    
    private deleteModelElement() {
        var isChild = false;
        var removedElementParent = this.selectedModel.modelElements[this.deletedElementIndex].parentElement;
        var removedElementParentIndex = 0;
        this.removeChildElement(this.deletedElementIndex);
        this.selectedModel.modelElements.splice(this.deletedElementIndex,1);
        /* enable checkBox */
        for(var iteratorIndex=0; iteratorIndex<this.selectedModel.modelElements.length; iteratorIndex++){
            if(this.selectedModel.modelElements[iteratorIndex] == removedElementParent) {
                removedElementParentIndex = iteratorIndex;
            }
            if(this.selectedModel.modelElements[iteratorIndex].parentElement == removedElementParent) {
                isChild = true;
            }
        }
        if(!isChild && removedElementParentIndex!= 0) {
            this.selectedModel.modelElements[removedElementParentIndex].hasChild = false;
        }
        this.displayConfirm = false;
    }

    private removeChildElement(deletedElementIndex) {
        console.log(deletedElementIndex);
          for(var iteratorIndex=0; iteratorIndex<this.selectedModel.modelElements.length; iteratorIndex++){
            if(this.selectedModel.modelElements[iteratorIndex].parentElement 
                    == this.selectedModel.modelElements[deletedElementIndex]) {
                this.removeChildElement(iteratorIndex);       
                this.selectedModel.modelElements.splice(iteratorIndex,1);
            }
        }
        
    }
    private saveModel(){
            var newModel = <IModelDetail>{};
            this.convertTOJson(newModel);
            //if(this.modalForm.valid){
            this.responseToObject<IModelDetail>(this._modelService.updateModel(newModel))
                        .subscribe(model => {
                        this.navigateToModelListView();
                    });
                
        // }
        }
    private navigateToModelListView(){
        this.displayModelList.emit("Display models");
    }
    convertJsonToModel() {
            this.selectedModel.modelElements = [];
        this.pushChildrenINArray(this.selectedModel.modelDetail.children, null)
    }
    pushChildrenINArray(children, parent) {
        if(children == undefined || children == null) {
            return ;
        }
        var length = children.length;
        for(var index = 0; index < length; index++) {
            children[index].parentElement = parent;
            if(index >0) {
                this.pushElement(children[index-1], children[index],false);
            }
            else {
                this.pushElement(parent,children[index],true);   
            }
            //this.selectedModel.modelElements.push();
            this.pushChildrenINArray(children[index].children, children[index]);
        }
    }
    
    private pushElement(clickedElement, newElement, isChild) {
        // add model element to the list
        var index = 0;
        if(this.classColorIndex > 15) {
            this.classColorIndex = 0;
        }
        if((clickedElement == undefined || clickedElement == null) && isChild) {
                newElement.parentElement = null;
              //  newElement.level = 1;
                newElement.colorCounter = 1;
        }
        else {
            if(!isChild) {
                newElement.colorCounter = clickedElement.colorCounter;
                newElement.parentElement = clickedElement.parentElement;
                //newElement.level = clickedElement.level;
                for(var iteratorIndex=0; iteratorIndex<this.selectedModel.modelElements.length; iteratorIndex++){
                    if(this.selectedModel.modelElements[iteratorIndex] == clickedElement) {
                        index = iteratorIndex+1;
                        break;
                    }
                 }
                 
            }
            else {
               var isChildFound = false;
               newElement.parentElement = clickedElement;
               for(var iteratorIndex=0; iteratorIndex<this.selectedModel.modelElements.length; iteratorIndex++){
                    if(this.selectedModel.modelElements[iteratorIndex].parentElement == clickedElement) { 
                        index = iteratorIndex;
                        isChildFound = true;
                    }
                    iteratorIndex = iteratorIndex+1;
                }
                
                if(isChildFound) {
                    newElement.colorCounter = this.selectedModel.modelElements[index].colorCounter
                }
                else {
                   newElement.colorCounter = ++this.classColorIndex;
                }
                
                index = index+1;
                if(clickedElement != null) {
                    clickedElement.hasChild = true;
                }
            }
        }
        if(newElement.relatedTypeId != undefined && newElement.relatedTypeId != null && newElement.relatedTypeId != 0) {
            newElement.isSecuritySet = true;
        }
        this.selectedModel.modelElements.splice(index,0,newElement);
    }
    convertTOJson(model) {
        model.name = this.selectedModel.name;
        model.id = this.selectedModel.id;
        model.modelDetail = <IModelDetail>{};
        model.modelDetail.name = model.name;
        model.ownerUserId = 370925;
        model.dynamicModel = 0;
        if(this.selectedModel.modelDetail != undefined && this.selectedModel.modelDetail != null) {
            model.modelDetail.id = this.selectedModel.modelDetail.id   
        }
        model.modelDetail.children = []
        for(var index= 0; index< this.selectedModel.modelElements.length; index++) {
            this.selectedModel.modelElements[index].children = null;
            if(this.selectedModel.modelElements[index].parentElement == null) {
                model.modelDetail.children.push(this.selectedModel.modelElements[index]);
            }
            else {
            this.pushInChild(this.selectedModel.modelElements[index], model.modelDetail.children);
            }
        
        }
        model.modelElements = null;
    }
    
    pushInChild(node, children) {
        if(children != null) {
            for(var index=0; index < children.length; index++) {
                if(children[index] == node.parentElement) {
                    node.parentElement = null;
                    if(children[index].children == undefined || children[index].children == null) {
                        children[index].children = [];
                    }
                    children[index].children.push(node);
                    return;
                }
                else {
                    this.pushInChild(node, children[index].children);
                }
            }
        }
    }
}