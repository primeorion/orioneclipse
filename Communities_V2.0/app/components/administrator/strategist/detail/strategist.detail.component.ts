import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { BaseComponent } from '../../../../core/base.component';
import { ITabNav } from '../../shared/strategist.tabnav.component';
import { IStrategist } from '../../../../models/strategist';
import { StrategistService } from '../../../../services/strategist.service';
import { Http, Response } from '@angular/http';
import { StrategistGeneralInfoComponent } from '../../strategist/detail/generalInfo/strategist.general.info.component';

@Component({
    selector: 'community-strategist-detail',
    templateUrl: './app/components/administrator/strategist/detail/strategist.detail.component.html'


})
export class StrategistDetailComponent extends BaseComponent {

    private viewName: string = "";
    private strategist: IStrategist = <IStrategist>{};
    private tabsModel: ITabNav = <ITabNav>{};
    private filteredStrategistResult: IStrategist[];
    private autoSearchStrategist: any;
    private showDetails: number = 0;
    private btnDisableSearch: boolean = true;
    @Input() strategistId: number;
    @Input() isViewMode: boolean;
    @ViewChild(StrategistGeneralInfoComponent) strategistGeneralInfoComponent: StrategistGeneralInfoComponent;
   
    constructor(private _strategistService: StrategistService, private _router: Router, private activateRoute: ActivatedRoute) {
        super();

        this.activateRoute.params.subscribe(params => {
            if (params['id'] != undefined)
                this.strategistId = params['id'];
            this.tabsModel.id = this.strategistId;
        });

        if (this._router.url.indexOf('view') > -1) {

            this.tabsModel.action = 'V';
            this.isViewMode = true;

            if (!this.strategistId) {
                this.showDetails = 0;
                this.viewName = "";
            } else {
                this.showDetails = 1;
                this.viewName = "generalInfo";
            }
        }

        if (this._router.url.indexOf('edit') > -1 || this._router.url.indexOf('add') > -1) {
            this.isViewMode = false;
            this.showDetails = 1;
            this.tabsModel.action = 'E';
            this.viewName = "generalInfo";
        }

        if (this._router.url.indexOf('add') > -1) {
            this.isViewMode = false;
            this.tabsModel.action = 'A';
            this.showDetails = 1;
            this.viewName = "generalInfo";
        }
    }

    private navigateToOtherView(viewName) {
        if (this.strategistId != undefined) {
            this.viewName = viewName;
        }
    }

    private setStrategistId(id) {
        this.strategistId = id;
        this.tabsModel.id = id;
        this.tabsModel.action = 'E';
    }

    autoStrategistSearch(event) {
        this._strategistService.searchStrategist(event.query).map((response: Response) => <IStrategist[]>response.json())
            .subscribe(strategistResult => {
                this.filteredStrategistResult = strategistResult;
            });
    }

    handleSelectedStrategist(strategist) {

        if (strategist.id) {
            this.strategist.id = strategist.id;
            this.btnDisableSearch = false;

        } else {
            this.strategist.id = 0;
            this.showDetails = 0;
            this.btnDisableSearch = true;
        }
    }

    private searchStrategist(selectedStrategist) {
        this.showDetails = 1;
        this._router.navigate(['/community/administrator/strategist/view', selectedStrategist.id]);
        this.isViewMode = true;
         if (this.viewName = "generalInfo") {
             this.strategistGeneralInfoComponent.strategistId = selectedStrategist.id;
            this.strategistGeneralInfoComponent.reset();
         }

    }
}   