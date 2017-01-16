import { Component , HostListener, Output, EventEmitter} from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators, DatePipe } from '@angular/common';
import { Http, Response, Headers } from '@angular/http';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { SecuritySetService } from '../../../../services/securityset.service';
import { ISecuritySet } from '../../../../models/securitySet';


@Component({
    selector: 'eclipse-securityset-view',
    templateUrl: './app/components/security/securitysetmaintenance/view/securityset.view.component.html',
    providers: [SecurityService, SecuritySetService],
    directives: [AgGridNg2, FORM_DIRECTIVES, Dialog, Button]
})
export class SecuritySetViewComponent extends BaseComponent{
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allSecuritySets : ISecuritySet[];
    private securitySetData: ISecuritySet[];
    private displayConfirm: boolean = false;
    private selectedRow: any;
    private selectedSecuritySetId: number;
    @Output() editSecurity = new EventEmitter();
    @Output() setSelectedSecuritySet = new EventEmitter();
    
    
    constructor(private _securityService: SecurityService , private _securitySetService: SecuritySetService) {
        super();
        
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        
        
        this.createColumnDefs();
        
        
    }
    
    ngOnInit(){
        this.getSecuritySets();
        this.setSelectedSecuritySet.emit(undefined);
    }
    
    
     getSecuritySets(){
        this.ResponseToObjects<ISecuritySet>(this._securitySetService.getSecuritySetData())
            .subscribe(model => {
                this.allSecuritySets = model;
                this.securitySetData = this.allSecuritySets.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.securitySetData);
                
            });
    }
    
   
    deleteSecuritySet(){
        this.responseToObject<ISecuritySet>(this._securitySetService.deleteSecuritySet(this.selectedSecuritySetId))
            .subscribe(model => {
                
                this.allSecuritySets.forEach(securitySet => {
                    if(securitySet.id == this.selectedSecuritySetId){
                        securitySet.isDeleted = 1;
                        return true;
                    }
                });
                
                this.securitySetData = this.allSecuritySets.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.securitySetData);
                this.displayConfirm = false;
                this.setSelectedSecuritySet.emit(undefined);
        });
    }
   
    addNewSecuritySet(){
        this.editSecurity.emit({ id: 0 , isDetailEditMode: true, isCopyMode: false});
    }
    
    
    private rowSelected(event){
        
       this.selectedRow = event;
       this.setSelectedSecuritySet.emit(event.data.id);
    }
    
    performDeleteAction(id){
        this.displayConfirm = true;
        this.selectedSecuritySetId = id;
    }
    
    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            
            <ColDef>{headerName: "ID" , width: 150, headerTooltip: 'ID',field: 'id'},
            <ColDef>{headerName: "Name" , width: 150, headerTooltip: 'Name', field: 'name'},
            <ColDef>{headerName: "Description" , width: 150, headerTooltip: 'Description', field: 'description'},
            <ColDef>{headerName: "Created On" , width: 150, headerTooltip: 'Created On', field: 'createdOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Created By" , width: 150, headerTooltip: 'Created By', field: 'createdBy'},
            <ColDef>{headerName: "Edited On" , width: 150, headerTooltip: 'Edited On', field: 'editedOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Edited By" , width: 150, headerTooltip: 'Edited By', field: 'editedBy'}
        ];
    }
    
     /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.innerText === "Delete") {
                    this.displayConfirm = true;
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
            }
            if (targetElement.innerText === "View Detail") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this.editSecurity.emit({ id: this.selectedSecuritySetId , isDetailEditMode: false , isCopyMode: false});
            }
            if (targetElement.innerText === "Edit") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this.editSecurity.emit({ id: this.selectedSecuritySetId, isDetailEditMode: true, isCopyMode: false});
            }
            if (targetElement.innerText === "Copy") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this.editSecurity.emit({ id: this.selectedSecuritySetId, isDetailEditMode: true, isCopyMode: true});
             }
        }
        
    }
    
    private getContextMenuItems(params) {
        
       var result = [
             {
                name: '<hidden id =' + params.node.data.id + '>Edit</hidden>',
                
            },
            {
                name: '<hidden id =' + params.node.data.id + '>View Detail</hidden>',
                
            },
            {
                name: '<hidden id =' + params.node.data.id + '>Copy</hidden>',
                
            }
           
           
        ];
        if(params.node.data.isModelAssigned == 0){
            result.push( {
                name: '<hidden id =' + params.node.data.id + '>Delete</hidden>',
             });
        }
        return result;
    }
}