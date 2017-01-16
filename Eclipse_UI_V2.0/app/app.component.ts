import { Component, ViewContainerRef } from '@angular/core';
import 'rxjs/Rx';   // Load all features
import { CustomSubService } from './core/customSubService';
import { OnInit } from '@angular/core';
@Component({
  selector: 'orion-app',
  templateUrl: './app/app.component.html'
})
export class AppComponent implements OnInit {
  _subService: CustomSubService;
  showLoader = false;

  constructor(public subService: CustomSubService) {
    this._subService = subService;
  }

  ngOnInit() {
    this._subService.beforeRequest.subscribe(requestCounter => {
      if (+requestCounter > 0) this.showLoader = true; //Spinner for multiple requests
      //console.log("before spinner: ", data)
    });
    this._subService.afterRequest.subscribe(requestCounter => {
      if (+requestCounter <= 0) this.showLoader = false; //Spinner for multiple requests
      // console.log("after spinner: ",data)
    });
  }
}
