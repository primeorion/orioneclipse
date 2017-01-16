import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { TOM_ROUTER_PROVIDERS } from './tom.routes'
import { AgGridModule } from 'ag-grid-ng2/main';
import { SharedModule } from '../../shared/shared.module';
import { TomService } from '../../services/tom.service';
import { TradeToolsService } from '../../services/tradetools.service';
import { PortfolioService } from '../../services/portfolio.service';
import { AccountService } from '../../services/account.service';
import { ModelService } from '../../services/model.service';
import { SleeveService } from '../../services/sleeves.service';
import { ViewsService } from '.././../services/views.service';
import { SpendCashService } from '../../services/spendcash.service';
import { SecurityService } from '../../services/security.service';
import { TacticalService } from '../../services/tactical.service';
import { TradeOrderComponent } from './tradeorder.component';
import { TradeOrderListComponent } from './list/tradeorderlist.component';
import { TradeOrderTabNavComponent } from './shared/tradeorder.tabnav.component';
import { TradeOrderFilterComponent } from './shared/tradeorder.tradefilter.component';
import { QuickTradeComponent } from './shared/quicktrade.component';
import { ModelToleranceComponent } from './shared/modeltolerance.component';
import { GroupBarChartCompnent } from '../../shared/charts/groupchart/groupbarchart.component';
import { ModelAnalysisComponent } from './shared/modelanalysis.component';
import { GlobalTradesComponent } from './globaltrades/tradeorder.globaltrades';
import { CashNeedComponent } from './cashneed/cashneed.component';
import { PortfolioAutoCompleteComponent } from '../../shared/search/portfolio.autocomplete.component';
import { SleevePfAutoCompleteComponent } from '../../shared/search/sleeveportfolio.autocomplete.component';
import { AccountsAutoCompleteComponent } from '../../shared/search/account.autocomplete.component';
import { SleevesAutoCompleteComponent } from '../../shared/search/sleeves.autocomplete.component';
import { ModelAutoCompleteComponent } from '../../shared/search/model.autocomplete.component';
import { TradeGroupsPortfolioAutoCompleteComponent } from '../../shared/search/tradegroupsportfolio.autocomplete.component';
import { TradeGroupsAccountAutoCompleteComponent } from '../../shared/search/tradegroupsaccount.autocomplete.component';
import { TradeLeftNavComponent } from './shared/leftnav.component';
import { NotificationService } from '../../core/customSubService';
import { CanDeactivateGuard } from '../../core/interfaces';
import { TradeFileComponent } from './tradefile/tradefile.component';
import { ProratedCashComponent } from './proratedcash/proratedcash.component';
import { TradeToTargetComponent } from './tradetotarget/tradetotarget.component';
import { RaiseCashComponent } from './raisecash/raisecash.component';
import { TacticalTradeComponent } from './tactical/tacticaltrade.component';
import { TacticalSecuritiesComponent } from './tactical/tactical.securities.component';
import { TacticalAccountsComponent } from './tactical/tactical.accounts.component';
import { TacticalTaxlotsComponent } from './tactical/tactical.taxlots.component';
import { ActionMenuComponent } from './tactical/shared/actionmenu.component';
import { SpendCashComponent } from './spendcash/spendcash.component';
import { TacticalTradesPopupComponent } from './shared/tacticaltradespopup.component';
import { TradeToolsBusinessObjects } from '../../businessobjects/tradetools.businessobjects';
import { TLHComponent } from './tlh/tradeorder.tlh';

@NgModule({
        imports: [SharedModule, FormsModule, CommonModule, TOM_ROUTER_PROVIDERS, AgGridModule],
        declarations: [TradeOrderComponent, TradeOrderListComponent, TradeOrderTabNavComponent,
                TradeOrderFilterComponent, QuickTradeComponent, ModelToleranceComponent,
                ModelAnalysisComponent, GlobalTradesComponent, CashNeedComponent, SpendCashComponent, SleevePfAutoCompleteComponent,
                PortfolioAutoCompleteComponent, AccountsAutoCompleteComponent, ModelAutoCompleteComponent, SleevesAutoCompleteComponent,
                TradeGroupsAccountAutoCompleteComponent, TradeGroupsPortfolioAutoCompleteComponent,
                TradeLeftNavComponent, TradeFileComponent, ProratedCashComponent, TradeToTargetComponent,
                GroupBarChartCompnent, RaiseCashComponent, TacticalTradesPopupComponent, TLHComponent,
                TacticalTradeComponent, TacticalSecuritiesComponent, TacticalAccountsComponent, TacticalTaxlotsComponent,
                ActionMenuComponent],
        providers: [TomService, ViewsService, TradeToolsService, PortfolioService, SpendCashService, TradeToolsBusinessObjects,
                AccountService, ModelService, SleeveService, SecurityService, NotificationService, CanDeactivateGuard, TacticalService]
})

export class ToMModule { }
