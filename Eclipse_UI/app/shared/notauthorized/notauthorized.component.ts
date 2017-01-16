import { Component } from '@angular/core';
import { SessionHelper } from '../../core/session.helper';

@Component({
    selector: 'eclipse-notauthorized',
    templateUrl: './app/shared/notauthorized/notauthorized.component.html'
})
export class NotAuthorizedComponent {
    isAuthenticated: boolean;

    constructor(private _sessionHelper: SessionHelper) {
        this.isAuthenticated = _sessionHelper.isAuthenticated();
    }

}
