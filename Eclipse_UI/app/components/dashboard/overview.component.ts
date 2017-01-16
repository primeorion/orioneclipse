import { Component } from '@angular/core';
import { BaseComponent } from '../../core/base.component';

@Component({
  selector: 'eclipse-dashboard-overview',
  templateUrl: './app/components/dashboard/overview.component.html'
})
export class OverviewComponenet extends BaseComponent {
  ngOnInit() { this.hideSpinner(); }
}
