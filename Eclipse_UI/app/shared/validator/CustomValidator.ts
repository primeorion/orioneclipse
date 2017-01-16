import { Control } from '@angular/common';

export class CustomValidator {
    
    static validateString(control: Control){
         return control.value == undefined || control.value.trim() == ""  ?
               {valid :false} :null;
    }
}

