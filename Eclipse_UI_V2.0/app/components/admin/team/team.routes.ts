import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TeamService } from '../../../services/team.service';
import { TeamComponent } from './team.component';
import { TeamListComponent } from './list/teamlist.component';
import { TeamDetailComponent } from './detail/teamdetail.component';
import { TeamFilterComponent } from './view/teamfilter.component';
import { TeamViewComponent } from './view/teamview.component';
export {
    TeamComponent, TeamListComponent,
    TeamDetailComponent, TeamViewComponent, TeamFilterComponent
}

export const TeamRoutes: Routes = [
    { path: 'team', redirectTo: 'team/list' },
    {
        path: 'team',
        component: TeamComponent,
        children:
        [
            { path: 'list', component: TeamListComponent },
            { path: 'add', component: TeamDetailComponent },
            { path: 'edit/:id', component: TeamDetailComponent },
            { path: 'filter/:id', component: TeamFilterComponent },
            { path: 'view', component: TeamViewComponent },
            { path: 'view/:id', component: TeamViewComponent },
            { path: 'filter/:id', component: TeamFilterComponent }
        ]
    }
];

export const TEAM_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(TeamRoutes);
