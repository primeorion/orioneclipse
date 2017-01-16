import { Component } from '@angular/core';
import { SessionHelper } from '../../core/session.helper';

@Component({
    selector: 'eclipse-notfound',
    templateUrl: './app/shared/notfound/notfound.component.html'
})
export class NotFoundComponent {
    isAuthenticated: boolean;
    
    constructor(private _sessionHelper: SessionHelper) {
        this.isAuthenticated = _sessionHelper.isAuthenticated();
    }

}
