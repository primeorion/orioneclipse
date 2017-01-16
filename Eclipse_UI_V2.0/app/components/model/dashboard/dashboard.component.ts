import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import { IModelDashboard } from '../../../models/modeling/modeldashboard';
import { ModelService } from '../../../services/model.service';


@Component({
    selector: 'eclipse-model-dashboard',
    templateUrl: './app/components/model/dashboard/dashboard.component.html',
    providers: [ModelService]

})
export class ModelDashboardComponent extends BaseComponent {
    /** Class variables */
    private tabsModel: ITabNav;
    modelSummary: IModelDashboard;
    outOfTolerancePerc: number;
    modelsWaitingForAprovalPerc: number;
    draftModelsPerc: number;
    setForAutoRebalancePerc: number;
    dataErrorsPerc: number;
    ModelTypeId: number = 113;
    outOfToleranceStatusId: number = 4;
    waitingForApprovalStatusId: number = 2;
    draftStatusId: number = 3;
    noModelStatusId: number = 6;
    showAssignPopup: boolean;

    constructor(private _router: Router, private _ModelService: ModelService) {
        super(PRIV_MODELS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'D';
        this.tabsModel.type = 'dashboard';
    }

    ngOnInit() {
        this.onModelDashboardLoad();
    }

    /**get Models summary*/
    onModelDashboardLoad() {
        this.responseToObject<IModelDashboard>(this._ModelService.getModelDashboardData())
            .subscribe(summary => {
                this.modelSummary = summary;
                console.log('Model Summary : ', this.modelSummary);
                this.progressBarPercentage();
            });
    }

    /**to get progress bar percent */
    progressBarPercentage() {
        /** Calculate percentage for Out of Tolerance*/
        if (this.modelSummary.OUBalanceModels != undefined || this.modelSummary.OUBalanceModels != null)
            this.outOfTolerancePerc = this.calculatePercentage(this.modelSummary.OUBalanceModels, this.modelSummary.totalNumberOfModels);
        /** Calculate percentage for Approved models*/
        if (this.modelSummary.waitingForApprovalModels != undefined || this.modelSummary.waitingForApprovalModels != null)
            this.modelsWaitingForAprovalPerc = this.calculatePercentage(this.modelSummary.waitingForApprovalModels, this.modelSummary.totalNumberOfModels);
        /** Calculate percentage for draft models*/
        if (this.modelSummary.draftModels != undefined || this.modelSummary.draftModels != null)
            this.draftModelsPerc = this.calculatePercentage(this.modelSummary.draftModels, this.modelSummary.totalNumberOfModels);
    }

    /**to calculate percentage */
    calculatePercentage(actualValue, totalValue) {
        return ((actualValue / totalValue) * 100); //.toFixed(2);
    }
}