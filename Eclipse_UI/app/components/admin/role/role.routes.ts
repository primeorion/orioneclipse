import { provideRouter, RouterConfig } from '@angular/router';
import { AuthGuard } from '../../../core/auth.guard';
import { RoleService } from '../../../services/role.service';
import { RoleComponent } from './role.component';
import { RoleListComponent }  from './list/rolelist.component';
import { RoleDetailComponent }  from './detail/roledetail.component';
import { RoleViewComponent }  from './view/roleview.component';

export const RoleRoutes: RouterConfig = [
    { path: 'role', redirectTo: 'role/list', terminal: true },
    {
        path: 'role',
        component: RoleComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'list', component: RoleListComponent },
            { path: 'add', component: RoleDetailComponent },
            { path: 'copy/:id', component: RoleDetailComponent },
            { path: 'edit/:id', component: RoleDetailComponent },
            { path: 'view', component: RoleViewComponent },
            { path: 'view/:id', component: RoleViewComponent }
        ]
    }
];

export const ROLE_ROUTER_PROVIDERS = [
    provideRouter(RoleRoutes), RoleService
];
