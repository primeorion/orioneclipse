import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../core/base.component';

@Component({
    selector: 'eclipse-loginAs',
    templateUrl: './app/login/loginAs.component.html',
})
export class LoginAsComponent extends BaseComponent{
    constructor( private _router: Router) {
        super();
    }

     ngOnInit() { 
          this._router.navigate(['eclipse']);
     }
}