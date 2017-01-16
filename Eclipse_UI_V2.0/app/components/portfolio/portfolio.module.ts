import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import { FormsModule } from '@angular/forms';
import {PORTFOLIO_ROUTER_PROVIDERS} from './portfolio.routes'
import {SharedModule} from '../../shared/shared.module';

import { PortfolioComponent } from './portfolio.component';
import { PortfolioDashboardComponent }  from './dashboard/dashboard.component';
import { PortfolioListComponent }  from './list/portfoliolist.component';
import { PortfoliosFilterComponent }  from './list/portfoliofilter.component';
import { PortfolioDetailComponent }  from './detail/portfoliodetail.component';
import { PortfolioViewComponent }  from './view/portfolioview.component';
import { PortfolioTabNavComponent }  from './shared/portfolio.tabnav.component';
import { PortfolioViewFilterComponent }  from './view/portfolioviewfilter.component';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';
import { ViewsService }  from '.././../services/views.service';
import { AccountService } from '../../services/account.service';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, PORTFOLIO_ROUTER_PROVIDERS],
    declarations: [PortfolioTabNavComponent, PortfolioComponent, PortfolioDashboardComponent, PortfolioListComponent,
        PortfoliosFilterComponent, PortfolioDetailComponent, PortfolioViewComponent, PortfolioViewFilterComponent],
    providers: [ConfirmDeactivateGuard, ViewsService,AccountService]
})

export class PortfolioModule { }