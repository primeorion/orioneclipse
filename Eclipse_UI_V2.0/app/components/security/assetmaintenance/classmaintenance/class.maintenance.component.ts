import { Component, HostListener } from '@angular/core';
import {GridOptions, ColDef} from 'ag-grid/main';
import * as Util from '../../../../core/functions';
import { ITabNav } from '../../../../viewmodels/tabnav';
import 'ag-grid-enterprise/main';

import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { IClass } from '../../../../models/class';

@Component({
    selector: 'eclipse-class-maintenance',
    templateUrl: './app/components/security/assetmaintenance/classmaintenance/class.maintenance.component.html'
})
export class ClassMaintenanceComponent extends BaseComponent {
    
    private tabsModel: ITabNav = <ITabNav>{};
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allClasses: IClass[];
    private class: IClass = <IClass>{color:'#96e499'};
    private classData: IClass[];
    private isEditClass: boolean = false;
    private displayConfirm: boolean = false;
    private selectedClassId: number;
    private isClassDuplicate: boolean = false;
    private classDuplicateMessage: string;
    private submitClass: boolean = false;
    
    private isAssetDeleteError: boolean = false;
    private selectedClassName: string;
    
    constructor(private _securityService: SecurityService) {
        super(PRIV_SECURITIES);
        
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true
        };
        
        this.createColumnDefs();
        this.getClasses();
        
    }
   
    private getClasses(){
        this.ResponseToObjects<IClass>(this._securityService.getClassData())
            .subscribe(model => {
                this.allClasses = model;
                this.classData = this.allClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.classData);
                this.gridOptions.api.sizeColumnsToFit();
            });
    }
    
    private editClass(){
        
        for(var i = 0 ; i < this.allClasses.length ; i ++){
            var obj = this.allClasses[i];
            
            if(obj.id == this.selectedClassId){
                this.class = Object.assign({}, obj);
                break;
            }
        }
        this.isEditClass = true;
    }
   
    private saveClass(form){
        
        this.submitClass = true;
        if(form.valid){
        this.responseToObject<IClass>(this._securityService.saveClass(this.class))
            .subscribe(model => {
                
                this.allClasses.push(model);
                this.classData = this.allClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.classData);
                this.resetHtmlForm(form);
            },
            err => {
                this.isClassDuplicate = true;
                this.classDuplicateMessage = err.message;
            });
        
        }
    }
    
    private resetHtmlForm(form){
      this.submitClass = false;
      form.reset();
      var self = this;
      setTimeout(function (){
          self.resetForm();
      },500);
  }
    
    private updateClass(form){
        
        this.submitClass = true;
        if(form.valid){
        this.responseToObject<IClass>(this._securityService.updateClass(this.class))
            .subscribe(model => {
                
                this.allClasses.forEach(obj => {
                    if(obj.id == model.id){
                        obj.name = model.name;
                        obj.color = model.color;
                        return true;
                    }
                });
                
                this.classData = this.allClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.classData);
                this.resetForm();
            },
             err => {
                this.isClassDuplicate = true;
                this.classDuplicateMessage = err.message;
            });
        
        }
    }
    
    private deleteClass(){
        
        this.responseToObject<IClass>(this._securityService.deleteClass(this.selectedClassId))
            .subscribe(model => {
                
                this.allClasses.forEach(obj => {
                    if(obj.id == this.selectedClassId){
                        obj.isDeleted = 1;
                        return true;
                    }
                });
                
                this.classData = this.allClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.classData);
                this.displayConfirm = false;
                
        },
        err =>{
            this.allClasses.forEach(obj => {
                    if(obj.id == this.selectedClassId){
                        this.selectedClassName = obj.name;
                        return true;
                    }
            });
            this.displayConfirm = false;
            this.isAssetDeleteError = true;
        });
    }
    
    private resetForm(){
        this.class = <IClass>{color:'#96e499', name: ''};
        this.submitClass = false;
        this.isEditClass = false;
        this.isClassDuplicate = false;
    }
   
    
    
    private createColumnDefs() {
        var self = this;
       this.columnDefs = [
            <ColDef>{headerName: "Class Id" , width: 150, headerTooltip: 'Class Id', suppressMenu: true,suppressSorting: true,field: 'id'},
            <ColDef>{headerName: "Class Name" , width: 150, headerTooltip: 'Class Name', suppressMenu: true,suppressSorting: true, field: 'name'},
            <ColDef>{headerName: "Class Color" , width: 150, headerTooltip: 'Class Color', suppressMenu: true,suppressSorting: true,field:'color',
                     cellRenderer: function(params){
                         
                          if(params.value == null){
                             return '';
                         }else{
                            var resultElement = document.createElement("span");
                            
                            var eSpan = document.createElement('span');
                            eSpan.setAttribute('class','gridColorPicker');
                            eSpan.style.backgroundColor = params.value;
                            
                            resultElement.appendChild(eSpan);
                            resultElement.appendChild(document.createTextNode(params.value));
                            
                            return resultElement;
                         }
                     }
                   },
            <ColDef>{headerName: "Edit" , width: 50, headerTooltip: 'Edit', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.editCellRenderer, cellClass: 'text-center ' , hide: !self.tabsModel.canUpdate},
            <ColDef>{headerName: "Delete" , width: 50, headerTooltip: 'Delete', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ', hide: !self.tabsModel.canDelete}
        ];
    }
    
    private editCellRenderer(params) {
       
       if (params.data.isImported == 0) { 
            var result = '<span>';
            result += '<i class="fa fa-edit cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Edit"></i>';
            return result;
       }else{
           
            var result = '<span>';
            result += '<i class="fa fa-lock" title="Can not Edit/Delete. Imported from Orion Connect"></i>';
            return result;
       }
        
    }
    
    private deleteCellRenderer(params) {
       
       if (params.data.isImported == 0) { 
            var result = '<span>';
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete"></i>';
            return result;
       }else{
            return '';
       }
        
    }
        
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.title === "Delete") {
                this.selectedClassId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.displayConfirm = true;
           }
            
            if (targetElement.title === "Edit") {
                this.selectedClassId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.editClass();
             }
        }
        
    }
    
    private getContextMenuItems(params) {
        var result =[];
        if(params.node.data.isImported == 0){
            result.push( {
                name: '<hidden id =' + params.node.data.id + '>Delete</hidden>'
               }
           );
        }
        
        return result;
    }
}