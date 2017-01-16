import { provideRouter, RouterConfig } from '@angular/router';
import { AuthGuard } from '../../../core/auth.guard';
import { UserService } from '../../../services/user.service';
import { UserComponent } from './user.component';
import { UserListComponent }  from './list/userlist.component';
import { UserDetailComponent }  from './detail/userdetail.component';
import { UserViewComponent }  from './view/userview.component';

export const UserRoutes: RouterConfig = [
    { path: 'user', redirectTo: 'user/list', terminal: true },
    {
        path: 'user',
        component: UserComponent,
        canActivate: [AuthGuard],
        children:
        [
            { path: 'list', component: UserListComponent },
            { path: 'add', component: UserDetailComponent },
            { path: 'edit/:id', component: UserDetailComponent },
            { path: 'view', component: UserViewComponent },
            { path: 'view/:id', component: UserViewComponent }
        ]
    }
];

export const USER_ROUTER_PROVIDERS = [
    provideRouter(UserRoutes), UserService
];
