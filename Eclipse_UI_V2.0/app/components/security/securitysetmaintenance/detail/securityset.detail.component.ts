import { Component, Input, HostListener, ViewChild , Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router , ActivatedRoute} from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import * as Util from '../../../../core/functions';


import { BaseComponent } from '../../../../core/base.component';
import { SecurityService } from '../../../../services/security.service';
import { SecuritySetService } from '../../../../services/securityset.service';
import { TLHComponent } from './tlh/tlh.component'
import { EquivalenceComponent } from './equivalence/equivalence.component'
import { AlternativeComponent } from './alternatives/alternative.component'
import { ISecurity, IBuyPriority , ISellPriority } from '../../../../models/security';
import { ISecuritySet } from '../../../../models/securitySet';
import { ITlh } from '../../../../models/tlh';
import { IEquivalence } from '../../../../models/equivalence';
import { ITabNav } from '../shared/securityset.tabnav.component';


@Component({
    selector: 'eclipse-securityset-detail',
    templateUrl: './app/components/security/securitysetmaintenance/detail/securityset.detail.component.html'
})
export class SecuritySetDetailComponent extends BaseComponent {
    
    private tabsModel: ITabNav = <ITabNav>{};
    private selectedSecurity: any;
    gridOptions: GridOptions;
    private securitySearchResult: ISecurity[];
    private filteredSecurityResult: ISecurity[];
    securityColumnDefs: ColDef[];
    private btnDisableSecurity:boolean = true;
    private securitySet: ISecuritySet = <ISecuritySet>{};
    private buyPriorityList: IBuyPriority[] = [];
    private sellPriorityList: ISellPriority[] = [];
    private displayDeleteConfirm: boolean = false;
    private deleteSecurityId: number;
    private totalTargetAllocation: number = 0;
    private autoCompleteSelectedSecuritySet: any;
    private filteredSecuritySetResult: ISecuritySet[];
   
    private selectedTlhList: ITlh[];
    private selectedEquivalenceList: IEquivalence[];
    private selectedSecurityName: string;
    private selectedSecurityId: number;
    private isDisplayTlhDetail: boolean = false;
    private isDisplayEquivalenceDetail: boolean = false;
    private alternativeSecurity: ISecurity = <ISecurity>{} ;
    private isDisplayAlternativeDetail: boolean = false;
    private displaySecuritySetDetail: boolean = false;
    
    private securitySetSubmitted: boolean = false;
    
    @Input() securitySetId: number; 
    @Input() isDetailEditMode: boolean; 
    @Input() isCopyMode: boolean;
    @Output() setSelectedSecuritySet = new EventEmitter();
    @Output() displaySecuritySetList = new EventEmitter();
    @ViewChild(TLHComponent) tLHComponent : TLHComponent;
    @ViewChild(EquivalenceComponent) equivalenceComponent : EquivalenceComponent;
    
    constructor(private _securityService: SecurityService , private _securitySetService: SecuritySetService,
                private _router: Router, private activateRoute : ActivatedRoute){
        super(PRIV_SECURITIES);
        this.tabsModel = Util.convertToTabNav(this.permission);
        
        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.securitySetId = params['id'];
        });
        
        if(this._router.url.indexOf('view') > -1){
            this.isDetailEditMode = false;
            this.tabsModel.id = this.securitySetId;
            this.tabsModel.action = 'V'
        }
        
        if(this._router.url.indexOf('edit') > -1){
            this.isDetailEditMode = true;
            this.tabsModel.id = this.securitySetId;
            this.tabsModel.action = 'E';
        }
        
        if(this._router.url.indexOf('copy') > -1){
            this.isDetailEditMode = true;
            this.isCopyMode = true;
            this.tabsModel.action = 'E';
        }
        
        if(this._router.url.indexOf('add') > -1){
            this.securitySetId = 0;
            this.isDetailEditMode = true;
            this.tabsModel.action = 'A';
        }
        
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },
            suppressCellSelection: false
        };
     }
    
    ngOnInit(){
      
      this.displaySecuritySetDetail = false; 
      this.createSecurityColumnDef(); 
      if(this.gridOptions.api != null){
          this.gridOptions.api.setColumnDefs(this.securityColumnDefs);
      }
      
      Observable.forkJoin(
           this._securitySetService.getBuyPriorityList().map((response: Response) => response.json()),
           this._securitySetService.getSellPriorityList().map((response: Response) => response.json())
           
        ).subscribe(data => {
           this.buyPriorityList = data[0];
           this.sellPriorityList = data[1];
           
           if(this.securitySetId == 0){
              this.securitySet = <ISecuritySet>{};
              this.securitySet.toleranceType = 'ABSOLUTE';
              this.securitySet.securities = [];
              this.enableGridChildren(); 
              this.displaySecuritySetDetail = true;
           }else if(this.securitySetId != undefined){
              this.getSecuritySetDetail();
           }
           
        });
    }
    
    refreshGrid(isDetailEditMode , securitySetId){
        
        this.isDetailEditMode = isDetailEditMode;
        this.securitySetId = securitySetId;
        this.createSecurityColumnDef();
        this.gridOptions.api.setColumnDefs(this.securityColumnDefs);
        this.gridOptions.api.refreshView();
        if(!this.isDetailEditMode){
           this.getSecuritySetDetail();   
        }
    }
    
    
    
    autoSecuritySearch(event) {       
        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                this.filteredSecurityResult = securitiesResult;
                
                if(this.securitySet.securities != undefined){
                    this.securitySet.securities.forEach(element => {
                        this.filteredSecurityResult = this.filteredSecurityResult.filter(record => record.id != element.id);
                    });
                }
                
            });
    }
    
   autoSecuritySetSearch(event){
        this._securitySetService.searchSecuritySet(event.query)
            .map((response: Response) => <ISecuritySet[]>response.json())
            .subscribe(securitySetResult => {
                this.filteredSecuritySetResult = securitySetResult;
        });
    }
    
   private handleSelectedSecuritySet(securitySet){
        
        if(securitySet != null && securitySet.id != null){
            this.securitySetId = securitySet.id;
            this.isCopyMode = false;
            //this.setSelectedSecuritySet.emit(this.securitySetId);
            this.tabsModel.id = this.securitySetId;
            this.getSecuritySetDetail();
            this.autoCompleteSelectedSecuritySet = '';
        }
    }
    
    changeToleranceType(){
        
        if(this.securitySet.securities != undefined ){
            this.gridOptions.api.setRowData(this.securitySet.securities);
        }
        
    }
    
    
    
    refreshAllocationPercentage(){
        
        if(this.securitySet.toleranceTypeValue <= 100){
            this.gridOptions.api.setRowData(this.securitySet.securities);
        }
        
    }
    
    setIsDynamic(){
        if(this.securitySet.isDynamic){
            this.securitySet.isDynamic = 1;
        }else{
            this.securitySet.isDynamic = 0;
        }
    }
    
    disableRadio(){
        return !this.isDetailEditMode;
    }
    
    getSecuritySetDetail(){
        this.responseToObject<ISecuritySet>(this._securitySetService.getSecuritySetDetail(this.securitySetId))
            .subscribe(model => {
                
                this.securitySet = model;
                if(this.securitySet.toleranceType == undefined){
                    this.securitySet.toleranceType = 'ABSOLUTE';
                    
                }
                if(this.isCopyMode){
                    this.securitySet.id = undefined;
                }
                this.enableGridChildren();
                this.calculateTotalTargetAllocation();
                this.displaySecuritySetDetail = true;
                
            });
    }
    
    enableGridChildren(){
        this.gridOptions.getNodeChildDetails = function(security) {
                if (security.equivalences != null && security.equivalences != undefined &&
                    security.equivalences.length > 0) {
                    return {
                        group: true,
                        children: security.equivalences,
                        expanded: true
                    };
                } else {
                    return null;
                }
            }
            
          var self = this;
          setTimeout(function (){
            self.gridOptions.api.refreshView();
          },500);
    }
    
    displayAlternativeDetail(securityId){
        this.securitySet.securities.forEach(security => {
            
            if(security.id == securityId){
                
                this.alternativeSecurity = Object.assign({}, security);
                this.selectedSecurityName = security.name;
                this.selectedSecurityId = securityId;
                this.isDisplayAlternativeDetail = true; 
                return true;
            }
        });
    }
    
    updateAlternatives(event){
      
        for(var i = 0 ; i < this.securitySet.securities.length ; i++){
            
            var security = this.securitySet.securities[i];
            if(security.id == event.id){
                this.securitySet.securities[i] = event;
                this.isDisplayAlternativeDetail = false;
                break;
            }
        }
        
        this.gridOptions.api.setRowData(this.securitySet.securities);
    }
    
    closeAlternativePopUp(event){
        this.isDisplayAlternativeDetail = false;
    }
    
    displayEquivalenceDetail(securityId){
        this.securitySet.securities.forEach(security => {
            
            if(security.id == securityId){
                
                this.equivalenceComponent.refreshEquivalenceDisplay();
                this.selectedEquivalenceList = Object.assign([], security.equivalences);
                this.selectedEquivalenceList.forEach(element => {
                    element.isSelected = false;
                });
                this.selectedSecurityName = security.name;
                this.selectedSecurityId = securityId;
                this.isDisplayEquivalenceDetail = true; 
                return true;
            }
        });
    }
    
    updateEquivalence(event){
        
      this.securitySet.securities.forEach(security => {
            
            if(security.id == event.id){
                
                security.equivalences = event.equivalenceList;
                this.isDisplayEquivalenceDetail = false;
                
                return true;
            }
        });
        
        this.gridOptions.api.setRowData(this.securitySet.securities);
    }
    
    closeEquivalencePopUp(event){
        this.isDisplayEquivalenceDetail = false;
    }
    
    displayTlhDetail(securityId){
        this.securitySet.securities.forEach(security => {
            
            if(security.id == securityId){
                
                this.tLHComponent.resetAutocomplete();
                this.selectedTlhList = Object.assign([], security.tlh);
                this.selectedSecurityName = security.name;
                this.selectedSecurityId = securityId;
                this.isDisplayTlhDetail = true; 
                return true;
            }
        });
    }
    
    updateTlh(event){
        
        this.securitySet.securities.forEach(security => {
            
            if(security.id == event.id){
                
                security.tlh = event.tlhList;
                this.isDisplayTlhDetail = false;
                
                return true;
            }
        });
        
        this.gridOptions.api.setRowData(this.securitySet.securities);
    }
    
    closeTlhPopUp(event){
        this.isDisplayTlhDetail = false;
    }
    
    addSecurity(security){
        
        var newSecurity = <ISecurity>{};
        
        newSecurity.id = security.id;
        newSecurity.name = security.name;
        newSecurity.symbol = security.symbol;
        newSecurity.securityType = security.securityType;
        newSecurity.targetPercent = 0;
        newSecurity.equivalences = [];
        newSecurity.tlh = [];
       
        if(this.securitySet.securities == undefined){
            this.securitySet.securities = [];
        }
        this.securitySet.securities.push(newSecurity);
        this.gridOptions.api.setRowData(this.securitySet.securities);
        this.resetAutocomplete();
    }
    
    deleteSecurity(){
        this.securitySet.securities = this.securitySet.securities.filter(record => record.id != this.deleteSecurityId);
        this.displayDeleteConfirm = false;
        this.gridOptions.api.setRowData(this.securitySet.securities);
    }
    
    private saveSecuritySet(securitySetForm){
        this.securitySetSubmitted = true;
        if(securitySetForm.valid){
          
            this.calculateTotalTargetAllocation();
            
            if(this.totalTargetAllocation == 100){
                if(this.securitySet.toleranceTypeValue != undefined){
                   this.securitySet.toleranceTypeValue = parseFloat(this.securitySet.toleranceTypeValue.toString());
                }
                if(this.securitySet.id != undefined){
                   this._securitySetService.updateSecuritySet(this.securitySet).subscribe(model =>{
                        //this.displaySecuritySetList.emit("Security set updated");
                        this._router.navigate(['/eclipse/security/securitySet/list']);
                    });
                }else{
                    this._securitySetService.saveSecuritySet(this.securitySet).subscribe(model =>{
                        //this.displaySecuritySetList.emit("Security set saved");
                        this._router.navigate(['/eclipse/security/securitySet/list']);
                    });
                }
            } 
            
        }
        
    }
    
    cancel(){
        //this.displaySecuritySetList.emit("Security set detail cancelled");
        this._router.navigate(['/eclipse/security/securitySet/list']);
    }
    
    calculateTotalTargetAllocation(){
        this.totalTargetAllocation = 0 ;
        
        if(this.securitySet.securities != undefined){
            this.securitySet.securities.forEach(element => {
                this.totalTargetAllocation = element.targetPercent + this.totalTargetAllocation;
            });
        }
       
       if(this.totalTargetAllocation != 0){
           this.totalTargetAllocation.toFixed(2);
       } 
       
    }
    
    resetAutocomplete(){
         this.btnDisableSecurity = true;
         this.selectedSecurity = '';
     }
    
    handleSelectedSecurity(security) {
        if (security.name) {
            this.btnDisableSecurity = false;
        }
        else
        this.btnDisableSecurity = true;
    }
    
    percentageHandler(event , currValue){
        if(event.which == 8 || event.which == 0){
              return true;
         }
         if(event.which == 46 && currValue.indexOf('.') != -1) {
              event.preventDefault();
              return false;
         }
         if(event.which >= 48 && event.which <= 57) {
              if(parseInt(currValue+event.key) > 100){
                 event.preventDefault();
                 return false;
              }
         }else{
             if(event.which == 46){
                 return true;
             }
             event.preventDefault();
             return false;
         } 
         
    }
    
    createSecurityColumnDef(){
        let self = this;
        this.securityColumnDefs = [
            <ColDef>{headerName: "Security ID" , width: 100, headerTooltip: 'Security ID', suppressMenu: !self.isDetailEditMode,field: 'id', filter:'number',
                     cellRenderer:  'group', 
                     cellRendererParams: {
                        innerRenderer: function(params){
                            return params.data.id;
                        }
                     }
            },
            <ColDef>{headerName: "Security Name" , width: 150, headerTooltip: 'Security Name', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'name', filter:'text'},
            <ColDef>{headerName: "Symbol" , width: 100, headerTooltip: 'Symbol', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'symbol', filter:'text'},
            <ColDef>{headerName: "Type" , width: 100, headerTooltip: 'Type', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'securityType',  filter:'text'},
            <ColDef>{headerName: "Rank" , width: 150, headerTooltip: 'Rank', suppressMenu: !self.isDetailEditMode,sort: 'asc',  filter:'number',
                     cellRenderer:function(params){
                         return self.securityRankEditor(params , self);
                     }, cellClass: 'text-center ', field: 'rank'},
            <ColDef>{headerName: "EQ" , width: 50, headerTooltip: 'EQ', suppressMenu: true,suppressSorting: true, 
                     cellRenderer: this.addEquivalenceCellRenderer, cellClass: 'text-center ' , hide: !self.isDetailEditMode},
            <ColDef>{headerName: "T" , width: 50, headerTooltip: 'T', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'taxableSecurity', filter:'text',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     }
                    },
            <ColDef>{headerName: "TD" , width: 50, headerTooltip: 'TD', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'taxDeferredSecurity',  filter:'text',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     } 
                    },
            <ColDef>{headerName: "TE" , width: 50, headerTooltip: 'TE', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'taxExemptSecurity', filter:'text',
                     cellRenderer:function(params){
                         return self.alternativeCellRenderer(params);
                     }
                    },
             <ColDef>{headerName: "Alternative" , width: 100, headerTooltip: 'Alternative', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.addAlternativeRenderer, cellClass: 'text-center ', hide: !self.isDetailEditMode},
            <ColDef>{headerName: "Allocation %" , width: 150, headerTooltip: 'Allocation %', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'targetPercent', filter:'number',
                     cellRenderer:function(params){
                         return self.percentageEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Lower Tol.(%)" , width: 150, headerTooltip: 'Lower Tol.(%)', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'lowerModelTolerancePercent', filter:'number',
                     cellRenderer:function(params){
                         return self.percentageEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Upper Tol.(%)" , width: 150, headerTooltip: 'Upper Tol.(%)', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'upperModelTolerancePercent', filter:'number',
                     cellRenderer:function(params){
                         return self.percentageEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Lower Tol.($)" , width: 150, headerTooltip: 'Lower Tol.($)', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'lowerModelToleranceAmount', filter:'number',
                     cellRenderer:function(params){
                         return self.toleranceAmtEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Upper Tol.($)" , width: 150, headerTooltip: 'Upper Tol.($)', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'upperModelToleranceAmount', filter:'number',
                     cellRenderer:function(params){
                         return self.toleranceAmtEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Min Trade Amt" , width: 150, headerTooltip: 'Min Trade Amt', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'minTradeAmount', filter:'number',
                     cellRenderer:function(params){
                         return self.numberEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Min Initial Buy $" , width: 150, headerTooltip: 'Min Initial Buy $', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'minInitialBuyDollar', filter:'number',
                     cellRenderer:function(params){
                         return self.numberEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Buy Priority" , width: 150, headerTooltip: 'Buy Priority', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'buyPriority', filter:'text',
                     cellRenderer:function(params){
                         return self.sellBuyPriorityEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "Sell Priority" , width: 150, headerTooltip: 'Sell Priority', suppressMenu: !self.isDetailEditMode,suppressSorting: true,field: 'sellPriority', filter:'text',
                     cellRenderer:function(params){
                         return self.sellBuyPriorityEditor(params , self);
                     }
                    },
            <ColDef>{headerName: "TLH" , width: 50, headerTooltip: 'TLH', suppressMenu: true,suppressSorting: true, filter:'text',
                     cellRenderer: this.addTlhCellRenderer, cellClass: 'text-center' , headerClass: 'nbr'},
            <ColDef>{headerName: "" , width: 200, headerTooltip: '', suppressMenu: !self.isDetailEditMode,suppressSorting: true,
                     cellRenderer: this.tlhCellRenderer
                    },
            <ColDef>{headerName: "Delete" , width: 100, headerTooltip: 'Delete', suppressMenu: true,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ', hide: !self.isDetailEditMode}
            
        ]
    }
    
    
    
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        
         if (targetElement.title === "Delete") {
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.deleteSecurityId = id;
            this.displayDeleteConfirm = true;
            
         }
        
        if(targetElement.title === "Add TLH"){
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.displayTlhDetail(id);
        }
        
        if(targetElement.title === "Add Equivalence"){
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.displayEquivalenceDetail(id);
        }
        
        if(targetElement.title === "Add Alternatives"){
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.displayAlternativeDetail(id);
        }
    }
    
    private deleteCellRenderer(params) {
       
       if (params.data.equivalences != null || params.data.equivalences != undefined) { 
            var result = '<span>';
            result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete"></i>';
            return result;
       }else{
            return '';
       }
        
    }
    
    private addEquivalenceCellRenderer(params) {
        
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
            var result = '<span>';
            result += '<i class="material-icons addEquivalenceClass cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Add Equivalence">queue</i>';
            return result;
        }else{
            return '';
        }
    }
    
     private addAlternativeRenderer(params) {
        
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
            var result = '<span>';
            result += '<i class="material-icons addEquivalenceClass cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Add Alternatives">library_books</i>';
            return result;
        }else{
            return '';
        }
    }
    
    private addTlhCellRenderer(params) {
        
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
            var result = '<span>';
            result += '<i class="fa fa-plus cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.accountNumber + ' title="Add TLH"></i>';
            return result;
        }else{
            return '';
        }
        
    }
    
    private tlhCellRenderer(params){
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
            var result = '<span>';
            if(params.data.tlh != undefined && params.data.tlh.length == 0){
                result = result + 'None';
            }else{
                
                params.data.tlh.forEach(function(i, idx, array){
                    
                    result = result + i.symbol;
                    if (!(idx === array.length - 1)){ 
                        result =result + ' , ';
                    }
                 });
            }
            return result + '</span>';
        }else{
            return '';
        }
    }
    
    private alternativeCellRenderer(params){
        
        var result;
        if(params.colDef.headerName == 'T'){
            result = params.data.taxableSecurity;
        }else if(params.colDef.headerName == 'TD'){
            result = params.data.taxDeferredSecurity;
        }else if(params.colDef.headerName == 'TE'){
            result = params.data.taxExemptSecurity;
        }
        
        
        var symbol =  (result == undefined ? '' : result.symbol);
        
        if(symbol == undefined){
            params.data[params.colDef.field] = '';
            return '';
        }else{
            return symbol;
        }
    }
    
    private percentageEditor(params, self) {
            
            if (params.data.equivalences != null || params.data.equivalences != undefined) {
                
                if(self.isDetailEditMode){
                     if(self.securitySet.toleranceType == 'ABSOLUTE'){
                         return self.percentageEditorRenderer(params , self);
                     }else if(self.securitySet.toleranceType == 'BAND'){
                         if(params.colDef.field == 'targetPercent'){
                             return self.percentageEditorRenderer(params , self);
                         }else{
                             var result = (self.securitySet.toleranceTypeValue/100)*params.data['targetPercent'];
                             params.data[params.colDef.field] = isNaN(result) ? 0 : result.toFixed(2);
                             return self.labelRenderer(params , self , isNaN(result) ? 0 : result.toFixed(2));
                         }
                     }
                }else{
                    return self.labelRenderer(params , self , params.data[params.colDef.field]);
                }
            }else{
                return document.createElement('span');
            }
            
    }
    
    private labelRenderer(params , self , text){
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eLabel = document.createTextNode(text == undefined ? '' : text);
        eCell.appendChild(eLabel);
        return eCell;
    }
    
    private percentageEditorRenderer(params , self){
        
                var eInput = document.createElement("input");
            
                eInput.className = "form-control grid-input";
                eInput.value = params.data[params.colDef.field] == undefined ? 0 : params.data[params.colDef.field];
                
                 eInput.addEventListener('blur', function (event) {
                    
                    if (!self.isValidPercentage(eInput.value , self)) {
                        eInput.value = params.data[params.colDef.field];
                    } else {
                        
                        params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
                        
                    }
                    
                    if(params.colDef.field == 'targetPercent'){
                        self.calculateTotalTargetAllocation();
                    }
                    
                    self.gridOptions.api.setRowData(self.securitySet.securities);
                    
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
                        if(parseInt(eInput.value+event.key) > 100){
                            event.preventDefault();
                            return false;
                        }
                        
                 });
                 
                return eInput;    
    }
    
   private securityRankEditor(params, self) {
       if(self.isDetailEditMode){
          return self.rankEditorRenderer(params , self);
        }else{
           return self.labelRenderer(params , self , params.data[params.colDef.field]);
        }
       
   }
     
   private rankEditorRenderer(params , self){
       var eInput = document.createElement("input");
       eInput.className = "form-control grid-input";
        
       eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
       
       eInput.addEventListener('blur', function (event) {
                    
           params.data[params.colDef.field] = isNaN(parseFloat(eInput.value)) ? '' : parseFloat(eInput.value);
                    
       });
                 
       eInput.addEventListener('keypress' , function(event){
        //    var maxValue ;
        //    if(params.data.equivalences != null || params.data.equivalences != undefined){
        //        maxValue = self.securitySet.securities.length;
        //    }else{
        //        maxValue = params.node.parent.allChildrenCount;
        //    }
           
           if(event.which >= 48 && event.which <= 57) {
                 
           }else{
                event.preventDefault();
                return false;
           }               
                           
       });
                 
       return eInput;
    }
    
    private toleranceAmtEditor(params , self){
        if (params.data.equivalences != null || params.data.equivalences != undefined) {
                return self.numberEditor(params , self);
                
         }else{
                return document.createElement('span');
         }
    }
    
    private numberEditor(params, self) {
            
            if(self.isDetailEditMode){
                var eInput = document.createElement("input");
            
                eInput.className = "form-control grid-input";
                
                
                eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
                
                 eInput.addEventListener('blur', function (event) {
                    
                    params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? '' : parseFloat(eInput.value));
                    
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
                return self.labelRenderer(params , self , params.data[params.colDef.field]);
            }
    }
    
    private isValidPercentage(n , self){
           if(n >= 0 && n <= 100){
               return true;
           }
           return false;
    }
    
    private sellBuyPriorityEditor(params, self) {
        
         if(self.isDetailEditMode){
            var editing = false;

            var eCell = document.createElement('div');
            eCell.style.cssText = "height:20px;";
            var eLabel = document.createTextNode(params.value == undefined ? '' : 
            (params.value.displayName == undefined ? '' : params.value.displayName));
            eCell.appendChild(eLabel);

            var eSelect = document.createElement("select");
            var list ;

            if(params.colDef.field == "buyPriority"){
                list = self.buyPriorityList;
               
            }else if (params.colDef.field == "sellPriority"){
                list = self.sellPriorityList;
            }
            
            if(list != undefined){
                list.forEach(function(item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.id);
                    eOption.innerHTML = item.displayName;
                    eSelect.appendChild(eOption);
                });
            }
            
            if(params.data[params.colDef.field] != undefined){
                eSelect.value = params.data[params.colDef.field].id;
            }
            

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
                    params.data[params.colDef.field] = {id: eSelect.value , displayName: newValue};
                    // params.data[params.colDef.field] = eSelect.value;
                    eLabel.nodeValue = newValue;
                    eCell.removeChild(eSelect);
                    eCell.appendChild(eLabel);
                    
                    var updatedNodes = [];
                    updatedNodes.push(params.node)
                    self.gridOptions.api.refreshRows(updatedNodes);
                    
                }
            });

            return eCell;
         }else{
             return self.labelRenderer(params , self , 
             params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field].displayName);
         } 
    }
    
    
}