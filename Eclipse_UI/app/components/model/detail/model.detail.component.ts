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
import { OrderBy } from '../../../pipes/FilterPipe';
import { ModelService } from '../../../services/model.service';
import { SecuritySetService} from '../../../services/securityset.service';
import 'ag-grid-enterprise/main';

import { BaseComponent } from '../../../core/base.component';
import { IModelDetail } from '../../../models/modelDetail';
import {IModelElement} from '../../../models/modelElement';
import {ISecuritySet} from '../../../models/securitySet';

@Component({
    selector: 'eclipse-model-detail',
    templateUrl: './app/components/model/detail/model.detail.component.html',
    pipes: [OrderBy],
    providers: [ModelService, SecuritySetService],
    directives: [AgGridNg2, FORM_DIRECTIVES, Dialog, Button, AutoComplete]
})
export class ModelDetailComponent extends BaseComponent {
    
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
    private securitySetDetail = {};
    
    @Input() modelId: number;
    @Output() displayModelList = new EventEmitter(); 
    constructor (private _modelService: ModelService, private _securitySetService: SecuritySetService,
                 private builder: FormBuilder, private _cdr: ChangeDetectorRef, private _router: Router) {
        super();
        this.selectedModel.name = "M";
        this.createModelFormControl();
        
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
    }
    private getSecuritySetDetail(securitySetId){
        this.securitySetDetail = {};
         if(securitySetId != undefined && securitySetId != null && securitySetId != 0){
            this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(securitySetId))
            .subscribe(data => {
                this.securitySetDetail = data;
                console.log(this.securitySetDetail);
            });
       }
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
                newElement.level = clickedElement.level+1;
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
            }
        }
        newElement.relatedTypeId = 0;
        this.selectedModel.modelElements.splice(index,0,newElement);
    }

    private removeElement(i: number) {
        // remove elemnt from the model
        this.displayConfirm = true;
        this.deletedElementIndex = i;
    }
    
    private deleteModelElement() {
        
        for(var iteratorIndex=0; iteratorIndex<this.selectedModel.modelElements.length; iteratorIndex++){
            if(this.selectedModel.modelElements[iteratorIndex].parentElement 
                    == this.selectedModel.modelElements[this.deletedElementIndex]) {
                this.selectedModel.modelElements.splice(iteratorIndex,1);
            }
        }
        
        this.selectedModel.modelElements.splice(this.deletedElementIndex,1);
         this.displayConfirm = false;
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
            }
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