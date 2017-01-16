import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { FilterPipe, SortPipe } from '../../pipes/FilterPipe';
/** Admin component */
import { ADMIN_ROUTE_PROVIDERS, AdminComponent, AdminDashboardComponent } from './admin.routes';
import { AdminLeftNavComponent } from '../../shared/leftnavigation/admin.leftnav';
/** Role component */
import {
    ROLE_ROUTER_PROVIDERS, RoleComponent, RoleListComponent,
    RoleDetailComponent, RoleViewComponent, RoleFilterComponent
} from './role/role.routes';
import { RoleTabNavComponent } from './role/shared/role.tabnav.component';
import { ReassignComponent } from './role/role.reassignuser.component';
/** Team component */
import {
    TEAM_ROUTER_PROVIDERS, TeamComponent, TeamListComponent,
    TeamDetailComponent, TeamViewComponent, TeamFilterComponent
} from './team/team.routes';
import { TeamReassignComponent } from './team/shared/team.bulkreassign.component';
import { TeamTabNavComponent } from './team/shared/team.tabnav.component';
import { TeamAdvisorsComponent } from './team/shared/teamadvisor.component';
import { TeamModelsComponent } from './team/shared/teammodel.component';
import { TeamPortfoliosComponent } from './team/shared/teamportfolio.component';
import { TeamUsersComponent } from './team/shared/teamusers.component';
import { TabSet } from '../../shared/tabs/tabset';
import { Tab } from '../../shared/tabs/tab';
/** User component */
import {
    USER_ROUTER_PROVIDERS, UserComponent, UserListComponent,
    UserDetailComponent, UserViewComponent, UserFilterComponent
} from './user/user.routes';
import { UserTabNavComponent } from './user/shared/user.tabnav.component';
/** Custodian component */
import {
    CUSTODIAN_ROUTER_PROVIDERS, CustodianComponent, CustodianListComponent,
    CustodianDetailComponent, CustodianViewComponent, CustodianFilterComponent
} from './custodian/custodian.routes';
import { CustodianTabNavComponent } from './custodian/shared/custodian.tabnav.component';
/** Preference Settings component */
import {
    PREFERENCESETTINGS_ROUTER_PROVIDERS, PreferenceSettingsComponent,
    FirmPreferences, AccountPreferences, CustodianPreferences,
    ModelPreferences, PortfolioPreferences, TeamPreferences
} from './preferencesettings/preferencesettings.routes';
import { DynamicControlComponent } from '../../shared/dynamicform/dynamicControl.component';
import { DynamicControlreadonlyComponent } from '../../shared/dynamicform/dynamicControlreadonly.component';
import { DynamicWrapperComponent } from '../../shared/dynamicform/dynamicwrapper.component';
import { LocationOptimizationComponent } from '../../shared/locationoptimization/locationoptimization.component';
import { PreferenceLeftNavComponent } from '../../shared/leftnavigation/preference.leftnav.component';
import { SortObjectsComponent } from '../../shared/sortobjects/sortobjects.component';
import { CommunityStrategistComponent } from '../../shared/communitystrategist/component.communitystrategist';
import { SecurityPreferenceComponent } from '../../shared/security/security.preference.component';
import { DndModule, DragDropService, DragDropConfig, DragDropSortableService } from 'ng2-dnd';
import { RedemptionFeeComponent } from '../../shared/redemptionfee/redemptionfee.component';

@NgModule({
    imports: [SharedModule, FormsModule, CommonModule, ReactiveFormsModule,
        ADMIN_ROUTE_PROVIDERS, USER_ROUTER_PROVIDERS, CUSTODIAN_ROUTER_PROVIDERS,
        ROLE_ROUTER_PROVIDERS, TEAM_ROUTER_PROVIDERS, PREFERENCESETTINGS_ROUTER_PROVIDERS, DndModule],
    /** Admin component */
    declarations: [AdminComponent, AdminDashboardComponent, AdminLeftNavComponent,
        /** User component */
        UserComponent, UserListComponent, UserDetailComponent,
        UserViewComponent, UserTabNavComponent, UserFilterComponent,
        /** Custodian component */
        CustodianTabNavComponent, CustodianFilterComponent, CustodianComponent,
        CustodianListComponent, CustodianDetailComponent, CustodianViewComponent,
        /** Role component */
        ReassignComponent, RoleTabNavComponent, RoleFilterComponent, RoleComponent,
        RoleListComponent, RoleDetailComponent, RoleViewComponent,
        /** Preference Settings component */
        FilterPipe, SortPipe, PreferenceSettingsComponent, FirmPreferences,
        LocationOptimizationComponent, DynamicControlComponent, DynamicControlreadonlyComponent,RedemptionFeeComponent,
        DynamicWrapperComponent, PreferenceLeftNavComponent, SortObjectsComponent,
        CommunityStrategistComponent, SecurityPreferenceComponent,
        AccountPreferences, CustodianPreferences, ModelPreferences, PortfolioPreferences, TeamPreferences,
        /** Team component */
        TeamComponent, TeamDetailComponent, TeamListComponent, TeamReassignComponent,
        TeamTabNavComponent, TeamAdvisorsComponent, TeamModelsComponent, TeamPortfoliosComponent,
        TeamUsersComponent, TabSet, Tab, TeamFilterComponent, TeamViewComponent],
    providers: [DndModule, DragDropService, DragDropConfig, DragDropSortableService]
})

export class AdminModule { }
