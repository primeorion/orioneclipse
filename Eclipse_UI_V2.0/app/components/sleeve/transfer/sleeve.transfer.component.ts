import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as Util from '../../../core/functions';
import { BaseComponent } from '../../../core/base.component';
import {DomSanitizer} from "@angular/platform-browser";
import { SessionHelper } from '../../../core/session.helper';
import { ILogin } from '../../../login/login';
import { Http, Response, Headers } from '@angular/http';
import { PortfolioService } from '../../../services/portfolio.service';
import { IPortfolioDetails } from '../../../models/portfolio';

@Component({
    selector: 'eclipse-sleeve-transfer',
    templateUrl: './app/components/sleeve/transfer/sleeve.transfer.component.html',
})

export class SleeveTransferComponent extends BaseComponent {
    private iframeUrl;
    private _accessTokenName = 'accessTokenInfo';
    sleevePortfolioId: number;
    registrationId: number;

    constructor(private domSanitizer: DomSanitizer, _sessionHelper: SessionHelper, private _http: Http, private activateRoute: ActivatedRoute, private _portfolioService: PortfolioService) {
        super();
        this.sleevePortfolioId = Util.getRouteParam<number>(this.activateRoute) || 0;
    }

    ngOnInit() {
        this.getPortfolio();
    }

    /** To get portfolio details */
    getPortfolio() {
        if (this.sleevePortfolioId > 0) {
            Util.responseToObject<IPortfolioDetails>(this._portfolioService.getPortfolioById(this.sleevePortfolioId))
                .subscribe(portfolio => {
                    this.registrationId = portfolio.general.registrationId;
                    this.sleeveTransfer();
                });
        }
    }

    /** To transfer sleeve */
    private sleeveTransfer() {
        var accessToken = this._sessionHelper.get<ILogin>(this._accessTokenName);
        let connectTransferUrl = 'https://testapi.orionadvisor.com/orionconnectapp/integration.html?p=/trading/sleeve/transfer/?registrationId=' + this.registrationId + '&m=none&t=' + accessToken.orion_access_token;
        //let connectSleeveEditUrl = 'https://testapi.orionadvisor.com/orionconnectapp/integration.html?p=/portfolio/edit/registrations/' + this.registrationId + '?tabCode=sleeveSetup&m=none&t=' + accessToken.orion_access_token;
        console.log('connect transfer url : ', connectTransferUrl);

        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(connectTransferUrl);
        $("#output_iframe_id").load(function () {
            $.ajaxSetup({
                'headers': {
                    'Authorization': accessToken.orion_access_token,
                }
            });
        });
    }

}
