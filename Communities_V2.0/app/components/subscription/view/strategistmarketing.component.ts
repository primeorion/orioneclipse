import { Component,Output } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as Util from '../../../core/functions';
import { SubscriptionBreadcrumbComponent } from '../../../shared/breadcrumb/subscriptionbreadcrumb';
import { StrategistService } from '../../../services/strategist.service';
import { IStrategist } from '../../../models/strategist';
import { IStrategistDownload } from '../../../models/strategist';

@Component({
    selector: 'strategist-marketing',
    templateUrl: './app/components/subscription/view/strategistmarketing.component.html',
})

export class StrategistMarketingComponent extends BaseComponent {
    private strategist: IStrategist = <IStrategist>{};
    private downloads: IStrategistDownload[] = [];
    strategistId: number;
    constructor(private _strategistService: StrategistService, private activateRoute: ActivatedRoute) {
        super();
        this.strategistId = Util.getRouteParam<number>(this.activateRoute);
    }
    ngOnInit() {
        this.getStrategistInfo();
        this.getStrategistDocuments();
    }
    // get strategist details based on strategistId
    getStrategistInfo() {
        this.responseToObject<IStrategist>(this._strategistService.getStrategistDetail(this.strategistId))
            .subscribe(model => {
                this.strategist = model;
                if (this.strategist.smallLogo != undefined) {
                    document.getElementById("smallLogo").setAttribute('src', this.strategist.smallLogo);
                }
            });

    }
    // get strategist documents based on strategistId
    getStrategistDocuments() {
        this.ResponseToObjects<IStrategistDownload>(this._strategistService.getStrategistDownload(this.strategistId))
            .subscribe(model => {
                this.downloads = model;
            });

    }
}