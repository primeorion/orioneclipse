import { Component, HostListener } from '@angular/core';
import {GridOptions, ColDef} from 'ag-grid/main';
import * as Util from '../../../../core/functions';
import { ITabNav } from '../../../../viewmodels/tabnav';
import 'ag-grid-enterprise/main';


import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { ISubClass } from '../../../../models/subClass';



@Component({
    selector: 'eclipse-subclass-maintenance',
    templateUrl: './app/components/security/assetmaintenance/subclassmaintenance/subclass.maintenance.component.html'
})
export class SubClassMaintenanceComponent extends BaseComponent {
    
    private tabsModel: ITabNav = <ITabNav>{};
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allSubClasses: ISubClass[];
    private subClass: ISubClass = <ISubClass>{color:'#96e499'};
    private subClassData: ISubClass[];
    private isEditSubClass: boolean = false;
    private displayConfirm: boolean = false;
    private selectedSubClassId: number;
    private selectedSubClassName: string;
    private isSubClassDuplicate: boolean =  false;
    private subClassDuplicateMessage: string;
    private submitSubClass: boolean = false;
    
    private isAssetDeleteError: boolean = false;
    
    
    constructor(private _securityService: SecurityService ) {
        super(PRIV_SECURITIES);
        
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true
        };
        
        this.createColumnDefs();
        this.getSubClasses();
        
    }
   
    private getSubClasses(){
        this.ResponseToObjects<ISubClass>(this._securityService.getSubClassData())
            .subscribe(model => {
                this.allSubClasses = model;
                this.subClassData = this.allSubClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.subClassData);
                this.gridOptions.api.sizeColumnsToFit();
            });
    }
    
    private editSubClass(){
        
        for(var i = 0 ; i < this.allSubClasses.length ; i ++){
            var obj = this.allSubClasses[i];
            
            if(obj.id == this.selectedSubClassId){
                this.subClass = Object.assign({}, obj);
                break;
            }
        }
        
        this.isEditSubClass = true;
    }
   
    private saveSubClass(form){
        
        this.submitSubClass = true;
        if(form.valid){
        this.responseToObject<ISubClass>(this._securityService.saveSubClass(this.subClass))
            .subscribe(model => {
                
                this.allSubClasses.push(model);
                this.subClassData = this.allSubClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.subClassData);
                this.resetHtmlForm(form);
            },
            err => {
                this.isSubClassDuplicate = true;
                this.subClassDuplicateMessage = err.message;
            });
        
        }
    }
    
    private updateSubClass(form){
        
        this.submitSubClass = true;
        if(form.valid){
        this.responseToObject<ISubClass>(this._securityService.updateSubClass(this.subClass))
            .subscribe(model => {
                
                this.allSubClasses.forEach(subClass => {
                    if(subClass.id == model.id){
                        subClass.name = model.name;
                        subClass.color = model.color;
                        return true;
                    }
                });
                
                this.subClassData = this.allSubClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.subClassData);
                this.resetForm();
            },
            err => {
                this.isSubClassDuplicate = true;
                this.subClassDuplicateMessage = err.message;
            });
        }
        
    }
    
    private deleteSubClass(){
        
        this.responseToObject<ISubClass>(this._securityService.deleteSubClass(this.selectedSubClassId))
            .subscribe(model => {
                
                this.allSubClasses.forEach(subClass => {
                    if(subClass.id == this.selectedSubClassId){
                        subClass.isDeleted = 1;
                        return true;
                    }
                });
                
                this.subClassData = this.allSubClasses.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.subClassData);
                this.displayConfirm = false;
                
        },
        err =>{
            this.allSubClasses.forEach(subClass => {
                    if(subClass.id == this.selectedSubClassId){
                        this.selectedSubClassName = subClass.name;
                        return true;
                    }
            });
            this.displayConfirm = false;
            this.isAssetDeleteError = true;
        });
    }
    
   private resetHtmlForm(form){
      this.submitSubClass = false;
      form.reset();
      var self = this;
      setTimeout(function (){
          self.resetForm();
      },500);
  }
    
    private resetForm(){
        this.subClass = <ISubClass>{color:'#96e499', name:''};
        this.submitSubClass = false;
        this.isEditSubClass = false;
        this.isSubClassDuplicate = false;
    }
   
    
    
    private createColumnDefs() {
       var self =  this;
       this.columnDefs = [
            <ColDef>{headerName: "Sub-Class Id" , width: 150, headerTooltip: 'Sub-Class Id', suppressMenu: true,suppressSorting: true,field: 'id'},
            <ColDef>{headerName: "Sub-Class Name" , width: 150, headerTooltip: 'Sub-Class Name', suppressMenu: true,suppressSorting: true, field: 'name'},
            <ColDef>{headerName: "Sub-Class Color" , width: 150, headerTooltip: 'Sub-Class Color', suppressMenu: true,suppressSorting: true,field:'color',
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
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' , hide: !self.tabsModel.canDelete}
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
                this.selectedSubClassId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.displayConfirm = true;
            }
            
            if (targetElement.title === "Edit") {
                this.selectedSubClassId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.editSubClass();
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