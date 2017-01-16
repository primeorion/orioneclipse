import { Component, Input, HostListener , Output , EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';


import { BaseComponent } from '../../../../../core/base.component';
import { SecurityService } from '../../../../../services/security.service';
import { ISecurity } from '../../../../../models/security';
import { IEquivalence } from '../../../../../models/equivalence';
import { ISecuritySet } from '../../../../../models/securitySet';

@Component({
    selector: 'eclipse-alternative',
    templateUrl: './app/components/security/securitysetmaintenance/detail/alternatives/alternative.component.html'
})
export class AlternativeComponent extends BaseComponent {
    
    @Input() security: ISecurity;
    @Output() closeAlternativePopUp = new EventEmitter();
    @Output() updateAlternatives = new EventEmitter();
    
    constructor(private _securityService: SecurityService) {
        super();
        
     }
    
    autoSecuritySearch(event , id , alternativeType) {      
        // console.log(this.security);
        this._securityService.searchSecurityFromOrionEclipse(event.query , 'OPEN')
            .map((response: Response) => <ISecurity[]>response.json())
            .subscribe(securitiesResult => {
               
               this.assignFilterResults(id , alternativeType , securitiesResult);
            });
    }
    
    assignFilterResults(securityId , alternativeType , searchResult){
        
        
        if(securityId == undefined || securityId == ''){
            
            this.getFilterResultArray(alternativeType , this.security , searchResult);
            
        }else {
            for(var i = 0 ; i < this.security.equivalences.length ; i++){
                var equivalence = this.security.equivalences[i];
                
                if(equivalence.id == securityId){
                    this.getFilterResultArray(alternativeType , equivalence , searchResult);
                    break;
                }
            }
        }
        
    }
    
    getFilterResultArray(alternativeType , security , securitiesResult){
        
        if(alternativeType == 'T'){
            security.taxableFilteredSearchResult = securitiesResult;
        }else if(alternativeType == 'TD'){
            security.taxDeferredFilteredSearchResult = securitiesResult;
        }else if(alternativeType == 'TE'){
            security.taxExemptFilteredSearchResult = securitiesResult;
        }
       
    }
    
    save(){
        this.security.taxableFilteredSearchResult = [];
        this.security.taxDeferredFilteredSearchResult = [];
        this.security.taxExemptFilteredSearchResult = [];
        
        if(this.security.equivalences != undefined){
            for(var i = 0 ; i < this.security.equivalences.length ; i++){
                
                var equivalence = this.security.equivalences[i];
                equivalence.taxableFilteredSearchResult = [];
                equivalence.taxDeferredFilteredSearchResult = [];
                equivalence.taxExemptFilteredSearchResult = [];
            }
        }
        
        this.updateAlternatives.emit(this.security);
    }
    
    cancel(){
        this.closeAlternativePopUp.emit("Hide details");
    }
    
    
}