import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { RouterModule, Router} from '@angular/router';


@Component({
    selector: 'eclipse-security-leftnav',
    templateUrl: './app/shared/leftnavigation/security.leftnav.component.html'
})
export class SecurityLeftNavComponent extends BaseComponent {

     @Input() menuName : string;
     
    constructor (private router: Router){
        super();
        
    }
    
    getLinkStyle(path){
        return this.router.url.indexOf(path) > -1;
    }
    
}
