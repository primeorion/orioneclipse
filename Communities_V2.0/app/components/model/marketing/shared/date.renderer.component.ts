import {Component,ViewContainerRef,ViewChild,AfterViewInit,OnDestroy} from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import {CommonModule} from "@angular/common";
import { ModelPerformanceComponent } from '../performance/performance.component';
import {AgRendererComponent , AgEditorComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'date-renderer',
    template: `<p-calendar #input [(ngModel)]="value" (onSelect) = "valueChanged($event)"></p-calendar>`
})
export class DateRendererComponent extends BaseComponent implements AgEditorComponent {
    private params:any;
    private value;
    
    @ViewChild('input', {read: ViewContainerRef}) private input;
    
   constructor(){
       super();
   }

    agInit(params:any):void {
        this.params = params;
        if(this.params != undefined && this.params.value != undefined && this.params.value != ''){
            this.value = this.dateRenderer(this.params);
        }
        
    }

    valueChanged(event){
        this.params.value = event;
        
    }
    
    getValue():any {
        return this.value;
    }
}