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
import { RebalanceModelService } from '../../../../services/rebalance.model.service';
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
    providers: [RebalanceModelService, SecuritySetService],
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
    private modelGridOptions: GridOptions;
    private modelColumnDefs: ColDef[];
    private selectedModelElement = <IModelElement>{};
    private clickedModelElement = <IModelElement>{};
    private previousRelatedTypeId = 0;
    private invalidNameError: boolean;
    private invalidModelElementError: boolean;
    private submitModel: boolean;
    private isTargetPercentInValid : boolean;
    private isTargetPercentNull: boolean;
    private isSecuritySet : boolean;
    @Input() modelId: number;
    @Output() displayModelList = new EventEmitter(); 
    constructor (private _modelService: RebalanceModelService, private _securitySetService: SecuritySetService,
                 private builder: FormBuilder, private _cdr: ChangeDetectorRef, private _router: Router) {
        super();
        this.createModelFormControl();
        this.submitModel = false;
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },

        };
        this.modelGridOptions = <GridOptions>{
            enableColResize: true,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },

        };
        
        this.createColumnDefs();
        this.createModelColumnDefs();
     }
     
     ngOnInit(){
         this.displayConfirm = false;
         this.selectedModel.modelElements = [];
         this.classColorIndex = 0; 
         this.getsecuritySetList();
         this.securitySetDetail.securities = [];
         this.isTargetPercentInValid = false;
         this.isTargetPercentNull = false;
         this.isSecuritySet =  false;
         if(this.modelId != undefined && this.modelId != 0) {
            this.getModelDetail();  
        }
        if(this.selectedModel.modelElements == null || this.selectedModel.modelElements.length == 0) {
             this.selectedModel.modelDetail = <IModelDetail>{};
             this.selectedModel.modelDetail.children = [];
                var newElement = this.getNewElement();
                newElement.level = 1;
               this.selectedModel.modelDetail.children.push(newElement);
           //  this.createModelElement(null, -1, false);
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
                this.securitySetDetail = <ISecuritySet>{};
                this.securitySetDetail.securities = [];
                if(securitySetId != undefined && securitySetId != null && securitySetId != 0){
                
                this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(securitySetId))
                .subscribe(data => {
                    this.securitySetDetail = data;
                    this.enableGridChildren();
                
                });
            }
     
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
    }
    private getModelDetail(){
       if(this.modelId != 0){
            this.responseToObject<IModelDetail>(this._modelService.getModelDetail(this.modelId))
            .subscribe(model => {
                this.selectedModel = model;
                this.enableModelGridChildren();
                //this.convertJsonToModel(); 
            });
       }
      
    }
    
    enableModelGridChildren(){
        this.modelGridOptions.getNodeChildDetails = function(modelElement) {
                if (modelElement.children != null && modelElement.children != undefined &&
                    modelElement.children.length > 0) {
                    return {
                        group: true,
                        children: modelElement.children,
                        expanded: true
                    };
                } else {
                    return null;
                }
            }
            
          var self = this;
          this.modelGridOptions.api.refreshView();
    }
    private rowSelected(event){
        if(event.data.relatedTypeId != this.previousRelatedTypeId) {
            if(event.data.isSecuritySet){
                this.getSecuritySetDetail(event.data);
            }else{
                this.securitySetDetail = <ISecuritySet>{};
                this.securitySetDetail.securities = [];
            }
             this.previousRelatedTypeId = event.data.relatedTypeId;
        }
    }
     private classificationEditor(params, self) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : params.value);
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
           
            var list = self.securitySetList;

            
            
            if(list != undefined){
                 var eOption = document.createElement("option");
                    eOption.setAttribute("value", 'null');
                    eOption.innerHTML = "Select Security Set";
                    eSelect.appendChild(eOption);
                list.forEach(function(item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.id);
                    eOption.innerHTML = item.name;
                    eSelect.appendChild(eOption);
                });
            }
            
            eSelect.value = params.data.relatedTypeId;

            eCell.addEventListener('click', function () {
                
                if (!editing) {
                   
                    eCell.removeChild(eLabel);
                    eCell.appendChild(eSelect);
                    eSelect.focus();
                    editing = true;
                }
            });

            eSelect.addEventListener('blur', function () {
                
                if (editing) {
                    
                    editing = false;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                }
            });

            eSelect.addEventListener('change', function () {
                
                if (editing) {
                    
                    
                    editing = false;
                    var newValue = eSelect.value == undefined ? '' : eSelect.selectedOptions[0].textContent;
                    params.data[params.colDef.field] = newValue;
                    params.data.relatedTypeId = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    self.getSecuritySetDetail(params.data);
                }
            });

            return eCell;

    }
    
     private numberEditor(params, self) {
            
        var eInput = document.createElement("input");
            
        eInput.className = "form-control grid-input";
                
        if(params.data[params.colDef.field] == undefined) {
            params.data[params.colDef.field] == 0;
        }        
        eInput.value = params.data[params.colDef.field] == undefined ? 0 : params.data[params.colDef.field];
                
        eInput.addEventListener('blur', function (event) {
            
            params.data[params.colDef.field] = params.data[params.colDef.field] == null ? 0 : params.data[params.colDef.field];
            if(params.data[params.colDef.field] != eInput.value){
               params.data[params.colDef.field] = isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(eInput.value);
            }
            
            if(params.colDef.field == "targetPercent") {
                
                if(params.node.parent == undefined) {
                    self.validateTargetPercent(self.selectedModel.modelDetail.children);    
                }
                else {
                    self.validateTargetPercent(params.node.parent.data.children);
                }
            }
               
         });
                 
        eInput.addEventListener('keypress' , function(event){
              if(event.which == 8 || event.which == 0){
                       return true;
               }
               if(event.which == 46 && eInput.value.indexOf('.') != -1) {
                            event.preventDefault();
                            return false;
                }
                if(event.which <= 47 || event.which >= 59) {
                           if(event.which != 46){
                              event.preventDefault();
                              return false; 
                           }
                        }
        });
                 
         return eInput;
   
     }
     private stringEditor(params, self) {
            
        if(params.data['isSecuritySet']) {    
        
        }
        params.data.relatedTypeId = 0;
        var eInput = document.createElement("input");
        eInput.className = "form-control grid-input";
        eInput.maxLength = 255;
        eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];              
        eInput.addEventListener('blur', function (event) {
            
            params.data[params.colDef.field] = params.data[params.colDef.field] == null ? '' : params.data[params.colDef.field];
            if(params.data[params.colDef.field] != eInput.value){
               params.data[params.colDef.field] = eInput.value;
            }
               
         });
         return eInput;
   
     }
     
     private checkboxEditor(params, self) {
        var eInput = document.createElement("input");
        eInput.className = "form-control grid-input";
        eInput.setAttribute("type", 'checkbox');
        eInput.setAttribute("style", "height:16px;");
        eInput.checked = params.data[params.colDef.field];
        if(params.data.children != null && params.data.children.length != 0){
            eInput.disabled = true;   
        }
        eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];              
        eInput.addEventListener('change', function (event) {
           params.data[params.colDef.field] = eInput.checked;
           
         self.modelGridOptions.api.setRowData(self.selectedModel.modelDetail.children);
        });  
       return eInput;
   
     }
    private createModelColumnDefs() {
        let self = this;
        this.modelColumnDefs =  [
            <ColDef>{headerName: "Level" , width: 100, headerTooltip: 'Level', field: 'level',
                cellRenderer:  'group', 
                cellRendererParams: {
                    innerRenderer: function(params){
                            return params.data.level;    
                        }
                }
            },
            
            <ColDef>{headerName: "Is Security Set" , width: 130, headerTooltip: 'Is Security Set', cellClass: 'text-center', field: 'isSecuritySet',
               
                 cellRenderer: function(params){
                    return self.checkboxEditor(params , self);
                }  
            },
            <ColDef>{headerName: "Name" , width: 200, headerTooltip: 'Name', cellClass: 'text-center', field: 'name',
               
                 cellRenderer: function(params){
                    if(params.data["isSecuritySet"]) {
                        return self.classificationEditor(params, self);
                    }
                    else {
                        return self.stringEditor(params , self);
                    }
                }  
            },
            <ColDef>{headerName: "Target %" , width: 100, headerTooltip: 'Target %', suppressSorting: true,field: 'targetPercent',
                  cellRenderer: function(params){
                              return self.numberEditor(params , self);
                      }   
            },
            <ColDef>{headerName: "Low Tol %" , width: 100, headerTooltip: 'Low Tol %',
                      cellClass: 'text-center ', field: 'lowerModelTolerancePercent',
                      cellRenderer: function(params){
                              return self.numberEditor(params , self);
                      }   
            },
            <ColDef>{headerName: "Upp Tol %" , width: 100, headerTooltip: 'Upp Tol %', suppressSorting: true,field: 'upperModelTolerancePercent',
                 cellRenderer: function(params){
                              return self.numberEditor(params , self);
                      }       
            },
            <ColDef>{headerName: "Low Trade %" , width: 100, headerTooltip: 'Low Trade %', suppressSorting: true,field: 'lowerTradeTolerancePercent',
                 cellRenderer: function(params){
                              return self.numberEditor(params , self);
                      }   
            },
            <ColDef>{headerName: "Upp Trade %" , width: 100, headerTooltip: 'Upp Trade %', suppressSorting: true,field: 'upperTradeTolerancePercent',
                 cellRenderer: function(params){
                              return self.numberEditor(params , self);
                      }   
            },
            <ColDef>{headerName: "" , width: 60, headerTooltip: 'Delete', suppressMenu: true, suppressSorting: true,
                        cellRenderer: this.deleteCellRenderer, cellClass: 'text-center '},
            <ColDef>{headerName: "" , width: 110, headerTooltip: 'Delete', suppressMenu: true, suppressSorting: true,
                        cellRenderer: this.addChildCellRenderer, cellClass: 'text-center '},
            <ColDef>{headerName: "" , width: 120, headerTooltip: 'Delete', suppressMenu: true, suppressSorting: true,
                        cellRenderer: this.addSiblingCellRenderer, cellClass: 'text-center '},
        ]
    }
    
   private deleteCellRenderer(params) {
        if(params.rowIndex != 0) {
            var result = '<span>';
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.rowIndex + ' value=' + params.rowIndex + ' title="Delete"></i>';
            return result;
        }
       else {
           return '';
       }
    }
    
   private addChildCellRenderer(params) {
            var result = '<span>';
            result += '<span class="sub-row cursor" id =' + params.rowIndex + ' value=' + params.rowIndex+ ' title="Add Child">Add Child</span>';
            return result;
    }
    
   private addSiblingCellRenderer(params) {
            var result = '<span>';
            result += '<span class="sub-row cursor" aria-hidden="true" id =' + params.rowIndex + ' value=' + params.rowIndex + ' title="Add Sibling">Add Sibling</span>';
            return result;    
    }
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            var decodeData = (targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());        
            if (targetElement.title === "Delete") {
               this.deletedElementIndex = parseInt(decodeData);
               this.displayConfirm = true;
           }
            
           if (targetElement.title === "Add Child") {
               var rowIndex = parseInt(decodeData);
                this.addChild(rowIndex, true, this);
               
           }
           if (targetElement.title === "Add Sibling") {
                var rowIndex = parseInt(decodeData);
                this.addChild(rowIndex, false, this);

           }
        }    
    }
    
    private addChild(rowIndex, isChild, self) {
        this.invalidNameError = false;
        this.isSecuritySet = false;
        var rowModel = this.modelGridOptions.api.getModel();
        if(rowModel.getRow(rowIndex).data.name != null && rowModel.getRow(rowIndex).data.name.length >0) {
            var newElement = this.getNewElement();
            if(isChild && rowModel.getRow(rowIndex).data.relatedTypeId == 0) {      
                if(rowModel.getRow(rowIndex).data.children == undefined || rowModel.getRow(rowIndex).data.children == null) {
                    rowModel.getRow(rowIndex).data.children = [];
                    self.enableModelGridChildren();
                }
                newElement.level = parseInt(rowModel.getRow(rowIndex).data.level)+1;
                rowModel.getRow(rowIndex).data.children.push(newElement);
            }
            else if(!isChild) {
                 newElement.level = parseInt(rowModel.getRow(rowIndex).data.level);
               if(rowModel.getRow(rowIndex).parent == undefined || rowModel.getRow(rowIndex).parent.data == null) {
                   self.selectedModel.modelDetail.children.push(newElement);
               }
               else {
                rowModel.getRow(rowIndex).parent.data.children.push(newElement);
               }
            }
            else if(isChild && rowModel.getRow(rowIndex).data.relatedTypeId != 0) {
                this.isSecuritySet = true;
            }
            setTimeout(function (){
                 self.modelGridOptions.api.setRowData(self.selectedModel.modelDetail.children);
                
          },500);
           
        }
        else {
            this.invalidNameError = true;
        }
    }
    
    
    private getNewElement() {
        var newElement = <IModelElement>{id: 0}; 
        newElement.relatedTypeId = 0;
        newElement.targetPercent = 0;
        newElement.lowerModelTolerancePercent = 0;
        newElement.upperModelTolerancePercent = 0;
        newElement.lowerTradeTolerancePercent = 0;
        newElement.upperTradeTolerancePercent = 0;
        newElement.lowerModelToleranceAmount = 0;
        newElement.upperModelToleranceAmount = 0;
        newElement.isSecuritySet = false;
        return newElement;
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
    
    
    private deleteModelElement() {
          var rowModel = this.modelGridOptions.api.getModel();
          this.clickedModelElement = rowModel.getRow(this.deletedElementIndex).data;
        this.removeChild(this.selectedModel.modelDetail.children);
        this.enableGridChildren();
        this.modelGridOptions.api.setRowData(this.selectedModel.modelDetail.children);
        this.displayConfirm = false;
    }

    removeChild(children) {
        if(children == undefined || children == null) {
            return ;
        }
        var length = children.length;
        for(var index = 0; index < length; index++) {
            if(children[index].name == this.clickedModelElement.name) {
               children.splice(index,1);   
               return;              
            }
            this.removeChild(children[index].children);
        }
    }
    private saveModel(){
        this.invalidNameError = false;
        this.invalidModelElementError = false;
        this.submitModel = true;
        this.isTargetPercentInValid = false;
        this.isTargetPercentNull = false;
        if(this.modelForm.valid && this.validateModel() && !this.isTargetPercentInValid && !this.isTargetPercentNull) {
            this.responseToObject<IModelDetail>(this._modelService.updateModel(this.selectedModel))
                    .subscribe(model => {
                    this.navigateToModelListView();
                });
        }
    }
    private validateModel() {
        var isValid = true;
        isValid = !this.inValidateChild(this.selectedModel.modelDetail.children);
        return isValid;
    }
    inValidateChild(children) {
          if(children == undefined || children == null || children.length == 0) {
              return false;
          }
             var targetPercentSum = 0;
            for(var index=0; index < children.length; index++) {
                 targetPercentSum += children[index].targetPercent;
                 if(children[index].targetPercent == 0) {
                     this.isTargetPercentNull = true;
                 }
                 if(children[index].name == undefined || children[index].name == null || children[index].name.length == 0) {
                        this.invalidNameError = true;
                        return true;
                    }
                    else if(children[index].children == null || children[index].children.length == 0) {
                        if(children[index].relatedTypeId == null || children[index].relatedTypeId == 0) {
                            this.invalidModelElementError = true;
                            return true;
                        }
                       
                    }
                var isInvalid =  this.inValidateChild(children[index].children);
                if(isInvalid) {
                    return isInvalid;
                }
           
        }
        if(targetPercentSum != 100) {
            this.isTargetPercentInValid = true;
        }
    }
    
    validateTargetPercent(children) {
        this.isTargetPercentInValid = false;
        this.isTargetPercentNull = false;   
        var rowModel = this.modelGridOptions.api.getModel();
        var targetPercentSum = 0;
        for(var index =0; index< children.length; index++){
                targetPercentSum += children[index].targetPercent;
                 if(children[index].targetPercent == 0) {
                     this.isTargetPercentNull = true;
                 }
            }
  
        if(targetPercentSum != 100) {
            this.isTargetPercentInValid = true;
        }
    }
    private navigateToModelListView(){
        this.displayModelList.emit("Display models");
    }
   private EditSecuritySet() {
       
   }
}