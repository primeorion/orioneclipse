import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as Util from '../../../core/functions';
import { TacticalService } from '../../../services/tactical.service';
import {
    ITacticalPortfolio, ITPortfolio, ITPortfolioModel, ITTSecurity, ITTAccount, ITTTaxlot,
    ITTGeneral, ITTSleeved, ITTLevel1,
    IIdName, IPortfolioCashSummary, IPortfolioCash, IAccountCash
} from '../../../models/tactical';

@Component({
    selector: 'eclipse-tactical-trade',
    templateUrl: './app/components/tradeorder/tactical/tacticaltrade.component.html'
})
export class TacticalTradeComponent {
    addSecurtyPopup: boolean = false;
    level: number = 0;
    portfolioData: ITacticalPortfolio;
    portfolioSecurities: ITTSecurity[];
    unassignedSecurities: ITTSecurity[];
    securities: IIdName[];
    currentCash: number = 0;
    cashSummary: IPortfolioCashSummary;
    portfolioId: number;
    constructor(private _router: Router, private activatedRoute: ActivatedRoute,
        private _tacticalService: TacticalService) {
        this.portfolioData = <ITacticalPortfolio>{
            portfolioInfo: <ITPortfolio>{}, model: <ITPortfolioModel[]>[]
        };
        // this.portfolioData.model.generalInfo.sleeveInfo = <ITTSleeved>{};
        this.portfolioSecurities = <ITTSecurity[]>[];
        this.unassignedSecurities = <ITTSecurity[]>[];
        this.securities = <IIdName[]>[];
        this.portfolioId = Util.getRouteParam<number>(activatedRoute, 'portfolioId');
        this.cashSummary = <IPortfolioCashSummary>{
            portfolioCashSummary: <IPortfolioCash>{},
            accountCashSummary: <IAccountCash[]>[]
        }
    }

    ngOnInit() {
        this.loadTacticalPortfolio();
        this.loadPortfolioSecurities();
        this.loadUnassignedSecurities(this.portfolioId);
        this.loadCashSummary();
    }

    loadTacticalPortfolio(portfolioId: number = 1, accountId: number = 0) {
        Util.responseToObject<any>(this._tacticalService.getTacticalPortfolio(portfolioId, accountId))
            .subscribe(model => {
                console.log('Tactical Portfolio 1: ', model);
                // model.model = model.model[0]; // TODO: need to change
                // model.model.generalInfo = model.model.genearalInfo;  // TODO: need to change
                this.portfolioData = model;
                // this.portfolioData.portfolioInfo = model.portfolioInfo;
                // this.portfolioData.model.generalInfo = model.model[0].generalInfo;
                // console.log('Tactical Portfolio 2: ', this.portfolioData);
            },
            error => {
                this.portfolioData = <ITacticalPortfolio>{};
            });
    }

    loadPortfolioSecurities(portfolioId: number = 1, securitysetId: number = 1, exclude = false) {
        Util.responseToObjects<ITTSecurity>(this._tacticalService.getPortfolioSecurities(portfolioId, securitysetId, exclude))
            .subscribe(models => {
                console.log('Portfolio Securities: ', models);
                if (models.length == 0) {
                    models = <ITTSecurity[]>[
                        {
                            "id": 14612,
                            "securityName": "Agilent Technologies Inc",
                            "tradeOrderAction": null,
                            "tradeOrderShares": null,
                            "tradeOrderRedemptionFee": 100,
                            "tradeCost": null,
                            tradeOrderPrice: 150,
                            "tradeOrderAmount": null,
                            tradeOrderHoldUntil: null,
                            "postTradeShares": null,
                            "postTradeAmount": 250,
                            "postTradePer": null,
                            "modelTargetShares": 0,
                            "modelTargetAmount": 0,
                            "modelTargetPer": 0,
                            "currentShares": 25,
                            "currentAmount": 250,
                            "currentPer": 8.8809946714032,
                            "gainLossCostShortTerm": 800,
                            "gainLossCostLongTerm": 0,
                            "gainAmount": 0,
                            "gainPer": 0,
                            "tradeGain": 0,
                            "commentsTradeReason": "test Reason",
                            "commentsMessage": "Test message",
                            isSMA: false,
                            "exclude": true
                        },
                        {
                            "id": 14613,
                            "securityName": "Sprint Corporation",
                            "tradeOrderAction": null,
                            "tradeOrderShares": null,
                            "tradeOrderRedemptionFee": 100,
                            "tradeCost": null,
                            tradeOrderPrice: 150,
                            "tradeOrderAmount": null,
                            tradeOrderHoldUntil: null,
                            "postTradeShares": null,
                            "postTradeAmount": 225,
                            "postTradePer": null,
                            "modelTargetShares": 0,
                            "modelTargetAmount": 0,
                            "modelTargetPer": 0,
                            "currentShares": 25,
                            "currentAmount": 225,
                            "currentPer": 7.9928952042629,
                            "gainLossCostShortTerm": 0,
                            "gainLossCostLongTerm": 0,
                            "gainAmount": 0,
                            "gainPer": 0,
                            "tradeGain": 0,
                            "commentsTradeReason": "test Reason",
                            "commentsMessage": "Test message",
                            isSMA: false,
                            "exclude": true
                        },
                        {
                            "id": 14615,
                            "securityName": "Genpact Ltd",
                            "tradeOrderAction": null,
                            "tradeOrderShares": null,
                            "tradeOrderRedemptionFee": 100,
                            "tradeCost": null,
                            tradeOrderPrice: 150,
                            "tradeOrderAmount": null,
                            tradeOrderHoldUntil: null,
                            "postTradeShares": null,
                            "postTradeAmount": 400,
                            "postTradePer": null,
                            "modelTargetShares": 0,
                            "modelTargetAmount": 0,
                            "modelTargetPer": 0,
                            "currentShares": 25,
                            "currentAmount": 400,
                            "currentPer": 14.2095914742451,
                            "gainLossCostShortTerm": 0,
                            "gainLossCostLongTerm": 0,
                            "gainAmount": 0,
                            "gainPer": 0,
                            "tradeGain": 0,
                            "commentsTradeReason": "test Reason",
                            "commentsMessage": "Test message",
                            isSMA: false,
                            "exclude": true
                        },
                        {
                            "id": 14616,
                            "securityName": "Barnes Group Inc",
                            "tradeOrderAction": null,
                            "tradeOrderShares": null,
                            "tradeOrderRedemptionFee": 100,
                            "tradeCost": null,
                            tradeOrderPrice: 150,
                            "tradeOrderAmount": null,
                            tradeOrderHoldUntil: null,
                            "postTradeShares": null,
                            "postTradeAmount": 1940,
                            "postTradePer": null,
                            "modelTargetShares": 0,
                            "modelTargetAmount": 0,
                            "modelTargetPer": 0,
                            "currentShares": 20,
                            "currentAmount": 1940,
                            "currentPer": 68.9165186500888,
                            "gainLossCostShortTerm": 0,
                            "gainLossCostLongTerm": 0,
                            "gainAmount": 0,
                            "gainPer": 0,
                            "tradeGain": 0,
                            "commentsTradeReason": "test Reason",
                            "commentsMessage": "Test message",
                            isSMA: false,
                            "exclude": false
                        }
                    ];
                }
                this.portfolioSecurities = models;
            },
            error => {
                this.portfolioSecurities = <ITTSecurity[]>[];
            });
    }

    loadUnassignedSecurities(portfolioId: number = 1) {
        Util.responseToObjects<ITTSecurity>(this._tacticalService.getUnassignedSecurities(portfolioId))
            .subscribe(models => {
                console.log('Unassigned Securities: ', models);
                this.unassignedSecurities = models;
            },
            error => {
                this.unassignedSecurities = [];
            });
    }

    loadSecurityAccounts(portfolioId: number = 4, securityId: number = 14613, exclude = false) {
        Util.responseToObjects<ITTAccount>(this._tacticalService.getSecurityAccounts(portfolioId, securityId, exclude))
            .subscribe(models => {
                console.log('Security Accounts: ', models);
                this.updateSecurityListAccounts(securityId, models);
            },
            error => {
                this.updateSecurityListAccounts(securityId, <ITTAccount[]>[]);
            });
    }

    loadAccountTaxlots(portfolioId: number = 1, securityId: number = 14612, accountId: number = 1) {
        Util.responseToObjects<ITTTaxlot>(this._tacticalService.getAccountTaxlots(portfolioId, securityId, accountId))
            .subscribe(models => {
                console.log('Account Taxlots: ', models);
                this.updateSecurityListTaxlots(securityId, accountId, models);
            },
            error => {
                this.updateSecurityListTaxlots(securityId, accountId, <ITTTaxlot[]>[]);
            });
    }

    loadCashSummary(portfolioId: number = 1) {
        Util.responseToObject<IPortfolioCashSummary>(this._tacticalService.getCashSummary(portfolioId))
            .subscribe(model => {
                console.log('Portfolio Cash Summary: ', model);
                this.cashSummary = model;
                if (model.accountCashSummary != undefined && model.accountCashSummary.length > 0) {
                    this.currentCash = this.sumArr(model.accountCashSummary, 'currentValue');
                    let account = <IAccountCash>{
                        accountName: "Total",
                        currentValue: this.currentCash,
                        reserveValue: this.sumArr(model.accountCashSummary, 'reserveValue'),
                        totalValue: this.sumArr(model.accountCashSummary, 'totalValue'),
                        targetValue: this.sumArr(model.accountCashSummary, 'targetValue'),
                        postTradeValue: this.sumArr(model.accountCashSummary, 'postTradeValue'),
                        needsValue: this.sumArr(model.accountCashSummary, 'needsValue')
                    };
                    this.cashSummary.accountCashSummary.push(account);
                }
            },
            error => {
                this.cashSummary = <IPortfolioCashSummary>{};
            });
    }

    sumArr = function (models, prop) {
        var total = 0
        for (let i = 0, _len = this.length; i < _len; i++) {
            total += models[i][prop]
        }
        return total
    }

    loadSecurities(portfolioId: number = 1) {
        Util.responseToObjects<IIdName>(this._tacticalService.getSecurities(portfolioId))
            .subscribe(models => {
                console.log('Securities List: ', models);
                this.securities = models;
            },
            error => {
                this.securities = [];
            });
    }

    private updateSecurityListAccounts(securityId, accounts) {
        let security = this.portfolioSecurities.find(item => item.id == securityId);
        if (security != undefined) {
            security.accounts = accounts;
        }
    }

    private updateSecurityListTaxlots(securityId, accountId, taxlots) {
        let security = this.portfolioSecurities.find(item => item.id == securityId);
        if (security != undefined && security.accounts != undefined && security.accounts.length > 0) {
            let account = security.accounts.find(item => item.id == accountId);
            if (account != undefined) {
                account.taxlots = taxlots;
            }
        }
    }

    closePopup() {
        this.addSecurtyPopup = false;
    }

    onContinueClick() {
        //TODO:API integration
        window.location.reload();
    }
}

