import { Component , HostListener, OnDestroy , Output , EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http'
import * as Util from '../../../../core/functions';
import {GridOptions, ColDef} from 'ag-grid/main';
import { IRolePrivilege } from '../../../../models/user.models';
import 'ag-grid-enterprise/main';


import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { ISecurity } from '../../../../models/security';
import { ICategory } from '../../../../models/category';
import { IClass } from '../../../../models/class';
import { ISubClass } from '../../../../models/subClass';
import { ITabNav } from '../shared/security.tabnav.component';
import { ICorporateActions, IAddCorporateAction } from '../../../../models/security';




@Component({
    selector: 'eclipse-security-view',
    templateUrl: './app/components/security/securitymaintenance/view/security.view.component.html'
})
export class SecurityViewComponent extends BaseComponent implements OnDestroy{
    
    private tabsModel: ITabNav = <ITabNav>{};
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private allSecurities : ISecurity[];
    private securityData: ISecurity[];
    private categories: ICategory[] = [];
    private securityStatus: string[];
    private classes: IClass[] = [];
    private subClasses: ISubClass[] = [];
    private selectedSecurity: any;
    private filteredSecurityResult: ISecurity[];
    private btnDisableSecurity: boolean = true;
    private displayConfirm: boolean = false;
    private assetList : any[] = [];
    private selectedSecurityId;
    private selectedRow: any;
    private masterSecurityList: ISecurity[] = [];
    
    private isSecurityDeleteError: boolean = false;
    private selectedSecurityName: string;
    
    private saveError: boolean =  false;
    private errorMessage: string = '';

       //Corporate Actions popup
    corpActionTypes: any[] = [];
    showCorporateActions: boolean = false;
    private corporateGridOptions: GridOptions;
    private corporateColumnDefs: ColDef[];
    corporateActions: any[] = [];
    selectedTicker: any;
    disableButton: boolean = true;
    corpoaretActionObj: IAddCorporateAction = <IAddCorporateAction>{};
    
    

    /** Set grid context params  */
    gridContext = {
        from: this.corpoaretActionObj.from,
        to: this.corpoaretActionObj.to
    }
    //end 

    private permissionToEditSecurityPrice: IRolePrivilege;
    
    @Output() viewSecurityDetail = new EventEmitter();
    @Output() setSelectedSecurity = new EventEmitter();
    
    constructor(private _securityService: SecurityService, private _router : Router) {
        super(PRIV_SECURITIES);
        this.permissionToEditSecurityPrice = this.getPermission(PRIV_ALLOW_EDIT_ON_SECURITY_PRICE);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        this.corporateGridOptions = <GridOptions>{};        
        this.createColumnDefs();
        this.createCorporateActionsColumnDefs();
        
        
    }
    
    ngOnInit(){
        
        this.displaySecurityList();
        //this.setSelectedSecurity.emit(undefined);
        
    }
    
    displaySecurityList(){
        
        Observable.forkJoin(
           this._securityService.getCategoryData().map((response: Response) => response.json()),
           this._securityService.getClassData().map((response: Response) => response.json()),
           this._securityService.getSubClassData().map((response: Response) => response.json()),
           this._securityService.getSecurityStatusList().map((response: Response) => response.json())
        ).subscribe(data => {
           this.getSecurities();
           this.categories = data[0];
           this.classes = data[1];
           this.subClasses = data[2];
           this.securityStatus = data[3];
           
        });
    }
    
    ngOnDestroy() {
        console.log("destroyed");
    }
    
    private getSecurities(){
        this.ResponseToObjects<ISecurity>(this._securityService.getSecurityData())
            .subscribe(model => {
                
                this.allSecurities = model;
                this.securityData =  this.allSecurities.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.securityData);
                this.gridOptions.api.sizeColumnsToFit();
               
            });
    }
    
    private getSecurityDetail(id){
       
       if(id != "0"){
            this.responseToObject<ISecurity>(this._securityService.getSecurityDetail(id))
            .subscribe(model => {
                
                for(var i = 0 ; i < this.securityData.length ; i++){
                    var security = this.securityData[i];
                    if(security.id == id){
                        this.securityData[i] = model;
                        break;
                    }
                }
                
                this.gridOptions.api.setRowData(this.securityData);
                
            });
       }
      
    }
    
   
    
   autoSecuritySearch(event) {       
        this._securityService.searchSecurity(event.query)
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                this.filteredSecurityResult = [];
                for(var i = 0 ; i < securitiesResult.length ; i++){
                    var security = securitiesResult[i];
                    var found = false;
                    for(var j = 0 ; j < this.securityData.length ; j++){
                        if(security.orionConnectExternalId == this.securityData[j].orionConnectExternalId){
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        this.filteredSecurityResult.push(security);
                    }
                }
            });
    }
    
    handleSelectedSecurity(security) {
        if (security.name) {
            this.btnDisableSecurity = false;
        }
        else
        this.btnDisableSecurity = true;
    }
    
    addSecurity(security){
        this.saveError = false;
        this.responseToObject<ISecurity>(this._securityService.saveSecurity(security.orionConnectExternalId))
            .subscribe(model => {
               this.allSecurities.push(model);
               this.refreshCategoryList(model);
               this.refreshClassList(model);
               this.refreshSubClassList(model);
               this.securityData = this.allSecurities.filter( a => a.isDeleted == 0);
               this.gridOptions.api.setRowData(this.securityData);
               this.selectedSecurity = undefined;
               this.btnDisableSecurity = true;
         },
         err =>{
             this.saveError = true;
             this.errorMessage = err.message;
             this.selectedSecurity = undefined;
             this.btnDisableSecurity = true;
         });
        
    }
    
    refreshCategoryList(newSecurity){
        var found = false;
        for(var i = 0 ; i < this.categories.length ; i++){
            if(this.categories[i].id == newSecurity.assetCategoryId){
                found = true;
                break;
            }
        }
        if(!found){
            var category = <ICategory>{};
            category.id = newSecurity.assetCategoryId;
            category.name = newSecurity.assetCategory;
            this.categories.push(category);
        }
    }
    
    refreshClassList(newSecurity){
        var found = false;
        for(var i = 0 ; i < this.classes.length ; i++){
            if(this.classes[i].id == newSecurity.assetClassId){
                found = true;
                break;
            }
        }
        if(!found){
            var newClass = <IClass>{};
            newClass.id = newSecurity.assetClassId;
            newClass.name = newSecurity.assetClass;
            this.classes.push(newClass);
        }
    }
    
    refreshSubClassList(newSecurity){
        var found = false;
        for(var i = 0 ; i < this.subClasses.length ; i++){
            if(this.subClasses[i].id == newSecurity.assetSubClassId){
                found = true;
                break;
            }
        }
        if(!found){
            var newSubClass = <ISubClass>{};
            newSubClass.id = newSecurity.assetSubClassId;
            newSubClass.name = newSecurity.assetSubClass;
            this.subClasses.push(newSubClass);
        }
    }
    
    deleteSecurity(){
        this.responseToObject<ISecurity>(this._securityService.deleteSecurity(this.selectedSecurityId))
            .subscribe(model => {
                
                this.allSecurities.forEach(security => {
                    if(security.id == this.selectedSecurityId){
                        security.isDeleted = 1;
                        return true;
                    }
                });
                
                this.securityData = this.allSecurities.filter(a => a.isDeleted == 0);
                this.gridOptions.api.setRowData(this.securityData);
                this.displayConfirm = false;
                //this.setSelectedSecurity.emit(undefined);
                this.tabsModel.id = undefined;
        },
        err =>{
            this.allSecurities.forEach(security => {
                    if(security.id == this.selectedSecurityId){
                        this.selectedSecurityName = security.name;
                        return true;
                    }
            });
            this.displayConfirm = false;
            this.isSecurityDeleteError = true;
        });
    }
    
    performDeleteAction(id){
        this.displayConfirm = true;
        this.selectedSecurityId = id;
    }
    
    
    private classificationEditor(params, self) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : params.value);
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
           
            var list ;

            if(params.colDef.field == "assetCategory"){
                list = self.categories;
               
            }else if (params.colDef.field == "assetClass"){
                list = self.classes;
            }else{
                list = self.subClasses;
            }
            
            if(list != undefined){
                list.forEach(function(item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.id);
                    eOption.innerHTML = item.name;
                    eSelect.appendChild(eOption);
                });
            }
            
            
            eSelect.value = params.data[params.colDef.field + 'Id'] ;

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
                    params.data[params.colDef.field+"Id"] = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    self.updateSecurity(params.data);
                }
            });

            return eCell;

    }
    
    private statusEditor(params, self) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : params.value);
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
           
            var list ;

            list = self.securityStatus;
            
            if(list != undefined){
                list.forEach(function(item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item);
                    eOption.innerHTML = item;
                    eSelect.appendChild(eOption);
                });
            }
            
            
            eSelect.value = params.data[params.colDef.field] ;

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
                    var newValue = eSelect.value == undefined ? '' : eSelect.value;
                    params.data[params.colDef.field] = newValue;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    self.updateSecurity(params.data);
                }
            });

            return eCell;

    }
    
     private custodialCashEditor(params, self) {
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : (params.value == 0 ? 'No' : 'Yes'));
            
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
           
            var list ;

            var eOption = document.createElement("option");
            eOption.setAttribute("value", '0');
            eOption.innerHTML = 'No';
            eSelect.appendChild(eOption);
            
            var eOption = document.createElement("option");
            eOption.setAttribute("value", '1');
            eOption.innerHTML = 'Yes';
            eSelect.appendChild(eOption);
            
           eSelect.value = params.data[params.colDef.field] ;

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
                    params.data[params.colDef.field] = eSelect.value;
                    //params.data[params.colDef.field+"Id"] = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    self.updateSecurity(params.data);
                }
            });

            return eCell;

    }
    
    private securitySymbolEditor(params, self){
        if (params.newValue == '' || params.newValue == undefined || params.newValue == params.oldValue) {
            //window.alert("Invalid value " + params.newValue + ", must be a number");
        } else {
            params.data[params.colDef.field] = params.newValue;
             self.updateSecurity(params.data);
        }

    }
    
    private securityPriceEditor(params, self){
        var valueAsNumber = parseInt(params.newValue);
        if (isNaN(params.newValue)) {
            //window.alert("Invalid value " + params.newValue + ", must be a number");
        } else {
            params.data[params.colDef.field] = valueAsNumber;
            self.updateSecurity(params.data);
        }
    }
    
    
    
    private rowSelected(event){
     
        this.tabsModel.id = event.data.id;
        //this.setSelectedSecurity.emit(event.data.id);
        if(this.selectedRow == undefined){
            this.selectedRow = event;
        }else if(event.rowIndex != this.selectedRow.rowIndex){
            
            if(this.selectedRow.data.isEdited){
                 var security = this.selectedRow.data;
                 this.saveError = false;
                 if(this.validateSecurity(security)){
                    this.responseToObject<ISecurity>(this._securityService.updateSecurity(this.selectedRow.data))
                        .subscribe(model => {
                        security.isEdited = false;
                    },
                    err =>{
                        this.saveError = true;
                        this.errorMessage = err.message;
                        this.getSecurityDetail(security.id);
                    });
                 }else{
                     this.saveError = true;
                 }
            }
            
            this.selectedRow = event;
        }
       
    }
    
    private validateSecurity(security){
        
        var errorCount = 0;
        var msg = "Security - "+security.id+" can not be saved. Please enter ";
        if(security.symbol == undefined || security.symbol.length == 0){
            msg = msg + "Symbol";
            errorCount = errorCount + 1;
        }
        if(security.assetCategoryId == undefined){
            msg = msg + (errorCount == 0 ? "" : ",");
            msg = msg + " Catgeory";
            errorCount = errorCount + 1;
        }
        if(security.assetClassId == undefined){
            msg = msg + (errorCount == 0 ? "" : ",");
            msg = msg + " Class";
            errorCount = errorCount + 1;
        }
        if(security.assetSubClassId == undefined){
            msg = msg + (errorCount == 0 ? "" : ",");
            msg = msg + " Sub-Class";
            errorCount = errorCount + 1;
        }
        if(security.status == undefined){
            msg = msg + (errorCount == 0 ? "" : ",");
            msg = msg + " Status";
            errorCount = errorCount + 1;
        }
        if(security.price == undefined || security.price == null || isNaN(parseFloat(security.price))){
            msg = msg + (errorCount == 0 ? "" : ",");
            msg = msg + " Price";
            errorCount = errorCount + 1;
        }
        errorCount > 0 ? this.errorMessage = msg+"." : '';
        return errorCount > 0 ? false : true;
    }
    
    private updateSecurity(security){
        security.isEdited = true;
    }
    
    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            
            <ColDef>{
                headerName: "Details",cellClass: 'text-center',
                children: [
                         <ColDef>{headerName: "Name", field: "name", width: 90, cellClass: 'text-center', headerTooltip: 'Name', filter:'text', 
                         },
                         <ColDef>{headerName: "Id", field: "id", width: 90, cellClass: 'text-center', headerTooltip: 'Id', filter:'number',
                         },
                         <ColDef>{headerName: "Type", field: "securityType", width: 90, cellClass: 'text-center', headerTooltip: 'Type', filter:'text',
                         },
                         <ColDef>{headerName: "Symbol", field: "symbol", width: 90, cellClass: 'text-center', headerTooltip: 'Symbol', filter:'text',
                                 editable: true, 
                                 newValueHandler: function(params){
                                     return self.securitySymbolEditor(params , self);
                                 }
                         }
                ]
            },
            <ColDef>{
                headerName: "Classification",cellClass: 'text-center',
                children: [
                          <ColDef>{headerName: "Category", field: "assetCategory", width: 90, cellClass: 'text-center', headerTooltip: 'Category',  filter:'text',
                                   cellRenderer: function(params) {
                                      return self.classificationEditor(params, self);
                                  }
                         },
                         <ColDef>{headerName: "Class", field: "assetClass", width: 90, cellClass: 'text-center', headerTooltip: 'Class', filter:'text',
                                 cellRenderer: function(params) {
                                      return self.classificationEditor(params, self);
                                  }
                          },
                         <ColDef>{headerName: "Sub-Class", field: "assetSubClass", width: 90, cellClass: 'text-center', headerTooltip: 'Sub-Class',filter:'text',
                                 cellRenderer: function(params) {
                                      return self.classificationEditor(params, self);
                                  }
                         },
                         <ColDef>{headerName: "Sub-Class Id", field: "assetSubClassId", width: 90, cellClass: 'text-center', headerTooltip: 'Sub-Class Id',filter:'number',
                                 suppressMenu: true,suppressSorting: true, hide: true
                         },
                         <ColDef>{headerName: "Class Id", field: "assetClassId", width: 90, cellClass: 'text-center', headerTooltip: 'Class Id', filter:'number',
                                 suppressMenu: true,suppressSorting: true, hide: true
                         },
                         <ColDef>{headerName: "Category Id", field: "assetCategoryId", width: 90, cellClass: 'text-center', headerTooltip: 'Category Id', filter:'number',
                                 suppressMenu: true,suppressSorting: true, hide: true
                         }
                ]
           },
           <ColDef>{
                headerName: "Status",cellStyle:{ text : 'center'}, 
                children: [
                          <ColDef>{headerName: "Status", field: "status", width: 90, cellClass: 'text-center', headerTooltip: 'Status', filter:'text',
                                   cellRenderer: function(params) {
                                      return self.statusEditor(params, self);
                                   }  
                         }
                ]
            },
            <ColDef>{
                headerName: "Price",cellStyle:{ text : 'center'}, 
                children: [
                          <ColDef>{headerName: "Price", field: "price", width: 90, cellClass: 'text-center', headerTooltip: 'Price', filter:'number',
                                   cellRenderer: function(params){
                                     return self.numberEditor(params , self);
                                   }  
                         }
                ]
            },
            <ColDef>{
                headerName: "",cellStyle:{ text : 'center'}, 
                children: [
                         <ColDef>{headerName: "Custodial Cash", field: "custodialCash", width: 90, cellClass: 'text-center', headerTooltip: 'Custodial Cash', filter:'text',
                                   cellRenderer: function(params) {
                                      return self.custodialCashEditor(params, self);
                                   }
                                  
                         }
                ]
            },
            <ColDef>{
                headerName: "Creation Date",cellStyle:{ text : 'center'}, hide: true, sort: 'desc', field:'createdOn', filter:'text' 
               
            }
        ];
    }
    
     /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.id != "") {
            
            if (targetElement.innerText === "Delete") {
                    this.displayConfirm = true;
                    this.selectedSecurityId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
            }
            
            if (targetElement.innerText === "View Details") {
                    this.selectedSecurityId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/eclipse/security/maintenance/view', this.selectedSecurityId]);
            }
            
            if (targetElement.innerText === "Edit") {
                    this.selectedSecurityId = Number(targetElement.outerHTML.split("<hidden id=")[1].split(">")[0].split(" ")[0].replace(/['"]+/g, '').toString());
                    this._router.navigate(['/eclipse/security/maintenance/edit', this.selectedSecurityId]);
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
       if(permission.canDelete)
           result.push({ name: '<hidden id =' + params.node.data.id + '>Delete</hidden>' });
       
       return result;
    }
    
    private numberEditor(params, self) {
       
       if(this.permissionToEditSecurityPrice != null && this.permissionToEditSecurityPrice.canRead){     
        var eInput = document.createElement("input");
            
        eInput.className = "form-control grid-input";
                
                
        eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
                
        eInput.addEventListener('blur', function (event) {
            
            params.data[params.colDef.field] = params.data[params.colDef.field] == null ? '' : params.data[params.colDef.field];
            if(params.data[params.colDef.field] != eInput.value){
               params.data[params.colDef.field] = isNaN(parseFloat(eInput.value)) ? '' : parseFloat(eInput.value);
               self.updateSecurity(params.data);
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
       }else{
             return self.labelRenderer(params , self , 
             params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field]);
       }   
            

    }
    
    private labelRenderer(params , self , text){
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eLabel = document.createTextNode(text == undefined ? '' : text);
        eCell.appendChild(eLabel);
        return eCell;
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
                
             case "corporate": {
                this.showCorporateActions = true;
                this.getCorporateActyonTypes();
                this.getCorporateActions();
            }

            default:
        }
        return;
    }

    

    /** Create column headers for agGrid */
    private createCorporateActionsColumnDefs() {
        this.corporateColumnDefs = [
            <ColDef>{ headerName: "#", field: "id", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Corp Action Type", field: "corpActionType", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Dyn. Share Allocation", field: "", width: 125, cellClass: 'text-center', cellRenderer: this.shareRenderer },
            <ColDef>{ headerName: "Spin-Off Ticker", field: "spinoff", width: 110, cellClass: 'text-center' },

        ];
    }
    shareRenderer(params) {
        let contextParams = params.api.context.contextParams.seed;
        if (params.data.id == undefined) {
            if (contextParams.gridOptions.context.from != undefined && contextParams.gridOptions.context.to != undefined)
                return contextParams.gridOptions.context.from + ":" + contextParams.gridOptions.context.to;
            else
                return null;
        }
        else
            return null;
    }

    getCorporateActions() {       
        this.corporateActions = this._securityService.getCorporateActions();

    }
    addCorporateAction() {
        this.gridContext.from = this.corpoaretActionObj.from;
        this.gridContext.to = this.corpoaretActionObj.to;
        if (this.corpoaretActionObj.corpActionType == "Spin-Off")
            this.corpoaretActionObj.spinoff = this.selectedTicker.name;
        this.corporateActions.push(this.corpoaretActionObj);
        this.corporateGridOptions.api.setRowData(this.corporateActions);
        this.corpoaretActionObj = <IAddCorporateAction>{};
        this.selectedTicker = '';

    }

    onActionTypeChange(event) {
        if (event == "Stock Split" || event == "Spin-Off") {
            this.corpoaretActionObj.from = 2;
            this.corpoaretActionObj.to = 1;
            this.gridContext.from = this.corpoaretActionObj.from;
            this.gridContext.to = this.corpoaretActionObj.to;
        }

        else if (event == "Reverse Split") {
            this.corpoaretActionObj.from = 1;
            this.corpoaretActionObj.to = 2;
            this.gridContext.from = this.corpoaretActionObj.from;
            this.gridContext.to = this.corpoaretActionObj.to;
        }

        if (this.corpoaretActionObj.from != undefined && this.corpoaretActionObj.to != undefined  && event !="Select")
            this.disableButton = false;

        else
            this.disableButton = true;

    }
    closeCorporateActions() {
        this.showCorporateActions = false;

    }

    getCorporateActyonTypes() {
        this.corpActionTypes.push(           
            { id: 1, value: 1, name: "Stock Split" },
            { id: 2, value: 2, name: "Reverse Split" },
            { id: 3, value: 3, name: "Spin-Off" }

        );
        return this.corpActionTypes;
    }

    handleSelectedTicker(ticker) {

        this.selectedTicker = ticker.name;

    }
    validate() {
        if ((this.corpoaretActionObj.from != undefined && this.corpoaretActionObj.from > 0 && this.corpoaretActionObj.from !="")&& (this.corpoaretActionObj.to != undefined && this.corpoaretActionObj.to > 0 && this.corpoaretActionObj.to !="") && this.corpoaretActionObj.corpActionType!=undefined)
            this.disableButton = false;
        else
            this.disableButton = true;
    }
}