import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';

import { ProgressBarCharts } from '../../../services/progresschart.service';
import { DashboardService } from '../../../services/dashboard.service';
import { IDashboardSummary, IAnalysisSummary, IModalSummary, IPricerange } from '../../../models/mainDashboard';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'eclipse-querybuilder-overview',
    templateUrl: './app/components/querybuilder/dataqueries/dataqueries.component.html',
    providers: [DashboardService]
})

export class DataQueriesComponenet extends BaseComponent {
}