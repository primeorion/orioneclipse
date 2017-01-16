import { FormControl } from '@angular/forms';

export class CustomValidator {
    
    static validateString(control: FormControl){
         return control.value == undefined || control.value.trim() == ""  ?
               {valid :false} :null;
    }
}

