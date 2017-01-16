import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../core/base.component';
import { Router } from '@angular/router';

@Component({
    selector: 'community-model-marketing-tabnav',
    templateUrl: './app/components/model/marketing/shared/marketing.tabnav.component.html'
})
export class MarketingTabNavComponent extends BaseComponent {

    @Input() modelId: number;
    private isStrategistAdmin: boolean;
    constructor(private router: Router) {
        super();
        this.isStrategistAdmin = (this.roleTypeId == RoleType.StrategistAdmin);
    }

    getLinkStyle(path) {
        return this.router.url.indexOf(path) > -1;
    }
}