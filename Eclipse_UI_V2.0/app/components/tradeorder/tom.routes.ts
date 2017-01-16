import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { CanDeactivateGuard } from '../../core/interfaces';
import { AccountService } from '../../services/account.service';
import { TradeOrderComponent } from './tradeorder.component';
import { TradeOrderListComponent } from './list/tradeorderlist.component';
import { GlobalTradesComponent } from './globaltrades/tradeorder.globaltrades';
import { CashNeedComponent } from './cashneed/cashneed.component';
import { TradeFileComponent } from './tradefile/tradefile.component';
import { TacticalTradeComponent } from './tactical/tacticaltrade.component';
import { ProratedCashComponent } from './proratedcash/proratedcash.component';
import { TradeToTargetComponent } from './tradetotarget/tradetotarget.component';
import { RaiseCashComponent } from './raisecash/raisecash.component';
import { SpendCashComponent } from './spendcash/spendcash.component';
import { TLHComponent } from './tlh/tradeorder.tlh';

export const TomRoutes: Routes = [
    {
        path: '',
        component: TradeOrderComponent,
        children: [
            {
                path: '',
                children: [
                    { path: 'list', component: TradeOrderListComponent, canDeactivate: [CanDeactivateGuard] },
                    { path: 'awaiting', component: TradeOrderListComponent, canDeactivate: [CanDeactivateGuard] },
                    { path: 'globaltrades', component: GlobalTradesComponent },
                    { path: 'globaltrades/:type/:ids', component: GlobalTradesComponent },
                    { path: 'tickerswap', component: GlobalTradesComponent },
                    { path: 'tickerswap/:type/:ids', component: GlobalTradesComponent },
                    { path: 'tradetotarget', component: TradeToTargetComponent },
                    { path: 'tradetotarget/:type/:ids', component: TradeToTargetComponent },
                    { path: 'cashneed', component: CashNeedComponent },
                    { path: 'cashneed/:portfolioId', component: CashNeedComponent },
                    { path: 'tradefile', component: TradeFileComponent },
                    { path: 'proratedcash', component: ProratedCashComponent },
                    { path: 'tradetotarget', component: TradeToTargetComponent },
                    { path: 'raisecash', component: RaiseCashComponent },
                    { path: 'tactical', component: TacticalTradeComponent },
                    { path: 'tactical/:portfolioId', component: TacticalTradeComponent },
                    { path: 'spendcash', component: SpendCashComponent },
                    { path: 'tlh', component: TLHComponent }
                ]
            }
        ]
    }
];

export const TOM_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(TomRoutes);
