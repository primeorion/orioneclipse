import { provideRouter, RouterConfig } from '@angular/router';
import { AuthGuard } from '../../../core/auth.guard';
import { TeamService } from '../../../services/team.service';
import { TeamComponent } from './team.component';
import { TeamListComponent }  from './list/teamlist.component';
import { TeamDetailComponent }  from './detail/teamdetail.component';
import { TeamFilterComponent }  from './view/teamfilter.component';
import { TeamViewComponent }  from './view/teamview.component';

export const TeamRoutes: RouterConfig = [
    { path: 'team', redirectTo: 'team/list', terminal: true },
    {
        path: 'team',
        component: TeamComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'list', component: TeamListComponent },
            { path: 'add', component: TeamDetailComponent },
            { path: 'edit/:id', component: TeamDetailComponent },
            { path: 'filter/:id', component: TeamFilterComponent },
            { path: 'view', component: TeamViewComponent },
            { path: 'view/:id', component: TeamViewComponent }
        ]
    }
];

export const TEAM_ROUTER_PROVIDERS = [
    provideRouter(TeamRoutes), TeamService
];
