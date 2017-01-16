import { Component , ViewChild, ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import { FORM_DIRECTIVES, Control, ControlGroup, Validators } from '@angular/common';
import { Http, Response, Headers } from '@angular/http';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategist } from '../../../../../models/strategist';
import { IUser } from '../../../../../models/user';
import { IStrategistStatus } from '../../../../../models/strategist.status';
import { IUserRole } from '../../../../../models/user.role';
import { StrategistService } from '../../../../../services/strategist.service';
import { CustomValidator } from '../../../../../shared/validator/CustomValidator';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';


@Component({
    selector: 'community-strategist-general-info',
    templateUrl: './app/components/administrator/strategist/detail/generalInfo/strategist.general.info.component.html',
    directives : [FORM_DIRECTIVES, AgGridNg2, AutoComplete, Dialog, Button]
})
export class StrategistGeneralInfoComponent  extends BaseComponent {
    
    private submitGeneralInfo: boolean = false;
    private btnDisableUser: boolean = true;
    private displayConfirm: boolean = false;
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private autoCompleteSelectedUser: any;
    private filteredUserResult: IUser[];
    private strategistStatus: IStrategistStatus[];
    private userRoles: IUserRole[];
    private selectedUserId;
    private strategist: IStrategist = <IStrategist>{};
    
    @Input() strategistId: number;
    
    constructor(private _strategistService : StrategistService,private _changeDetectionRef : ChangeDetectorRef){
        super();
         this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        
   }
   
   ngOnInit(){
        this.createColumnDefs();
        
        if(this.strategistId != undefined){
            this.getStrategistDetail(this.strategistId);
        }else{
            this.strategist = <IStrategist>{};
            this.strategist.userDetails = [];
        }
        
        var self = this;
        
        setTimeout(function (){
            self.getStrategistStatus();
            self.getUserRoleTypes();
            self.gridOptions.api.setRowData(self.strategist.userDetails);
            self.gridOptions.api.sizeColumnsToFit();
        },500);
        
    }
    
    
    
    autoUserSearch(event){
        this._strategistService.searchStrategistUser(event.query).map((response: Response) => <IUser[]>response.json())
            .subscribe(userResult => {
               this.filteredUserResult = userResult;
                
                if(this.strategist.userDetails != undefined){
                    this.strategist.userDetails.forEach(element => {
                        this.filteredUserResult = this.filteredUserResult.filter(record => record.id != element.id);
                    });
                }
        });
    }
    
    handleSelectedUser(user){
        
        if(user.name){
            this.btnDisableUser = false;
        }else{
            this.btnDisableUser = true;
        }
   }
    
    private getStrategistStatus(){
        this.ResponseToObjects<IStrategistStatus>(this._strategistService.getStrategistStatus())
            .subscribe(model => {
                this.strategistStatus = model;
        });
    }
    
    private getUserRoleTypes(){
        this.ResponseToObjects<IUserRole>(this._strategistService.getUserRoles())
            .subscribe(model => {
                this.userRoles = model;
        });
    }
    
    private getStrategistDetail(strategistId){
        this.responseToObject<IStrategist>(this._strategistService.getStrategistDetail(strategistId))
            .subscribe(model => {
               this.strategist = model;
               this.gridOptions.api.setRowData(this.strategist.userDetails);
               this.gridOptions.api.sizeColumnsToFit();
         });
      
    }
    
    private addUser(user){
        user.roleType = this.userRoles[0].id;
        user.roleStatus = this.userRoles[0].status;
        this.strategist.userDetails.push(user);
        this.gridOptions.api.setRowData(this.strategist.userDetails);
        this.autoCompleteSelectedUser = undefined;
        this.btnDisableUser = true;
    }
    
    private deleteUser(){
        this.strategist.userDetails = this.strategist.userDetails.filter(record => record.id != this.selectedUserId);
        this.gridOptions.api.setRowData(this.strategist.userDetails);
        this.displayConfirm = false;
    }
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        
        if (targetElement.title === "Delete User") {
            this.selectedUserId = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.displayConfirm = true;
        }
        
    }
    
    private createColumnDefs() {
       let self = this;
       
       this.columnDefs = [
            <ColDef>{headerName: "User ID" , width: 50, headerTooltip: 'User ID', suppressMenu: true,suppressSorting: true,field: 'id'},
            <ColDef>{headerName: "User Name" , width: 150, headerTooltip: 'User Name', suppressMenu: true,suppressSorting: true, field: 'name'},
            <ColDef>{headerName: "Added ON" , width: 100, headerTooltip: 'Added ON', suppressMenu: true,suppressSorting: true,field:'createdOn',
                     cellRenderer: this.dateRenderer},
            <ColDef>{headerName: "User Type/Role" , width: 100, headerTooltip: 'User Type/Role', suppressMenu: true,suppressSorting: true,field:'roleStatus',
                     cellRenderer: function (params) {
                        return self.userRoleEditor(params , self);
                     }},
            <ColDef>{headerName: "User Role Id" , width: 100, headerTooltip: 'User Role Id', suppressMenu: true,suppressSorting: true , hide : true , field: 'roleType'},
            <ColDef>{headerName: "Remove" , width: 50, headerTooltip: 'Remove', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center '}
        ];
    }
    
    private deleteCellRenderer(params) {
       
        var result = '<span>';
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete User"></i>';
            return result;
      
        
    }
    
    private userRoleEditor(params, self) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : params.value);
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
           
            var list = self.userRoles;

            
            if(list != undefined){
                list.forEach(function(item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.id);
                    eOption.innerHTML = item.status;
                    eSelect.appendChild(eOption);
                });
            }
            
            
            eSelect.value = params.data['roleType'] ;

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
                    params.data['roleType'] = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    
                }
            });

            return eCell;

    }
}