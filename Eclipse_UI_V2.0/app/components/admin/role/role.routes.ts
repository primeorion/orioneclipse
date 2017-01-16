import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { RoleComponent } from './role.component';
import { RoleListComponent } from './list/rolelist.component';
import { RoleDetailComponent } from './detail/roledetail.component';
import { RoleViewComponent } from './view/roleview.component';
import { RoleFilterComponent } from './view/rolefilter.component';
export {
    RoleComponent, RoleListComponent,
    RoleDetailComponent, RoleViewComponent, RoleFilterComponent
}

export const RoleRoutes: Routes = [
    { path: 'role', redirectTo: 'role/list' },
    {
        path: 'role',
        component: RoleComponent,
        children:
        [
            { path: 'list', component: RoleListComponent },
            { path: 'add', component: RoleDetailComponent },
            { path: 'copy/:id', component: RoleDetailComponent },
            { path: 'edit/:id', component: RoleDetailComponent },
            { path: 'view', component: RoleViewComponent },
            { path: 'view/:id', component: RoleViewComponent },
            { path: 'filter/:id', component: RoleFilterComponent }
        ]
    }
];

export const ROLE_ROUTER_PROVIDERS: ModuleWithProviders = RouterModule.forChild(RoleRoutes);
