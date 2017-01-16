import { Component , HostListener, Output, EventEmitter} from '@angular/core';
import * as Util from '../../../../core/functions';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { SecuritySetService } from '../../../../services/securityset.service';
import { ISecuritySet } from '../../../../models/securitySet';
import { ITabNav } from '../shared/securityset.tabnav.component';


@Component({
    selector: 'eclipse-securityset-view',
    templateUrl: './app/components/security/securitysetmaintenance/view/securityset.view.component.html'
})
export class SecuritySetViewComponent extends BaseComponent{
    
    private tabsModel: ITabNav = <ITabNav>{};
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allSecuritySets : ISecuritySet[];
    private securitySetData: ISecuritySet[];
    private displayConfirm: boolean = false;
    private selectedRow: any;
    private selectedSecuritySetId: number;
    @Output() editSecurity = new EventEmitter();
    @Output() setSelectedSecuritySet = new EventEmitter();
    
    
    constructor(private _securityService: SecurityService , private _securitySetService: SecuritySetService,
                private _router : Router) {
        super(PRIV_SECURITIES);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        
        
        this.createColumnDefs();
        
        
    }
    
    ngOnInit(){
        this.getSecuritySets();
        //this.setSelectedSecuritySet.emit(undefined);
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
                //this.setSelectedSecuritySet.emit(undefined);
                this.tabsModel.id = undefined;
        });
    }
   
    addNewSecuritySet(){
        //this.editSecurity.emit({ id: 0 , isDetailEditMode: true, isCopyMode: false});
        this._router.navigate(['/eclipse/security/securitySet/add']);
    }
    
    
    private rowSelected(event){
        
       this.selectedRow = event;
       this.tabsModel.id = event.data.id;
       //this.setSelectedSecuritySet.emit(event.data.id);
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
            
            <ColDef>{headerName: "ID" , width: 150, headerTooltip: 'ID',field: 'id', filter:'number'},
            <ColDef>{headerName: "Name" , width: 150, headerTooltip: 'Name', field: 'name', filter:'text'},
            <ColDef>{headerName: "Description" , width: 150, headerTooltip: 'Description', field: 'description', filter:'text'},
            <ColDef>{headerName: "Created On" , width: 150, headerTooltip: 'Created On', field: 'createdOn', filter:'text',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Created By" , width: 150, headerTooltip: 'Created By', field: 'createdBy', filter:'text'},
            <ColDef>{headerName: "Edited On" , width: 150, headerTooltip: 'Edited On', field: 'editedOn', filter:'text',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Edited By" , width: 150, headerTooltip: 'Edited By', field: 'editedBy', filter:'text'}
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
            if (targetElement.innerText === "View Details") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    //this.editSecurity.emit({ id: this.selectedSecuritySetId , isDetailEditMode: false , isCopyMode: false});
                    this._router.navigate(['/eclipse/security/securitySet/view', this.selectedSecuritySetId]);
            }
            if (targetElement.innerText === "Edit") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    //this.editSecurity.emit({ id: this.selectedSecuritySetId, isDetailEditMode: true, isCopyMode: false});
                    this._router.navigate(['/eclipse/security/securitySet/edit', this.selectedSecuritySetId]);
            }
            if (targetElement.innerText === "Copy") {
                    this.selectedSecuritySetId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    //this.editSecurity.emit({ id: this.selectedSecuritySetId, isDetailEditMode: true, isCopyMode: true});
                    this._router.navigate(['/eclipse/security/securitySet/copy', this.selectedSecuritySetId]); 
            }
        }
        
    }
    
    private getContextMenuItems(params) {
        
       let permission = Util.getPermission(PRIV_SECURITIES);
       var result = [];
       if (permission.canRead)
           result.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' });
       if(permission.canUpdate)
           result.push({ name: '<hidden id =' + params.node.data.id + '>Edit</hidden>' });
       if(permission.canDelete && params.node.data.isModelAssigned == 0)
           result.push({ name: '<hidden id =' + params.node.data.id + '>Delete</hidden>' });
       if(permission.canAdd)
           result.push({ name: '<hidden id =' + params.node.data.id + '>Copy</hidden>' });
       return result;
    }
    
    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Delete":
                 this.displayConfirm = true;
                 this.selectedSecuritySetId = this.tabsModel.id;
                break;
            default:
        }
        return;
    }
}