import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreferenceSettingsComponent } from './preferencesettings.component';
import { FirmPreferences } from './firmpref/firmpreference.component';
import { AccountPreferences } from './accountpref/accountpreference.component';
import { CustodianPreferences } from './custodianpref/custodianpreference.component';
import { ModelPreferences } from './modelpref/modelpreference.component';
import { PortfolioPreferences } from './portfoliopref/portfoliopreference.component';
import { TeamPreferences } from './teampref/teampreference.component';
export {
    PreferenceSettingsComponent, FirmPreferences, AccountPreferences,
    CustodianPreferences, ModelPreferences, PortfolioPreferences, TeamPreferences
}

export const PreferenceSettingsRoutes: Routes = [
    { path: 'preferencesettings', redirectTo: 'preferencesettings/firm' },
    {
        path: 'preferences',
        component: PreferenceSettingsComponent,
        children:
        [
            { path: 'firm', component: FirmPreferences },
            { path: 'account', component: AccountPreferences },
            { path: 'account/:accountId', component: AccountPreferences },
            { path: 'custodian', component: CustodianPreferences },
            { path: 'custodian/:Id', component: CustodianPreferences },
            { path: 'model', component: ModelPreferences },
            { path: 'model/:modelId', component: ModelPreferences },
            { path: 'portfolio', component: PortfolioPreferences },
            { path: 'portfolio/:portfolioId', component: PortfolioPreferences },
            { path: 'team', component: TeamPreferences },
            { path: 'team/:teamId', component: TeamPreferences },
        ]
    }
];

export const PREFERENCESETTINGS_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(PreferenceSettingsRoutes);
