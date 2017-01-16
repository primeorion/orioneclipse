import { Component , HostListener} from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { ColorPickerDirective } from '../../../../shared/colorPicker/color-picker/color-picker.directive'

import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { ICategory } from '../../../../models/category';
import { CustomValidator } from '../../../../shared/validator/CustomValidator'



@Component({
    selector: 'eclipse-category-maintenance',
    templateUrl: './app/components/security/assetmaintenance/categorymaintenance/category.maintenance.component.html',
    providers: [SecurityService],
    directives: [AgGridNg2, ColorPickerDirective, FORM_DIRECTIVES, Dialog, Button]
})
export class CategoryMaintenanceComponent extends BaseComponent {
    
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allCategories : ICategory[];
    private categoryData: ICategory[];
    private category: ICategory = <ICategory>{color:'#96e499'};
    private isEditCategory: boolean = false;
    private displayConfirm: boolean = false;
    private isCatgeoryDuplicate: boolean = false;
    private categoryDuplicateMessage: string;
    private selectedCategoryId: number;
    
    
    private categoryForm: ControlGroup;
    private submitCategory: boolean = false; 
    private categoryUpdateForm: ControlGroup;
    
    private isAssetDeleteError: boolean = false;
    private selectedCategoryName: string;
   
    constructor(private _securityService: SecurityService , private builder: FormBuilder) {
        super();
        
        
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true
        };
        
        
        this.createCategoryFormControl();
        this.createColumnDefs();
        this.getCategories();
        
    }
    
    private createCategoryFormControl(){
        
        this.categoryForm = this.builder.group({
            name: new Control(this.category.name, CustomValidator.validateString)
        });
        this.categoryUpdateForm = this.builder.group({
            name: new Control(this.category.name, CustomValidator.validateString)
        });
    }
   
    
    private getCategories(){
        this.ResponseToObjects<ICategory>(this._securityService.getCategoryData())
            .subscribe(model => {
                this.allCategories = model;
                this.categoryData = this.allCategories.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.categoryData);
                this.gridOptions.api.sizeColumnsToFit();
            });
    }
    
    private editCategory(){
        
        this.isCatgeoryDuplicate = false;
        for(var i = 0 ; i < this.allCategories.length ; i ++){
            var category = this.allCategories[i];
            
            if(category.id == this.selectedCategoryId){
                this.category = Object.assign({}, category);
                break;
            }
        }
            
        this.isEditCategory = true;
        
    }
   
    private saveCategory(form){
        
       
       this.submitCategory = true;
        if(form.valid){
            this.responseToObject<ICategory>(this._securityService.saveCategory(this.category))
            .subscribe(model => {
               
                this.allCategories.push(model);
                this.categoryData = this.allCategories.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.categoryData);
                this.resetForm(form);
            },
            err => {
                this.isCatgeoryDuplicate = true;
                this.categoryDuplicateMessage = err.message;
            }
            );
            
           
        }
        
    }
    
    private updateCategory(form){
        
        this.submitCategory = true;
        if(form.valid){
            this.responseToObject<ICategory>(this._securityService.updateCategory(this.category))
            .subscribe(model => {
                
                this.allCategories.forEach(category => {
                    if(category.id == model.id){
                        category.name = model.name;
                        category.color = model.color;
                        return true;
                    }
                });
                
                this.categoryData = this.allCategories.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.categoryData);
                this.resetForm(form);
            },
            err => {
                this.isCatgeoryDuplicate = true;
                this.categoryDuplicateMessage = err.message;
                }
            );
        }
        
    }
    
    private deleteCategory(){
        
        this.responseToObject<ICategory>(this._securityService.deleteCategory(this.selectedCategoryId))
            .subscribe(model => {
                
                this.allCategories.forEach(category => {
                    if(category.id == this.selectedCategoryId){
                        category.isDeleted = 1;
                        return true;
                    }
                });
                
                this.categoryData = this.allCategories.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.categoryData);
                this.displayConfirm = false;
                
        },
        err =>{
            this.allCategories.forEach(category => {
                    if(category.id == this.selectedCategoryId){
                        this.selectedCategoryName = category.name;
                        return true;
                    }
            });
            this.displayConfirm = false;
            this.isAssetDeleteError = true;
        });
    }
    
    private resetForm(form){
        this.category = <ICategory>{color:'#96e499', name:''};
        this.submitCategory = false;
        this.isEditCategory = false;
        this.isCatgeoryDuplicate = false;
        form._pristine = true;
    }
    
    
    private createColumnDefs() {
        
       this.columnDefs = [
            <ColDef>{headerName: "Category Id" , width: 150, headerTooltip: 'Category Id', suppressMenu: true,suppressSorting: true,field: 'id'},
            <ColDef>{headerName: "Category Name" , width: 150, headerTooltip: 'Category Name', suppressMenu: true,suppressSorting: true, field: 'name'},
            <ColDef>{headerName: "Category Color" , width: 150, headerTooltip: 'Category Color', suppressMenu: true,suppressSorting: true,field:'color',
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
                     cellRenderer: this.editCellRenderer, cellClass: 'text-center '},
            <ColDef>{headerName: "Delete" , width: 50, headerTooltip: 'Delete', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center '}
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
            
            // if (targetElement.innerText === "Delete") {
            //     this.displayConfirm = true;
            //     this.selectedCategoryId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
            // }
            
            if (targetElement.title === "Delete") {
                this.selectedCategoryId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.displayConfirm = true;
           }
            
            if (targetElement.title === "Edit") {
                this.selectedCategoryId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
                this.editCategory();
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