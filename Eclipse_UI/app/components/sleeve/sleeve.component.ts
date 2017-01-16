import { Component, ViewChild} from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import {DomSanitizationService} from "@angular/platform-browser";
import { SessionHelper } from '../../core/session.helper';
import { ILogin } from '../../login/login';
import { Http, Response, Headers } from '@angular/http';

@Component({
    selector: 'eclipse-sleeve',
    templateUrl: './app/components/sleeve/sleeve.component.html',
    directives : []
})

export class SleeveComponent extends BaseComponent{ 
    private iframeUrl;
    private _accessTokenName = 'accessTokenInfo';
    constructor(private domSanitizer : DomSanitizationService,  _sessionHelper: SessionHelper, private _http: Http) {
            super();
            
    }
  ngOnInit() {
     this.initSleeve();   
  }
  private initSleeve(){
      var accessToken = this._sessionHelper.get<ILogin>(this._accessTokenName);
        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            'https://testapi.orionadvisor.com/orionconnectapp/integration.html?p=/portfolio/edit/registrations/68?tabCode=sleeveSetup&m=none&t='+ accessToken.orion_access_token);
            // 'https://testapi.orionadvisor.com/orionconnectapp/index.html#/portfolio/edit/registrations/69?tabCode=sleeveSetup');
            $("#output_iframe_id").load(function(){
            $.ajaxSetup({
                'headers':{'Authorization':accessToken.orion_access_token,
                }
            });
        });
    }
  
}
