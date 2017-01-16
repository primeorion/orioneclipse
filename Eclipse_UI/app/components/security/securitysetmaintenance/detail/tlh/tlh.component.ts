import { Component, Input, HostListener , Output , EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';


import { BaseComponent } from '../../../../../core/base.component';
import { SecurityService } from '../../../../../services/security.service';
import { ISecurity } from '../../../../../models/security';
import { ITlh } from '../../../../../models/tlh';
import { ISecuritySet } from '../../../../../models/securitySet';

@Component({
    selector: 'eclipse-tlh',
    templateUrl: './app/components/security/securitysetmaintenance/detail/tlh/tlh.component.html',
    providers: [SecurityService],
    directives: [AgGridNg2, Dialog, Button, AutoComplete]
})
export class TLHComponent extends BaseComponent {
    
    private tlhColumnDefs: ColDef[];
    private tlhModalVisible: boolean = false;
    private filteredSecurityResult: ISecurity[];
    private selectedSecurity: any;
    private btnDisableSecurity:boolean = true;
    private gridOptions: GridOptions;
    
    @Input() tlhList: ITlh[]; 
    @Input() isDetailEditMode: boolean;
    @Input() securityId: number;
    @Output() updateTlh = new EventEmitter();
    @Output() closeTlhPopUp = new EventEmitter();
    
     constructor(private _securityService: SecurityService) {
        super();
        
        this.gridOptions = <GridOptions>{
            enableColResize: true,
            suppressContextMenu: true
        };
        
        this.tlhModalVisible = true;
        
     }
     
    ngOnInit(){
      this.createTlhGrid(); 
      if(this.gridOptions.api != null){
          this.gridOptions.api.setColumnDefs(this.tlhColumnDefs);
      }
    }
     
     autoSecuritySearch(event) {       
        this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
                this.filteredSecurityResult = securitiesResult;
                // //this.filteredSecurityResult = securitiesResult.filter(a => a.isDeleted == 0);
                this.tlhList.forEach(element => {
                    this.filteredSecurityResult = this.filteredSecurityResult.filter(record => record.id != element.id);
                });
                this.filteredSecurityResult = this.filteredSecurityResult.filter(record => record.id != this.securityId);
            });
      }
      
      handleSelectedSecurity(security) {
            if (security.name) {
                this.btnDisableSecurity = false;
            }
            else
            this.btnDisableSecurity = true;
      }
     
     addTlh(security){
         
         var tlh = <ITlh>{};
         tlh.id = security.id;
         tlh.name = security.name;
         tlh.symbol = security.symbol;
         tlh.securityType = security.securityType;
         
         this.tlhList.push(tlh);
         
         this.gridOptions.api.setRowData(this.tlhList);
         this.resetAutocomplete();
     }
     
     deleteTlh(id){
         this.tlhList = this.tlhList.filter(record => record.id != id);
         this.gridOptions.api.setRowData(this.tlhList);
     }
     
     save(){
        this.updateTlh.emit({ tlhList: this.tlhList , id: this.securityId});
     }
     
     cancel(){
         this.closeTlhPopUp.emit('closePopup');
     }
     
     resetAutocomplete(){
         this.btnDisableSecurity = true;
         this.selectedSecurity = '';
         
     }
     
     
     
     private createTlhGrid(){
         
        let self = this;
        this.tlhColumnDefs = [
            <ColDef>{headerName: "Priority" , width: 100, headerTooltip: 'Priority', suppressMenu: !self.isDetailEditMode,field: 'priority',
                     cellRenderer:function(params){
                         return self.tlhRankEditor(params , self);
                     }, cellClass: 'text-center'
                    },
            <ColDef>{headerName: "Security Name" , width: 214, headerTooltip: 'Security Name', suppressMenu: !self.isDetailEditMode,field: 'name'},
            <ColDef>{headerName: "Symbol" , width: 150, headerTooltip: 'Symbol', suppressMenu: !self.isDetailEditMode,field: 'symbol'},
            <ColDef>{headerName: "Type" , width: 100, headerTooltip: 'Type', suppressMenu: !self.isDetailEditMode,field: 'securityType'},
            <ColDef>{headerName: "Delete" , width: 100, headerTooltip: 'Delete', suppressMenu: !self.isDetailEditMode,suppressSorting: true,
                     cellRenderer: this.deleteCellRenderer, cellClass: 'text-center', hide: !self.isDetailEditMode},
        ]
          
     }
     
   private tlhRankEditor(params, self) {
       if(self.isDetailEditMode){
          return self.rankEditorRenderer(params , self);
        }else{
           return params.data[params.colDef.field];
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
           if(event.which >= 48 && event.which <= 57) {
                 
           }else{
                event.preventDefault();
                return false;
           }               
                           
       });
                 
       return eInput;
    }
     
     private deleteCellRenderer(params) {
        
        var result = '<span>';
        result += '<i class="fa fa-times red cursor" aria-hidden="true" id =' + params.node.data.id + ' value=' + params.node.data.id + ' title="Delete TLH"></i>';
        return result;
        
    }
    
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        
        if (targetElement.title === "Delete TLH") {
            let id = parseInt(targetElement.outerHTML.split('id="')[1].split('value="')[0].replace(/['"]+/g, '').toString());
            this.deleteTlh(id);
        }
    }
}