import { Component } from '@angular/core';
import { BaseComponent } from '../../core/base.component';

@Component({
  selector: 'community-dashboard',
  templateUrl: './app/components/dashboard/dashboard.component.html'
})
export class DashboardComponenet extends BaseComponent {
  ngOnInit() { this.hideSpinner(); }
}
