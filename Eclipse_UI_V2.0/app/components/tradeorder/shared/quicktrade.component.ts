
import { Component, ViewChild } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { BaseComponent } from '../../../core/base.component';
import { GridOptions, ColDef, CsvExportParams, MenuList, MenuItem } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { NotificationService } from '../../../core/customSubService';
import * as Util from '../../../core/functions';
import { TomService } from '../../../services/tom.service';
import { PortfolioAutoCompleteComponent } from '../../../shared/search/portfolio.autocomplete.component';
import { AccountsAutoCompleteComponent } from '../../../shared/search/account.autocomplete.component';
import { PortfolioService } from '../../../services/portfolio.service';
import { AccountService } from '../../../services/account.service';
import { IQuickTradeData } from '../../../models/tom';
import { SecurityService } from '../../../services/security.service';

@Component({
    selector: 'tradeorder-quicktrade',
    templateUrl: './app/components/tradeorder/shared/quicktrade.component.html'
})

export class QuickTradeComponent extends BaseComponent {
    public tradeFilterMethod: string;
    private actions: any[] = [];
    private placeHolder: string;
    private dollorsPlaceHolder: string;
    private placeHolderAction: string;
    private placeHolderShares: string;
    private isTradeActionSell: boolean = false;
    private showTradeType: boolean = true;
    private showDollor: boolean = true;
    //  private showSecuritySearch: boolean = true;
    private showSellSecuritySearch: boolean = false;
    private showBuySecuritySearch: boolean = true;
    private showShares: boolean = true;
    private showValidate: boolean = false;
    private quickTradeData: IQuickTradeData = <IQuickTradeData>{};

    buySecuritySuggessions: any;
    sellSecuritySuggessions: any;
    autocompleteSellResults: any[] = [];
    selectedBuySecurity: any;
    selectedSellSecurity: any;
    selectedSecurityId: number;
    selectedItem: any;
    selecetedItemIds: number[] = [];

    private accountId: number;
    private accountValue: number;
    private currentCash: number;
    private postTrade: number;
    private cashReserv: number;
    private modelName: string;
    private tickerSymbol: string;
    private LastPrice: number;
    private asof: Date;

    private showAccountsTab: boolean = false;
    private showPortfolioTab: boolean = false;
    private isSearchSelected: boolean = false;
    private accountAssets: any[] = [];
    private errorMessage: string;
    private showPriceTab: boolean = false;
    private isDisableDollor: boolean = true;
    private isDisableShare: boolean = true;
    private showErrorMessage: boolean = false;
    selectDollar: number = 0;
    selectShares: number = 0;
    private showTabs: boolean = false;

    @ViewChild(PortfolioAutoCompleteComponent) portfolioAutoCompleteComponent: PortfolioAutoCompleteComponent;
    @ViewChild(AccountsAutoCompleteComponent) accountsAutoCompleteComponent: AccountsAutoCompleteComponent;
    constructor(private _portfolioService: PortfolioService,
        private _accountService: AccountService, private _tomService: TomService, private _securityService: SecurityService, private _notifier: NotificationService) {
        super();
        this.setDefaults();
        this.tradeFilterMethod = 'account';
    }

    ngOnInit() {
        this.getActions();
    }

    /** Fires on radio button change  of account/portfolio*/
    radioBtnChange(selTradeFilterMethod) {
        this.tradeFilterMethod = selTradeFilterMethod;
        this.getActions();
        this.setDefaults();
        this.isSearchSelected = false;
        this.selectedSellSecurity = undefined;
        this.selectedBuySecurity = undefined;
        this.showErrorMessage = false;
        // as per new change for portfolio no buy/sell
        if (this.tradeFilterMethod == 'portfolio') {
            this.showBuySecuritySearch = false;
            this.showDollor = false;
            this.showShares = false;
        }

    }

    /** gets orderTypes */
    getActions() {

        if (this.tradeFilterMethod == 'account')
            Util.responseToObjects<any>(this._tomService.getAccountActions())
                .subscribe(model => {
                    this.actions = model;
                },
                error => {
                    console.log(error)
                });
        else {
            Util.responseToObjects<any>(this._tomService.getPortfolioActions())
                .subscribe(model => {

                    this.actions = model;
                },
                error => {
                    console.log(error)
                });

        }
        /** if user toggle between account and portfolio after selection account/portfolio */
        this.showTabs = false;

    }

    /** changing place holder text for Action change--Buy/Sell  */
    onActionChange(params) {
        if (params == ActionType.BUY) {
            this.placeHolder = "product or ticker to buy";
            this.dollorsPlaceHolder = "amount to buy"
            this.placeHolderAction = "Buy"
            this.placeHolderShares = "quantity to buy"
            this.isTradeActionSell = false
        }
        else if (params == ActionType.Sell) {
            this.placeHolder = "product or ticker to sell";
            this.dollorsPlaceHolder = "amount to sell"
            this.placeHolderAction = "Sell"
            this.placeHolderShares = "quantity to sell"
            this.isTradeActionSell = true
            this.showTradeType = false;
        }
        else if (params == ActionType.Sell_Rebalance) {
            this.dollorsPlaceHolder = "amount to sell"
        }
        else if (params == ActionType.Buy_Rebalance) {
            this.dollorsPlaceHolder = "amount to buy"
        }

        this.showControls(params)
    }

    /** Based on action Type controls will be shown */
    showControls(id) {
        if (id == ActionType.BUY) {
            this.showTradeType = true;
            this.showDollor = true;
            this.showBuySecuritySearch = true;
            this.showSellSecuritySearch = false;
            this.showShares = true;
            this.isTradeActionSell = false;
            this.showValidate = true;
        }
        else if (id == ActionType.Sell) {
            this.showTradeType = false;
            this.showDollor = true;
            this.showSellSecuritySearch = true;
            this.showBuySecuritySearch = false;
            this.showShares = true;
            this.isTradeActionSell = true;
            this.showValidate = true;
        }
        else if (id == ActionType.Rebalance) {
            this.showTradeType = true;
            this.showDollor = false;
            this.showSellSecuritySearch = false;
            this.showBuySecuritySearch = false;
            this.showShares = false;
            this.isTradeActionSell = false;
            this.showPriceTab = false;
            this.showValidate = false;
        }
        else if (id == ActionType.Buy_Rebalance) {
            this.showTradeType = true;
            this.showDollor = true;
            this.showSellSecuritySearch = false;
            this.showBuySecuritySearch = false;
            this.showShares = false;
            this.isTradeActionSell = false;
            this.showPriceTab = false;
            this.showValidate = false;
        }
        else if (id == ActionType.Sell_Rebalance) {
            this.showTradeType = false;
            this.showDollor = true;
            this.showSellSecuritySearch = false;
            this.showBuySecuritySearch = false;
            this.showShares = false;
            this.isTradeActionSell = false;
            this.showPriceTab = false;
            this.showValidate = false;
        }
        else if (id == ActionType.Liquidate) {
            this.showTradeType = false;
            this.showDollor = false;
            this.showSellSecuritySearch = false;
            this.showBuySecuritySearch = false;
            this.showShares = false;
            this.isTradeActionSell = false;
            this.showPriceTab = false;
            this.showValidate = false;
        }

    }

    /** To get selected item from auto complete */
    getSelectedItem(item) {
        this.selectedItem = item.value;
        this.selecetedItemIds.push(this.selectedItem.id)
        //console.log('selecteditem: ', this.selectedItem);
        this.getAccountDetails(this.selectedItem.id);
        this.isSearchSelected = true;
        this.getAssetsforAccount(this.selectedItem.id)

    }

    /** Trade Type change--.. */
    onTradeTypeChange(params) {


    }
    /**Buy Security Search */
    buySecuritySearch(event) {
        Util.responseToObjects<any>(this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED'))
            .subscribe(securitiesResult => {
                this.buySecuritySuggessions = securitiesResult.filter(a => a.isDeleted == 0);

            });
    }

    /** security selection */
    onBuySecuritySelect(item) {
        this.selectedSecurityId = item.id;
        this.tickerSymbol = item.symbol
        this.getPriceDetails(item.id)
        this.showPriceTab = true;
        this.showTabs = true;
    }

    /**sell Security Search */
    sellSecuritySearch(event) {
        Util.responseToObjects<any>(this._securityService.getSellSecurities(event.query, this.tradeFilterMethod, this.selecetedItemIds))
            .subscribe(securitiesResult => {
                this.sellSecuritySuggessions = securitiesResult;
                // this.selectedSellSecurity = securitiesResult.i;
                // console.log('this.sellSecuritySuggessions : ', this.sellSecuritySuggessions);
            });
    }

    /** Fires on security selection */
    onSellSecuritySelect(item) {
        this.selectedSecurityId = item.id;
        this.tickerSymbol = item.symbol
        this.getPriceDetails(item.id)
        this.showPriceTab = true;
        this.showTabs = true;

    }


    /** resetting quick trade to default */
    resetForm() {
        this.quickTradeData.actionId = 1;
        this.selectedSellSecurity = undefined;
        this.selectedBuySecurity = undefined;
        this.quickTradeData.dollarAmount = undefined;
        this.quickTradeData.percentage = undefined;
        this.quickTradeData.quantity = undefined;
        this.clearFilterAutoComplete();
        this.showErrorMessage = false;
        this.setDefaults();
        this.showTabs = false;
        this.selectDollar = 0;
        this.selectShares = 0;
        this.isSearchSelected = false;
    }

    /** To clear trade filters auto complete  */
    clearFilterAutoComplete() {
        if (this.tradeFilterMethod == 'portfolio')
            this.portfolioAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'account')
            this.accountsAutoCompleteComponent.selectedItem = undefined;
    }

    /** gets account details to populate account tab  */
    getAccountDetails(id) {
        if (this.tradeFilterMethod == 'account') {
            Util.responseToObject<any>(this._tomService.getAccountDetails(id))
                .subscribe(model => {
                    this.accountId = model.accountId;
                    this.accountValue = model.accountValue.totalValue;
                    this.currentCash = model.summarySection.cashAvailable;
                    this.cashReserv = model.summarySection.cashReserve;
                    this.showTabs = true;
                    this.showAccountsTab = true;
                    this.showPortfolioTab = false;
                },
                error => {
                    console.log(error)
                });
        }
        else {
            Util.responseToObject<any>(this._tomService.getPortfolioDetails(id))
                .subscribe(model => {
                    this.accountId = model.id;
                    this.accountValue = model.summary.AUM.totalValue;
                    this.currentCash = model.summary.AUM.totalCash.cash;
                    this.cashReserv = model.summary.AUM.totalCash.reserve;
                    this.modelName = model.general.modelName;
                    this.showAccountsTab = false;
                    this.showPortfolioTab = true;
                },
                error => {
                    console.log(error)
                });

        }
    }

    /** to validate trade on click of Valdate button  */
    validateTrade(_ValidateTrade: IQuickTradeData) {
        if (isNaN(_ValidateTrade.quantity))
            _ValidateTrade.quantity = 0;
        if (isNaN(_ValidateTrade.percentage))
            _ValidateTrade.percentage = 0;
        if (isNaN(_ValidateTrade.dollarAmount))
            _ValidateTrade.dollarAmount = 0;
        if (isNaN(_ValidateTrade.accountId))
            _ValidateTrade.accountId = 0;
        if (isNaN(_ValidateTrade.portfolioId))
            _ValidateTrade.portfolioId = 0;
        if (this.tradeFilterMethod == 'portfolio') {
            _ValidateTrade.portfolioId = this.selectedItem.id;
        }
        else if (this.tradeFilterMethod == 'account') {
            _ValidateTrade.accountId = this.selectedItem.id;
        }
        if (this.selectedSecurityId != undefined || this.selectedSecurityId != null)
            _ValidateTrade.securityId = this.selectedSecurityId;
        else
            _ValidateTrade.securityId = 0;
        // console.log(JSON.stringify(_ValidateTrade))
        Util.responseToObject<any>(this._tomService.validateTrade(_ValidateTrade))
            .subscribe(model => {
                //  post trade values will be calculated                
                this.postTrade = model.cashValuePostTrade;
                //this.calculatePostTradeVal(_ValidateTrade.actionId)
            },
            error => {

                console.log(error)
                this.errorMessage = error.message;
                this.showErrorMessage = true;
            });

    }

    /** save trade on click of Add button  */
    saveTrade(_tradeSave: IQuickTradeData) {
        this.showErrorMessage = false;
        if (isNaN(_tradeSave.quantity))
            _tradeSave.quantity = 0;
        if (isNaN(_tradeSave.percentage))
            _tradeSave.percentage = 0;
        if (isNaN(_tradeSave.dollarAmount))
            _tradeSave.dollarAmount = 0;
        if (isNaN(_tradeSave.accountId))
            _tradeSave.accountId = 0;
        if (isNaN(_tradeSave.portfolioId))
            _tradeSave.portfolioId = 0;
        if (this.tradeFilterMethod == 'portfolio') {
            _tradeSave.portfolioId = this.selectedItem.id;
        }
        else if (this.tradeFilterMethod == 'account') {
            _tradeSave.accountId = this.selectedItem.id;
        }
        if (this.selectedSecurityId != undefined || this.selectedSecurityId != null)
            _tradeSave.securityId = this.selectedSecurityId;
        else
            _tradeSave.securityId = 0;
        //console.log(JSON.stringify(_tradeSave));
        Util.responseToObjects<any>(this._tomService.saveTrade(_tradeSave))
            .subscribe(model => {
                /**resetting screen back to normal */
                this.resetForm();
                this._notifier.ordersNotify.emit({ action: 'Refresh' });
            },
            error => {
                console.log(error.message);
                console.log('err', error)
            });
    }

    /** get assest tab details for quicktrade */
    getAssetsforAccount(id) {
        if (this.tradeFilterMethod == 'account') {
            Util.responseToObject<any>(this._tomService.getAssetsforAccount(id))
                .subscribe(model => {
                    this.accountAssets = model;
                },
                error => {
                    console.log(error)
                });
        }
        else {
            Util.responseToObject<any>(this._tomService.getAssetsforPortfolio(id))
                .subscribe(model => {
                    this.accountAssets = model;
                },
                error => {
                    console.log(error)
                });

        }
    }

    /** get price tab details for selected Security */
    getPriceDetails(id) {
        Util.responseToObject<any>(this._tomService.getPrice(id))
            .subscribe(model => {
                this.LastPrice = model.price;
                this.asof = model.priceDate;
            },
            error => {
                console.log(error)
            });

    }

    /** setting defaults to ui visible */
    setDefaults() {
        this.quickTradeData.actionId = 1;
        this.quickTradeData.isSendImmediately = false;
        this.showSellSecuritySearch = false;
        this.placeHolderAction = "Buy"       
        this.showErrorMessage = false;
        this.dollorsPlaceHolder = "amount to buy"
        this.placeHolderAction = "Buy"
        this.placeHolderShares = "quantity to buy"
        if (this.tradeFilterMethod == 'portfolio') {
            this.showBuySecuritySearch = false;
            this.showShares = false;
            this.showDollor = false;
              this.showValidate =false;
        }
        else {
            this.showBuySecuritySearch = true;
            this.showShares = true;
            this.showDollor = true;
           this.showValidate = true;
          
        }
    }
    /** when selecting dollars to trade need to disable shares input */
    disableShares(val) {
        this.isDisableShare = true;
        this.isDisableDollor = false;
        this.selectDollar = val;
        this.quickTradeData.quantity = null;

    }
    /** when selecting share to trade need to disable dollar input */
    disableDollor(val) {
        this.isDisableShare = false;
        this.isDisableDollor = true;
        this.selectShares = val;
        this.quickTradeData.dollarAmount = null;
    }

    /** calculating post trade values*/
    calculatePostTradeVal(id) {
        if (id == ActionType.BUY) {
            this.postTrade = (+this.currentCash) - (+this.quickTradeData.dollarAmount);

        }
        else if (id == ActionType.Sell) {
            this.postTrade = (+this.currentCash) + (+this.quickTradeData.dollarAmount);
        }
    }



}