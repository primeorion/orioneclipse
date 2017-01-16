import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as Util from '../../../../core/functions';

@Component({
    selector: 'eclipse-admin-team-filter',
    template: '' //./app/components/admin/team/view/teamfilter.component.html',
})

export class TeamFilterComponent {
    id: number;

    constructor(private _router: Router, private activateRoute: ActivatedRoute) {
        this.id = Util.getRouteParam<number>(activateRoute);
        let params: any[] = ['/eclipse/admin/team/view'];
        if (this.id != undefined) {
            params.push(this.id);
        }
        this._router.navigate(params);
    }

}
