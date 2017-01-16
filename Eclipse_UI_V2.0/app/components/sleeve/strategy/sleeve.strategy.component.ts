import { Component} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import {DomSanitizer} from "@angular/platform-browser";
import { SessionHelper } from '../../../core/session.helper';
import { ILogin } from '../../../login/login';
import { Http, Response, Headers } from '@angular/http';

@Component({
    selector: 'eclipse-sleeve-strategy',
    templateUrl: './app/components/sleeve/strategy/sleeve.strategy.component.html',
})

export class SleeveStrategyComponent extends BaseComponent {
    private iframeUrl;
    private _accessTokenName = 'accessTokenInfo';

    constructor(private domSanitizer: DomSanitizer,
    _sessionHelper: SessionHelper, 
    private _http: Http, 
    private activateRoute: ActivatedRoute) {
        super();
    }

    ngOnInit() {
        this.sleeveStrategy();
    }

    /** To get sleeve strategy*/
    private sleeveStrategy() {
        var accessToken = this._sessionHelper.get<ILogin>(this._accessTokenName);
        let connectStrategyUrl = 'https://testapi.orionadvisor.com/orionconnectapp/integration.html?p=/modeling/sleevestrategy&m=none&t=' + accessToken.orion_access_token;
        console.log('connect strategy url : ', connectStrategyUrl);

        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(connectStrategyUrl);
        $("#output_iframe_id").load(function () {
            $.ajaxSetup({
                'headers': {
                    'Authorization': accessToken.orion_access_token,
                }
            });
        });
    }

}
