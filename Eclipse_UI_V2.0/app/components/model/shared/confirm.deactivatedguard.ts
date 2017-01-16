import { Component, Injectable } from '@angular/core'
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Rx';
//import { PortfolioListComponent } from  '../list/portfoliolist.component';

// @Component({
//   selector: 'eclipse-portfolio-candeactivate',
//   templateUrl: './app/components/portfolio/shared/confirm.deactivatedguard.html',
//   directives: [Dialog]
// })

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<any> {
  canDeactivate(target: CanComponentDeactivate) {
    //return target.canDeactivate();
    return target.canDeactivate ? target.canDeactivate() : true;
  }
}
