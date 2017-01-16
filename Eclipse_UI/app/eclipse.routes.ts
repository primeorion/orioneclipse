import { provideRouter, RouterConfig } from '@angular/router';

import { EclipseComponent } from './eclipse.component';
import { PortfolioRoutes, PORTFOLIO_ROUTER_PROVIDERS } from './components/portfolio/portfolio.routes';
import { OverviewComponenet } from './components/dashboard/overview.component';
//import { AccountComponent } from './components/account/account.component';
import { AccountRoutes, ACCOUNT_ROUTER_PROVIDERS } from './components/account/account.routes';
//import { HoldingComponent } from './components/holding/holding.component';
import { HoldingRoutes, HOLDING_ROUTER_PROVIDERS } from './components/holding/holding.routes';
import { TradeOrderComponent } from './components/tradeorder/tradeorder.component';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { ModelComponent } from './components/model/model.component';
import { TokenHelperService } from './core/tokenhelper.service';
import { SessionHelper } from './core/session.helper';
import { AuthGuard }             from './core/auth.guard';
import { AuthService }             from './core/auth.service';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { TeamComponent1 } from './components/admin/team/teamold.component';
import { TeamRoutes, TEAM_ROUTER_PROVIDERS } from './components/admin/team/team.routes';
// import { RoleComponent1 } from './components/admin/role/roleold.component';
import { RoleRoutes, ROLE_ROUTER_PROVIDERS } from './components/admin/role/role.routes';
//import { UserComponent1 } from './components/admin/user/userold.component';
import { UserRoutes, USER_ROUTER_PROVIDERS } from './components/admin/user/user.routes';
//import { CustodianComponent1 } from './components/admin/custodian/custodianold.component';
import { CustodianRoutes, CUSTODIAN_ROUTER_PROVIDERS } from './components/admin/custodian/custodian.routes';

import { SecurityComponent } from './components/security/security.component';
import { SecuritytDashboardComponent } from './components/security/dashboard/dashboard.component';
import { AssetMaintenanceComponent } from './components/security/assetmaintenance/asset.maintenance.component';
import { CategoryMaintenanceComponent } from './components/security/assetmaintenance/categorymaintenance/category.maintenance.component';
import { ClassMaintenanceComponent } from './components/security/assetmaintenance/classmaintenance/class.maintenance.component';
import { SubClassMaintenanceComponent } from './components/security/assetmaintenance/subclassmaintenance/subclass.maintenance.component';
import { SecurityViewComponent } from './components/security/securitymaintenance/view/security.view.component';
import { SecurityDetailComponent } from './components/security/securitymaintenance/detail/security.detail.component';
import { SecurityMaintenanceComponent } from './components/security/securitymaintenance/security.maintenance.component';
import { SecuritySetMaintenanceComponent } from './components/security/securitysetmaintenance/securityset.maintenance.component';
import { SecuritySetViewComponent } from './components/security/securitysetmaintenance/view/securityset.view.component';
import { RebalanceComponent } from './components/rebalance/rebalance.component';
import { PrefSettingsComponent } from './components/admin/preferencesettings/prefsettings.component';
import { FirmPreferences } from './components/admin/preferencesettings/firmpref/firmpreference.component';
import { CustodianPreferences } from './components/admin/preferencesettings/custodianpref/custodianpreference.component';
import { TeamPreferences } from './components/admin/preferencesettings/teampref/teampreference.component';
import { ModelPreferences } from './components/admin/preferencesettings/modelpref/modelpreference.component';
import { PortfolioPreferences } from './components/admin/preferencesettings/portfoliopref/portfoliopreference.component';
import { AccountPreferences } from './components/admin/preferencesettings/accountpref/accountpreference.component';
import { ConfirmDeactivateGuard } from './components/portfolio/shared/confirm.deactivatedguard';
import { SleeveComponent } from './components/sleeve/sleeve.component';
export const EclipseRoutes: RouterConfig = [
    { path: 'eclipse', redirectTo: 'eclipse/dashboard', terminal: true },
    {
        path: 'eclipse',
        component: EclipseComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'dashboard', component: OverviewComponenet },
            ...PortfolioRoutes,
            // { path: 'account', component: AccountComponent },
            ...AccountRoutes,
            // { path: 'holding', component: HoldingComponent },
            ...HoldingRoutes,
            { path: 'tradeorder', component: TradeOrderComponent },
            {
                path: 'admin',
                component: AdminComponent,
                children:
                [
                    { path: 'dashboard', component: AdminDashboardComponent },
                  //  { path: 'team', canActivate: [AuthGuard], component: TeamComponent1 },
                    ...TeamRoutes,
                    //{ path: 'role', component: RoleComponent1 },
                    ...RoleRoutes,
                    // { path: 'user', component: UserComponent1 },
                    ...UserRoutes,
                    //{ path: 'custodian', component: CustodianComponent1 },
                    ...CustodianRoutes,
                    {
                        path: 'preferences',
                        component: PrefSettingsComponent,
                        children:
                        [
                            { path: 'firm', component: FirmPreferences },
                            { path: 'custodian', component: CustodianPreferences },
                            { path: 'custodian/:Id', component: CustodianPreferences },
                            { path: 'team', component: TeamPreferences },
                            { path: 'team/:teamId', component: TeamPreferences },
                            { path: 'model', component: ModelPreferences },
                            { path: 'portfolio', component: PortfolioPreferences },
                            { path: 'portfolio/:portfolioId', component: PortfolioPreferences },
                            { path: 'account', component: AccountPreferences },
                            { path: 'account/:accountId', component: AccountPreferences }
                        ]
                    }
                ]
            },
            {
                path: 'security',
                component: SecurityComponent,
                children:
                [
                    { path: 'dashboard', component: SecuritytDashboardComponent },
                    {
                        path: 'asset',
                        component: AssetMaintenanceComponent,
                        children:
                        [
                            { path: 'category', component: CategoryMaintenanceComponent },
                            { path: 'class', component: ClassMaintenanceComponent },
                            { path: 'subclass', component: SubClassMaintenanceComponent }
                        ]
                    },
                    {
                        path: 'maintenance',
                        component: SecurityMaintenanceComponent
                    },
                    {
                        path: 'securitySet',
                        component: SecuritySetMaintenanceComponent
                    }
                ]
            },

            { path: 'model', component: ModelComponent },
            { path: 'rebalance', component: RebalanceComponent },
            { path: 'sleeve', component: SleeveComponent }
        ]
    }
];

export const AUTH_PROVIDERS = [AuthGuard, AuthService, ConfirmDeactivateGuard];
export const DASHBOARD_ROUTER_PROVIDERS = [
    provideRouter(EclipseRoutes), SessionHelper, TokenHelperService, USER_ROUTER_PROVIDERS,
    ROLE_ROUTER_PROVIDERS, CUSTODIAN_ROUTER_PROVIDERS, TEAM_ROUTER_PROVIDERS,
    HOLDING_ROUTER_PROVIDERS, PORTFOLIO_ROUTER_PROVIDERS
];
