import { Component, ViewContainerRef } from '@angular/core';
import 'rxjs/Rx';   // Load all features
import {CustomSubService} from './core/customSubService';
import {OnInit} from '@angular/core';
@Component({
  selector: 'community-app',
  templateUrl: './app/app.component.html'
})
export class AppComponent implements OnInit {
  _subService: CustomSubService;
  showLoader = false;
  constructor(public subService: CustomSubService) {
    this._subService = subService;
  }
  ngOnInit() {

    this._subService.beforeRequest.subscribe(data => this.showLoader = true);
    this._subService.afterRequest.subscribe(data => this.showLoader = false);
  }
}
