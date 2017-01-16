import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { ModelMarketingService } from '../../../services/model.marketing.service';
import { IStrategist } from '../../../models/strategist';

@Component({
    selector: "subscription-profiles",
    templateUrl: "./app/components/subscription/list/subscriptionprofiles.component.html"
})

export class SubscriptionProfiles extends BaseComponent {
    private strategistProfiles: IStrategist[] = [];
    private aggrementConfirm: boolean;
    private legalAgreement: string;
    private isCheck: boolean = false;
    private strategistId: number;
    private unSubscribeMsg: string;
    private unSubscribeConfirm: boolean = false;

    constructor(private _modelMarketingService: ModelMarketingService) {
        super();
        this.getSubscriptionProfiles();
    }
    //  strategist profiles 
    getSubscriptionProfiles() {
        this.responseToObject<IStrategist>(this._modelMarketingService.getSubscriptionProfiles())
            .subscribe(profiles => {
                this.strategistProfiles = <any>profiles;
            });
    }
    // based on strategistId get legalAgreement
    subscribe(strategistId) {
        this.isCheck = false
        this.strategistId = strategistId;
        this.responseToObject(this._modelMarketingService.getLegalAgreement(strategistId))
            .subscribe(agreement => {
                this.aggrementConfirm = true;
                this.legalAgreement = agreement["legalAgreement"];
            })
    }
     /** * accept the legal agreement */
    acceptAgreement() {
        let isSubscribe = {
            "isSubscribe": true
        }
        this.responseToObject(this._modelMarketingService.subscribeOrUnsubscribe(this.strategistId, isSubscribe))
            .subscribe(subscribe => {
                this.aggrementConfirm = false;
                this.getSubscriptionProfiles();
            });
    }
    /** *open unsubscribe conformation pop up  */
    unSubscribe(strategistId) {
        this.strategistId = strategistId;
        this.unSubscribeConfirm = true;
    }
     /** * unsubscribe strategist */
    confirmUnSubscribe(strategistId) {
        let isSubscribe = {
            "isSubscribe": false
        }
        this.responseToObject(this._modelMarketingService.subscribeOrUnsubscribe(strategistId, isSubscribe))
            .subscribe(subscribe => {
                this.unSubscribeMsg = subscribe['message'];
            });
    }
     /** * Close the unsubscribe pop up */
    close() {
        this.unSubscribeConfirm = false;
        this.unSubscribeMsg = undefined;
        this.getSubscriptionProfiles();
    }
}