import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { BaseComponent } from '../../../../core/base.component';
import { StrategistService } from '../../../../services/strategist.service';
import { IStrategist } from '../../../../models/strategist';
import { Observable, Observer } from 'rxjs/Rx';

import { ISavedView, IExitWarning, SavedViewComponent } from '../../../../shared/savedviews/savedview.component';
import { IView, IViews } from '../../../../models/views';
import { ITabNav } from '../../shared/strategist.tabnav.component';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';


@Component({
    selector: 'community-strategist-view',
    templateUrl: './app/components/administrator/strategist/view/strategist.view.component.html'
    
})
export class StrategistViewComponent extends BaseComponent {
    
    private tabsModel: ITabNav = <ITabNav>{};
    private columnDefs: ColDef[];
    private gridOptions: GridOptions;
    private strategistList : IStrategist[];
    private displayConfirm: boolean = false;
    private selectedStrategistId: number;
    private selectedStrategists: number[] = [];
    private savedView: ISavedView = <ISavedView>{};
    private gridContext = {isGridModified: false, isSuperAdminRole : false};
    private setFilter: boolean = false;
    private displayDeleteErrorMessage: boolean = false;
    private deletedStrategistCount: number;
    private selectedStrategistCount: number;
    private isSuperAdmin : boolean;
    
    @Output() navigateToStrategistDetail = new EventEmitter();
    @Output() selectStrategist = new EventEmitter();
    
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;
    
    constructor(private _strategistService : StrategistService, private _router : Router){
        super();        
        this.isSuperAdmin = (this.roleTypeId == RoleType.SuperAdmin);

    }
    
    ngOnInit(){
            this.tabsModel.action = 'L';
            this.gridOptions = <GridOptions>{
                enableColResize: true
            }
            this.createColumnDefs();
            this.savedView = <ISavedView>{
                parentColumnDefs: this.columnDefs,
                parentGridOptions: this.gridOptions,
                exitWarning: <IExitWarning>{}
            };
            //this.getStrategistList();
            
    }
    
    private getStrategistList(){
        this.ResponseToObjects<IStrategist>(this._strategistService.getStrategistList())
            .subscribe(strategistList => {
                this.strategistList = strategistList;
                this.gridOptions.api.sizeColumnsToFit();
                this.setFilter = true;
            });
            
    }
    
    
    private addNewStrategist(){
        this._router.navigate(['/community/administrator/strategist/add']);
    }
    
    
    // private deleteStrategist(){
    //     this.responseToObject<IStrategist>(this._strategistService.deleteStrategist())
    //         .subscribe(model => {  
    //            for(var i = 0 ; i < this.strategistList.length ; i++){
    //                if(this.selectedStrategistId == this.strategistList[i].id){
    //                    this.strategistList.splice(i,1);
    //                    break;
    //                }
    //            }
                
    //            this.gridOptions.api.setRowData(this.strategistList);
    //            this.displayConfirm = false;
    //     },
    //     err =>{
    //         this.displayConfirm = false;
    //     });
    // }
    
    deleteStrategists() {
        this.deletedStrategistCount = 0;
        let apiArray = [];
        if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1) {
            this.selectedStrategistCount = this.tabsModel.ids.length;
            this.tabsModel.ids.forEach(strategistId => {
                this.responseToObject<any>(this._strategistService.deleteStrategist(strategistId))
                    .subscribe(response => {
                        this.displayConfirm = false;
                        this.strategistList = this.strategistList.filter(record => record.id != strategistId);
                        this.deletedStrategistCount += 1;
                    },
                    error => {
                    });
            });
            this.refreshStrategistList();
            this.displayDeleteErrorMessage = true;
        }
        else {
            this.responseToObject<any>(this._strategistService.deleteStrategist(this.tabsModel.id))
                .subscribe(response => {
                    this.strategistList = this.strategistList.filter(record => record.id != this.tabsModel.id);
                    this.refreshStrategistList();
                    this.displayConfirm = false;
                });
        }
    }
    
    private refreshStrategistList(){
        this.tabsModel.id = undefined;
        this.tabsModel.ids = [];
        //this.getStrategistList();
    }
    
    
    
    
    private selectRows(event){
        
        var selectedRows = this.gridOptions.api.getSelectedRows();
        this.tabsModel.ids = [];
        selectedRows.forEach(selectedRow => {
            this.tabsModel.ids.push(selectedRow.id);
        });
        if(this.tabsModel.ids.length == 1){
            this.tabsModel.id = this.tabsModel.ids[0];
        }
        // this.selectStrategist.emit(this.selectedStrategists);
    }
    
    private onRowDoubleClicked(event){
        this._router.navigate(['/community/administrator/strategist/view', event.data.id]); 
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
            // <ColDef>{ headerName: "Status",cellClass: 'text-center',  field: 'status',  cellRenderer: this.statusFilterRenderer  },
            <ColDef>{headerName: "Created On" ,  headerTooltip: 'Edited On', field: 'createdOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Created By" ,  headerTooltip: 'Created By', field: 'createdBy'},
            <ColDef>{headerName: "Edited On" ,  headerTooltip: 'Edited On', field: 'editedOn',
                     cellRenderer: this.dateRenderer
                    },
            <ColDef>{headerName: "Edited By" ,  headerTooltip: 'Edited By', field: 'editedBy'},
			<ColDef>{headerName: "Status" ,  headerTooltip: 'Status', field: 'status'}
        ];
    }
    
    /* method to display context menu on agGrid */
    private getContextMenuItems(params) {        
        let result = [];
            result.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' }); 
            result.push({ name: '<hidden id=' + params.node.data.id + '>Edit</hidden>' });
            if(params.context.isSuperAdminRole){
                result.push({name: '<hidden id=' + params.node.data.id + '>Delete</hidden>' });
            }                
        return result;
    }
    
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.innerText === "Delete") {
                    this.selectedStrategistId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this.tabsModel.id = this.selectedStrategistId;
                    this.displayConfirm = true;
            }
            if (targetElement.innerText === "View Details") {
                    this.selectedStrategistId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/community/administrator/strategist/view', this.selectedStrategistId]);
            }
            if (targetElement.innerText === "Edit") {
                    this.selectedStrategistId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/community/administrator/strategist/edit', this.selectedStrategistId]);
            }
            
        }
        
    }
    
    /** Calls on model update */
    private onModelUpdated() {
        if (this.setFilter) {
            this.setFilter = false;
            this.gridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
            this.gridContext.isSuperAdminRole = this.isSuperAdmin ;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        if (this.gridOptions.context != undefined) {
            if (!this.gridOptions.context.isGridModified) return Observable.of(true);
        }
        if (this.savedViewComponent.loggedInUserViewsCount > 0)
            this.savedViewComponent.displayUpdateConfirmDialog = true;
        else
            this.savedView.exitWarning.show = true;
        return new Observable<boolean>((sender: Observer<boolean>) => {
            this.savedView.exitWarning.observer = sender;
        });
    }

    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            let contextParams = params.api.context.contextParams.seed;
            contextParams.gridOptions.context.isSuperAdminRole = this.isSuperAdmin;
            this.gridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }
    
    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Delete":
                if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
                    this.displayConfirm = true;
                else
                    this.displayConfirm = true;
                break;
            default:
        }
        return;
    }
    
}