import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { UserComponent } from './user.component';
import { UserListComponent } from './list/userlist.component';
import { UserDetailComponent } from './detail/userdetail.component';
import { UserViewComponent } from './view/userview.component';
import { UserFilterComponent } from './view/userfilter.component';
export {
    UserComponent, UserListComponent,
    UserDetailComponent, UserViewComponent, UserFilterComponent
}

export const UserRoutes: Routes = [
    { path: 'user', redirectTo: 'user/list' },
    {
        path: 'user',
        component: UserComponent,
        children:
        [
            { path: 'list', component: UserListComponent },
            { path: 'add', component: UserDetailComponent },
            { path: 'edit/:id', component: UserDetailComponent },
            { path: 'view', component: UserViewComponent },
            { path: 'view/:id', component: UserViewComponent },
            { path: 'filter/:id', component: UserFilterComponent },
        ]
    }
];

export const USER_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(UserRoutes);
