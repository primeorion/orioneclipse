import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioDashboardComponent }  from './dashboard/dashboard.component';
import { PortfolioListComponent }  from './list/portfoliolist.component';
import { PortfoliosFilterComponent }  from './list/portfoliofilter.component';
import { PortfolioDetailComponent }  from './detail/portfoliodetail.component';
import { PortfolioViewComponent }  from './view/portfolioview.component';
import { ConfirmDeactivateGuard } from './shared/confirm.deactivatedguard';
import { PortfolioViewFilterComponent }  from './view/portfolioviewfilter.component';
import { AccountService } from '../../services/account.service';

export const PortfolioRoutes: Routes = [
    {
        path: '',
        component: PortfolioComponent,
        canActivate: [AuthGuard],
        children:
        [
            {
                path: '',
                children: [
                    { path: 'dashboard', component: PortfolioDashboardComponent },
                    { path: 'list', component: PortfolioListComponent , canDeactivate: [ConfirmDeactivateGuard]},
                    { path: 'list/:id', component: PortfolioListComponent , canDeactivate: [ConfirmDeactivateGuard]},
                    { path: 'filter/:id', component: PortfoliosFilterComponent },
                    { path: 'add', component: PortfolioDetailComponent },
                    { path: 'edit/:id', component: PortfolioDetailComponent },
                    { path: 'view', component: PortfolioViewComponent },
                    { path: 'view/:id', component: PortfolioViewComponent },
                    { path: 'search/:id', component: PortfolioViewFilterComponent },
                ]
            }
        ]
    }
];


export const PORTFOLIO_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(PortfolioRoutes);
