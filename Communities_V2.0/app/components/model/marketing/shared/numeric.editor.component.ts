import {Component,ViewContainerRef,ViewChild,AfterViewInit,OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common"
import {AgEditorComponent} from 'ag-grid-ng2/main';


@Component({
    selector: 'numeric-cell',
    template: `<input #input (keypress)="onKeyPress($event)" [(ngModel)]="value">`
})
export class NumericEditorComponent implements AgEditorComponent, AfterViewInit {
    private params:any;
    private value:number;
    private cancelBeforeStart:boolean = false;

    @ViewChild('input', {read: ViewContainerRef}) private input;


    agInit(params:any):void {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        //this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue():any {
        return this.value;
    }

    isCancelBeforeStart():boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 100000 || this.value < -100000;
    };

    onKeyPress(event):void {
        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.input.element.nativeElement.focus();
    }

    private getCharCodeFromEvent(event):any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    private isCharNumeric(charCode):boolean {
       if(charCode == 8 || charCode == 0){
            return true;
       }
       if(charCode == 46 && this.value.toString().indexOf('.') != -1) {
              event.preventDefault();
              return false;
        }
        if(charCode == 45 && this.value.toString().length == 0){
              return true;
        }
        if(charCode <= 47 || charCode >= 59) {
               if(charCode != 46){
                   event.preventDefault();
                    return false; 
                }
        }
        return true;
    }

    private isKeyPressedNumeric(event):boolean {
        var charCode = this.getCharCodeFromEvent(event);
        //var charStr = String.fromCharCode(charCode);
        return this.isCharNumeric(charCode);
    }
}