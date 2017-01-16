import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { Observable, Observer } from 'rxjs/Rx';
import { BaseComponent } from '../../../../core/base.component';
import { UserService } from '../../../../services/user.service';
import { IUser } from '../../../../models/user';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { ISavedView, IExitWarning, SavedViewComponent } from '../../../../shared/savedviews/savedview.component';
import { IView, IViews } from '../../../../models/views';
import { ITabNav } from '../../shared/strategist.tabnav.component';


@Component({
    selector: 'community-user-view',
    templateUrl: './app/components/administrator/user/view/user.view.component.html'
    
})
export class UserViewComponent extends BaseComponent {
    
    private tabsModel: ITabNav = <ITabNav>{};
    private columnDefs: ColDef[];
    private gridOptions: GridOptions;
    private userList : IUser[] = [];
    private displayConfirm: boolean = false;
    private selectedUserId: number;
    private selectedStrategistId : number;
    private selectedUserIds: number[] = [];
    private savedView: ISavedView = <ISavedView>{};
    private gridContext = {isGridModified: false};
    private setFilter: boolean = false;
    
    private selectedUsers: IUser[] = [];
    private selectedUser: IUser = <IUser>{};
    private displayDeleteErrorMessage: boolean = false;
    private deletedUserCount: number;
    private selectedUserCount: number;
    
    @Output() navigateToUserDetail = new EventEmitter();
    @Output() selectUsers = new EventEmitter();
    
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;
    
    constructor(private _userService : UserService, private _router: Router){
        super();
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
            
    }
    
    private getUserList(){
        this.ResponseToObjects<IUser>(this._userService.getCommunityUsers())
            .subscribe(userList => {
                this.userList = userList;
                this.gridOptions.api.sizeColumnsToFit();
                this.setFilter = true;
            });
            
    }
    
    deleteUsers() {
        this.deletedUserCount = 0;
        if (this.selectedUsers != undefined && this.selectedUsers.length > 1) {
            this.selectedUserCount = this.selectedUsers.length;
            this.selectedUsers.forEach(user => {
                this.responseToObject<any>(this._userService.deleteUser(user.id , user.strategistId))
                    .subscribe(response => {
                        this.displayConfirm = false;
                        this.userList = this.userList.filter(record => record.id != user.id);
                        this.deletedUserCount += 1;
                    },
                    error => {
                    });
            });
            this.refreshUserList();
            this.displayDeleteErrorMessage = true;
        }
        else {
            this.responseToObject<any>(this._userService.deleteUser(this.selectedUser.id , this.selectedUser.strategistId))
                .subscribe(response => {
                    this.userList = this.userList.filter(record => record.id != this.selectedUser.id);
                    this.refreshUserList();
                    this.displayConfirm = false;
                });
        }
    }
    
    private refreshUserList(){
        this.tabsModel.id = undefined;
        this.tabsModel.ids = [];
        this.selectedUsers = [];
        this.selectedUser = <IUser>{};
        //this.getStrategistList();
    }
    
    
    private addNewUser(){
        this._router.navigate(['/community/administrator/user/add']);
    }
    
    
    private deleteUser(){
        this.responseToObject<IUser>(this._userService.deleteUser(this.selectedUserId , this.selectedStrategistId))
            .subscribe(model => {  
               this.userList = this.userList.filter(record => record.id != this.selectedUserId);
                
               this.gridOptions.api.setRowData(this.userList);
               this.displayConfirm = false;
        },
        err =>{
            this.displayConfirm = false;
        });
    }
    
    
    private selectRows(event){
        
        var selectedRows = this.gridOptions.api.getSelectedRows();
        this.tabsModel.ids = [];
        selectedRows.forEach(selectedRow => {
            this.tabsModel.ids.push(selectedRow.id);
            this.selectedUsers.push(selectedRow);
        });
        if(this.tabsModel.ids.length == 1){
            this.tabsModel.id = this.tabsModel.ids[0];
            this.selectedUser = this.selectedUsers[0];
        }
    }
    
    private onRowDoubleClicked(event){
        this._router.navigate(['/community/administrator/user/view', event.data.id]);   
    }
    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            
            <ColDef>{headerName: "User ID" ,  headerTooltip: 'User ID',field: 'id'},
            <ColDef>{headerName: "Name" ,  headerTooltip: 'Name', field: 'name'},
            <ColDef>{headerName: "Role" ,  headerTooltip: 'Role', field: 'roleType'},
            <ColDef>{headerName: "Strategist Name" ,  headerTooltip: 'Strategist Name', field: 'strategistName'},
            <ColDef>{headerName: "Created On" ,  headerTooltip: 'Created On', field: 'createdOn',
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
            result.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' }); 
            result.push({ name: '<hidden id=' + params.node.data.id + '>Edit</hidden>' });
            result.push({name: '<hidden id=' + params.node.data.id + '>Delete</hidden>' });
        return result;
    }
    
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.innerText === "Delete") {
                    this.selectedUserId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this.userList.forEach(element => {
                        if(element.id == this.selectedUserId){
                            this.selectedUser = element;
                        }
                    });
                    this.displayConfirm = true;
            }
            if (targetElement.innerText === "View Details") {
                    this.selectedUserId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/community/administrator/user/view', this.selectedUserId]);
            }
            if (targetElement.innerText === "Edit") {
                    this.selectedUserId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/community/administrator/user/edit', this.selectedUserId]);
            }
            
        }
        
    }
    
    /** Calls on model update */
    private onModelUpdated() {
        if (this.setFilter) {
            this.setFilter = false;
            this.gridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
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