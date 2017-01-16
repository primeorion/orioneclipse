import { Component, Input, HostListener , Output , EventEmitter, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { PickList } from '../../../../../shared/picklist/picklist';
import 'ag-grid-enterprise/main';


import { BaseComponent } from '../../../../../core/base.component';
import { SecurityService } from '../../../../../services/security.service';
import { ISecurity } from '../../../../../models/security';
import { ICategory } from '../../../../../models/category';
import { IClass } from '../../../../../models/class';
import { ISubClass } from '../../../../../models/subClass';
import { IEquivalence } from '../../../../../models/equivalence';
import { ISecuritySet } from '../../../../../models/securitySet';

@Component({
    selector: 'eclipse-equivalence',
    templateUrl: './app/components/security/securitysetmaintenance/detail/equivalence/equivalence.component.html',
    providers: [SecurityService],
    directives: [AgGridNg2, Dialog, Button, AutoComplete , PickList]
})
export class EquivalenceComponent extends BaseComponent {
    
    private filteredSecurityResult: ISecurity[];
    private sourceSecurityList: ISecurity[] = [];
    private filteredSourceSecurityList: ISecurity[] = [];
    private selectedSecurity: any;
    private btnDisableSecurity:boolean = true;
    private equivalenceType: string = '';
    private equivalentList: any[];
    private equivalent: any = '';
    private isSecuritySearch: boolean = false;
    private isAllSelected: boolean = false;
    private isAllEquivalenceSelected: boolean = false;
    private searchName: string = '';
    
    @Input() equivalenceList: IEquivalence[]; 
    @Input() securityId: number;
    @Output() updateEquivalence = new EventEmitter();
    @Output() closeEquivalencePopUp = new EventEmitter();
    
     constructor(private _securityService: SecurityService, private _cdr:ChangeDetectorRef) {
        super();
        
     }
     
     ngOnInit(){
         
         if(this.equivalenceList != undefined){
            this.equivalenceList.forEach(element => {
                element.isSelected = false;
            });
         }
         
     }
     
    refreshEquivalenceDisplay(){
       this.equivalenceType = '';
       this.equivalent = '';
       this.equivalentList = [];
       this.isSecuritySearch = false;
       this.sourceSecurityList = [];
       this.filteredSecurityResult = [];
       this.isAllSelected = false;
       this.isAllEquivalenceSelected = false;
       this.searchName = '';
    }
     
    getEquivalences(){
       this.equivalent = '';
       this.equivalentList = [];
       this.isSecuritySearch = false;
       this.sourceSecurityList = [];
       this.filteredSecurityResult = [];
       this.isAllSelected = false;
       this.searchName = '';
      
       if(this.equivalenceType == 'Category'){
           
            this.ResponseToObjects<ICategory>(this._securityService.getCategoryData()).subscribe(model => {
                this.equivalentList = model;
            });
           
       }else if(this.equivalenceType == 'Class'){
           
           this.ResponseToObjects<IClass>(this._securityService.getClassData()).subscribe(model => {
                this.equivalentList = model;
            });
            
       }else if(this.equivalenceType == 'Sub-Class'){
           
           this.ResponseToObjects<ISubClass>(this._securityService.getSubClassData()).subscribe(model => {
                this.equivalentList = model;
            });
       }else if(this.equivalenceType == 'Security'){
           
           this.isSecuritySearch = true;
       }
    }
    
    getSecurities(){
        
        this.isAllSelected = false;
        
        if(this.equivalent != undefined && this.equivalent != ''){
            if(this.equivalenceType == 'Category'){
                
                    this.ResponseToObjects<ISecurity>(this._securityService.getSecuritiesByCategory(this.equivalent,'OPEN'))
                    .subscribe(model => {
                        this.sourceSecurityList = model;
                        this.filterSourceSecurityList();
                        
                    });
                
            }else if(this.equivalenceType == 'Class'){
                
                this.ResponseToObjects<ISecurity>(this._securityService.getSecuritiesByClass(this.equivalent,'OPEN'))
                    .subscribe(model => {
                        this.sourceSecurityList = model;
                        this.filterSourceSecurityList();
                        
                    });
                    
            }else if(this.equivalenceType == 'Sub-Class'){
                
                this.ResponseToObjects<ISecurity>(this._securityService.getSecuritiesBySubClass(this.equivalent,'OPEN'))
                    .subscribe(model => {
                        this.sourceSecurityList = model;
                        this.filterSourceSecurityList();
                        
                    });
            }
            
           
        }
    }
    
    filterSourceSecurityList(){
       this.sourceSecurityList = this.sourceSecurityList.filter(record => record.id != this.securityId);
       this.equivalenceList.forEach(element => {
           this.sourceSecurityList = this.sourceSecurityList.filter(record => record.id != element.id);
       });
    }    
   
   
   
   //add equivalences
   alterListSelection(){
       
       if(this.isAllSelected){
           for (var i = 0 ; i < this.sourceSecurityList.length ; i++){
           
                var security = this.sourceSecurityList[i];
                
                security.isSelected = true;
                this.addEquivalence(security);
            } 
            this.sourceSecurityList = [];
            
       }
       
   }
   
   markAllEquivalenceSelection(){
       
       var allEquivalenceSelected = true;
       
       for (var i = 0 ; i < this.equivalenceList.length ; i++){
           
           var equivalence = this.equivalenceList[i];
           if(!equivalence.isSelected){
               allEquivalenceSelected = false;
               break;
           }
       }
       
       if(allEquivalenceSelected){
           this.isAllEquivalenceSelected = true;
       }
   }
   
   //mark equivalences selected based upon all equivalence checkbox selection
   alterEquivalenceSelection(){
       for (var i = 0 ; i < this.equivalenceList.length ; i++){
           
                var equivalence = this.equivalenceList[i];
                equivalence.isSelected = this.isAllEquivalenceSelected;
                
        } 
   }
   
   //select/deselect all equivalence checkbox
   alterEquivalenceSelectionList(equivalence){
       if(equivalence.isSelected){
           this.markAllEquivalenceSelection();   
       }else{
           this.isAllEquivalenceSelected = false;
       }
   }
    
   //add Equivalence
   alterEquivalenceList(security){
       if(security.isSelected){
           
           this.addEquivalence(security);
           this.sourceSecurityList = this.sourceSecurityList.filter(record => record.id != security.id);
           if(this.sourceSecurityList.length == 0){
               this.isAllSelected = false;
           }
       }
    
   }
   
   
   
   deleteEquivalence(equivalence){
       this.equivalenceList = this.equivalenceList.filter(record => record.id != equivalence.id);
       var security = <ISecurity>equivalence;
       security.isSelected = false;
       this.sourceSecurityList.push(security);
   }
   
   deleteSelectedEquivalences(){
       for(var i = this.equivalenceList.length - 1 ; i >= 0 ; i-- ){
          
          var equivalence = this.equivalenceList[i];
          if(equivalence.isSelected){
              this.deleteEquivalence(equivalence);
              this.isAllEquivalenceSelected = false;
              this.isAllSelected = false;
          }
          
      }
   }
   
    
    
     
     autoSecuritySearch(searchName) {  
        
        this.isAllSelected = false;
        if(searchName != undefined && searchName.length > 0){
            this._securityService.searchSecurityFromOrionEclipse(searchName, 'OPEN')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                this.sourceSecurityList = securitiesResult;
                this.filterSourceSecurityList();
                
            });
        }else{
            
            this.sourceSecurityList = [];
        }    
        
      }
      
      handleSelectedSecurity(security) {
            if (security.name) {
                this.btnDisableSecurity = false;
            }
            else
            this.btnDisableSecurity = true;
      }
     
     addEquivalence(security){
         
         var equivalence = <IEquivalence>{};
         equivalence.id = security.id;
         equivalence.name = security.name;
         equivalence.symbol = security.symbol;
         equivalence.securityTypeId = security.securityTypeId;
         equivalence.securityType = security.securityType;
         equivalence.isSelected = false;
         
         this.equivalenceList.push(equivalence);
         
         this.resetAutocomplete();
     }
     
     
     
     save(){
        this.updateEquivalence.emit({ equivalenceList: this.equivalenceList , id: this.securityId});
     }
     
     cancel(){
         this.closeEquivalencePopUp.emit('closePopup');
     }
     
     resetAutocomplete(){
         this.btnDisableSecurity = true;
         this.selectedSecurity = '';
     }
     
}