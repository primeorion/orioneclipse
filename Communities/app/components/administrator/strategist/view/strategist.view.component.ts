import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { BaseComponent } from '../../../../core/base.component';
import { StrategistService } from '../../../../services/strategist.service';
import { IStrategist } from '../../../../models/strategist';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';


@Component({
    selector: 'community-strategist-view',
    templateUrl: './app/components/administrator/strategist/view/strategist.view.component.html',
    directives: [AgGridNg2],
    providers:[StrategistService]
    
})
export class StrategistViewComponent extends BaseComponent {
    
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private viewName : string = "List";
    private strategistList : IStrategist[];
    private updatedStrategistList : IStrategist[];
    private displayConfirm: boolean = false;
    private selectStrategistId: number;
    
    @Output() setSelectedStrategist = new EventEmitter();
    
    constructor(private _strategistService : StrategistService){
        super();
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        
        this.createColumnDefs();
        
    }
    
    ngOnInit(){
            this.getStrategistList();
            
    }
    
    private getStrategistList(){
        this.ResponseToObjects<IStrategist>(this._strategistService.getStrategistList())
            .subscribe(strategistList => {
                this.strategistList = strategistList;
                this.gridOptions.api.sizeColumnsToFit();
            });
            
    }
    
    private deleteStrategist(){
        console.log("the select strategist id is"+this.selectStrategistId);
        this.responseToObject<IStrategist>(this._strategistService.deleteStrategist(this.selectStrategistId))
            .subscribe(model => {  
                this.strategistList.forEach(strategist => {
                    if(strategist.id == this.selectStrategistId){
                        strategist.isDeleted = 1;
                        return true;
                    }
                });
                
                this.updatedStrategistList = this.strategistList.filter(strategist => strategist.isDeleted == 0);
                this.gridOptions.api.setRowData(this.updatedStrategistList);
               this.displayConfirm = false;
        },
        err =>{
            this.strategistList.forEach(strategist => {
                    if(strategist.id == this.selectStrategistId){
                        return true;
                    }
            });
            this.displayConfirm = false;
        });
    }
    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            
            <ColDef>{headerName: "StrategistId" ,  headerTooltip: 'StrategistId',field: 'id'},
            <ColDef>{headerName: "Name" ,  headerTooltip: 'Name', field: 'name'},
            <ColDef>{headerName: "# of Users" ,  headerTooltip: 'No of Users', field: 'userCount'},
            <ColDef>{headerName: "# of Models" ,  headerTooltip: 'No of Models', field: 'modelCount'},
            <ColDef>{ headerName: "Status",cellClass: 'text-center',  field: 'status',  cellRenderer: this.statusFilterRenderer  },
            <ColDef>{headerName: "Created On" ,  headerTooltip: 'Edited On', field: 'createdOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Created By" ,  headerTooltip: 'Created By', field: 'createdBy'},
            <ColDef>{headerName: "Edited On" ,  headerTooltip: 'Edited On', field: 'editedOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Edited By" ,  headerTooltip: 'Edited By', field: 'editedBy'}
        ];
    }
    
    /* method to display context menu on agGrid */
    private getContextMenuItems(params) {
        let result = [];
            result.push({ name: '<hidden id=' + params.node.data.id + '>View details</hidden>' }); 
            result.push({ name: '<hidden id=' + params.node.data.id + '>Edit</hidden>' });
            result.push({name: '<hidden id=' + params.node.data.id + '>Delete</hidden>' });
        return result;
    }
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g; //<hidden id="(?<id>[0-9]+)">(.+)';
        if (!targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        let [userId = 0, deleteval = 0] = matches;
        if (targetElement.id != "") {
            this.selectStrategistId = targetElement.id;
            if (targetElement.innerText === "View details") {
                this.setSelectedStrategist.emit(this.selectStrategistId);
            }
            if (targetElement.innerText === "Edit") {
                
            }
            if (targetElement.innerText === "Delete") {
                this.displayConfirm = true;
            }
        }
    }
    
}