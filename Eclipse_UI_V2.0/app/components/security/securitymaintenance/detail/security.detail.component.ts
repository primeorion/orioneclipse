import { Component , ChangeDetectorRef , Input , Output , EventEmitter , HostListener} from '@angular/core';
import {Router , ActivatedRoute} from '@angular/router';
import * as Util from '../../../../core/functions';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers } from '@angular/http';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';

import { IRolePrivilege } from '../../../../models/user.models';
import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { CustodianService } from '../../../../services/custodian.service';
import { CustomValidator } from '../../../../shared/validator/CustomValidator'
import { ISecurity } from '../../../../models/security';
import { ICategory } from '../../../../models/category';
import { IClass } from '../../../../models/class';
import { ISubClass } from '../../../../models/subClass';
import { ICustodian } from '../../../../models/custodian';
import { ISecurityType } from '../../../../models/securityType';
import { ITabNav } from '../shared/security.tabnav.component';

@Component({
    selector: 'eclipse-security-detail',
    templateUrl: './app/components/security/securitymaintenance/detail/security.detail.component.html'
})
export class SecurityDetailComponent extends BaseComponent {
    
    private categoryData: ICategory[];
    private classData: IClass[];
    private subClassData: ISubClass[];
    private securityData: ISecurity[];
    private filteredSecurityResult: ISecurity[];
    private securityTypeData: ISecurityType[];
    private selectedSecurity:ISecurity = <ISecurity>{id: 0};
    private filteredCustodianResult: ICustodian[];
    private btnDisableCustodian: boolean = true;
    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private custodians: ICustodian[];
    private selectedCustodian: any;
    private showSecurityDetails: boolean = false;
    private invalidCustodians: boolean = false;
    private autoCompleteSelectedSecurity: any; 
    private saveError: boolean = false;
    private errorMessage: string = '';
    private tabsModel: ITabNav = <ITabNav>{};
    
    private submitSecurity: boolean = false;
    private securityStatusList: string[];
    
    private permissionToEditSecurityPrice: IRolePrivilege;
    private permissionToEditSecurityType: IRolePrivilege;
     
    private securityId: number; 
    private isEditSecurity: boolean;
    //@Output() displaySecurityList = new EventEmitter();
    //@Output() setSelectedSecurity = new EventEmitter();
    
    constructor(private _securityService: SecurityService ,
                private _cdr: ChangeDetectorRef, private _custodianService: CustodianService, 
                private _router: Router, private activateRoute : ActivatedRoute) {
        super(PRIV_SECURITIES);
        this.permissionToEditSecurityPrice = this.getPermission(PRIV_ALLOW_EDIT_ON_SECURITY_PRICE);
        this.permissionToEditSecurityType = this.getPermission(PRIV_ALLOW_EDIT_ON_SECURITY_TYPE);
        this.tabsModel = Util.convertToTabNav(this.permission);
        
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.securityId = params['id'];
                this.tabsModel.id = this.securityId;
        });
        
        if(this._router.url.indexOf('view') > -1){
            this.isEditSecurity = false;
            this.tabsModel.action = 'V'
        }
        
        if(this._router.url.indexOf('edit') > -1){
            this.isEditSecurity = true;
            this.tabsModel.action = 'E';
        }
        
        this.gridOptions = <GridOptions>{
            enableColResize: true
        };
        
        this.getCategories();
        this.getClasses();
        this.getSubClasses();
        this.getSecurities();
        this.getSecurityType();
        this.createColumnDefs();
        this.getSecurityStatusList();
    }
    
    ngOnInit(){
     
      
      this.createColumnDefs(); 
      if(this.gridOptions.api != null){
          this.gridOptions.api.setColumnDefs(this.columnDefs);
      }
      
      if(this.securityId != undefined){
          
           this.selectedSecurity.id = this.securityId;
           this.selectSecurity(this.securityId);
           
      }else{
            this.resetSecurityDetail();
            this.selectedSecurity.id = 0;
      }
       
    }
    
//     refreshView(securityId , isEditSecurity){
        
//         this.isEditSecurity = isEditSecurity;
//         this.createColumnDefs();
//         this.gridOptions.api.setColumnDefs(this.columnDefs);
//         this.gridOptions.api.refreshView();
//         this.selectSecurity(securityId);
        
//    }
    
    resetSecurityDetail(){
      
      this.btnDisableCustodian = true;
      this.selectedCustodian = '';
      this.showSecurityDetails = false;
      this.invalidCustodians = false;
      this.submitSecurity = false;
    }
    
    selectSecurity(id){
       this.resetSecurityDetail();
       if(id != "0"){
            this.responseToObject<ISecurity>(this._securityService.getSecurityDetail(id))
            .subscribe(model => {
                this.selectedSecurity = model;
                if(this.selectedSecurity.custodialCash == null){
                    this.selectedSecurity.custodialCash = 1;
                }
                this.gridOptions.api.setRowData(this.selectedSecurity.custodians);
                this.gridOptions.api.sizeColumnsToFit();
                this.showSecurityDetails = true;
            });
       }else{
           this.showSecurityDetails = false;
       }
      
    }
    
    autoCustodianSearch(event) {       
        this._custodianService.searchCustodian(event.query)
            .map((response: Response) => <ICustodian[]>response.json())
            .subscribe(custodiansResult => {
                this.filteredCustodianResult = custodiansResult.filter(a => a.isDeleted == 0);
                this.selectedSecurity.custodians.forEach(element => {
                    this.filteredCustodianResult = this.filteredCustodianResult.filter(record => record.id != element.id);
                });
            });
    }
    
    handleselectedCustodian(custodian) {
        if (custodian.name) {
            this.btnDisableCustodian = false;
        }
        else
        this.btnDisableCustodian = true;
    }
    
    priceHandler(event , currValue){
        if(event.which == 8 || event.which == 0){
              return true;
         }
         if(event.which == 46 && currValue.toString().indexOf('.') != -1) {
              event.preventDefault();
              return false;
         }
         if(event.which >= 48 && event.which <= 57) {
              
              
         }else{
            if(event.which == 46){
                    return true;
            }
            event.preventDefault();
            return false;
         }
         
    }
    
    addCustodian(custodian){
        this.selectedSecurity.custodians.push(custodian);
        this.gridOptions.api.setRowData(this.selectedSecurity.custodians);
        this.selectedCustodian = undefined;
        this.btnDisableCustodian = true;
    }
    
    private deleteCustodian(id){
        this.selectedSecurity.custodians = this.selectedSecurity.custodians.filter(record => record.id != id);
        this.gridOptions.api.setRowData(this.selectedSecurity.custodians);
    }
    
    private saveSecurity(securityForm){
        this.submitSecurity = true;
        this.saveError = false;
        
        if(securityForm.valid){
            this.validateCustodians(); 
            
            if(securityForm.valid && !this.invalidCustodians){
            this.selectedSecurity.price = parseFloat(this.selectedSecurity.price.toString());
            this.responseToObject<ISecurity>(this._securityService.updateSecurity(this.selectedSecurity))
                        .subscribe(model => {
                        this.navigateToSecurityListView();
                    },
                    err =>{
                        this.saveError = true;
                        this.errorMessage = err.message;
                    });
                
            }
        }
        
    }
    
    private navigateToSecurityListView(){
        this._router.navigate(['/eclipse/security/maintenance/list']);
        //this.displaySecurityList.emit("Display Securities");
    }
    
   
    
   
    
    private validateCustodians(){
        this.invalidCustodians = false;
         this.selectedSecurity.custodians.forEach(element => {
                element.custodianSecuritySymbol = element.custodianSecuritySymbol == null ? element.custodianSecuritySymbol :element.custodianSecuritySymbol.trim();
                if(element.custodianSecuritySymbol == null || element.custodianSecuritySymbol.length == 0){
                    this.invalidCustodians = true;
                    return true;
                }
            });
    }
    
    private getCategories(){
        this.ResponseToObjects<ICategory>(this._securityService.getCategoryData())
            .subscribe(model => {
                this.categoryData = model;
            });
    }
    
    private getClasses(){
        this.ResponseToObjects<IClass>(this._securityService.getClassData())
            .subscribe(model => {
                this.classData = model;
            });
    }
    
    private getSubClasses(){
        this.ResponseToObjects<ISubClass>(this._securityService.getSubClassData())
            .subscribe(model => {
                this.subClassData = model;
            });
    }
    
     private getSecurities(){
        this.ResponseToObjects<ISecurity>(this._securityService.getSecurityData())
            .subscribe(model => {
                
                this.securityData = model;
                this.securityData = this.securityData.filter( a => a.isDeleted == 0);
            });
    }
    private getSecurityStatusList(){
        this.ResponseToObjects<string>(this._securityService.getSecurityStatusList())
            .subscribe(model => { 
                this.securityStatusList = model;
            });
    }
   autoSecuritySearch(event) {       
        this._securityService.searchSecurityFromOrionEclipse(event.query,'')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                //this.filteredSecurityResult = securitiesResult.filter(a => a.isDeleted == 0);
                this.filteredSecurityResult = securitiesResult;
            });
    }
    
    private handleSelectedSecurity(security){
        
        if(security != null && security.id != null){
            this.selectSecurity(security.id);
            //this.setSelectedSecurity.emit(security.id);
            this.tabsModel.id = security.id;
            this.autoCompleteSelectedSecurity = '';
        }
    }
    private getSecurityType(){
        this.ResponseToObjects<ISecurityType>(this._securityService.getSecurityType())
            .subscribe(model => {
                
                this.securityTypeData = model;
            });
    }
    
    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        
        if (targetElement.title === "Delete Custodian") {
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.deleteCustodian(id);
            
         }
        
    }
    
    private createColumnDefs() {
        
       this.columnDefs = [
            <ColDef>{headerName: "Id" , width: 150, headerTooltip: 'Id', suppressMenu: true,suppressSorting: true,field: 'id', filter:'number'},
            <ColDef>{headerName: "Name" , width: 150, headerTooltip: 'Name', suppressMenu: true,suppressSorting: true, field: 'name', filter:'text'},
            <ColDef>{headerName: "Symbol" , width: 150, headerTooltip: 'Symbol', suppressMenu: true,suppressSorting: true,field:'custodianSecuritySymbol', editable: this.isEditSecurity, filter:'text'},
            <ColDef>{headerName: "Delete" , width: 50, headerTooltip: 'Delete', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ', hide: !this.isEditSecurity, filter:'text'}
        ];
    }
    
    private deleteCellRenderer(params) {
       
        var result = '<span>';
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete Custodian"></i>';
            return result;
      
        
    }
}