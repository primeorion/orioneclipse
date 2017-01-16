import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategistAdvertisement } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { FormGroup } from '@angular/forms';


@Component({
    selector: 'community-strategist-advertisement',
    templateUrl: './app/components/administrator/strategist/detail/advertisement/advertisement.component.html'
})
export class StrategistAdvertisementComponent extends BaseComponent {

    private advertisement: IStrategistAdvertisement = <IStrategistAdvertisement>{};
    private submitAdvertisement: boolean = false;


    @Input() strategistId: number;
    @Input() isViewMode: boolean;

    @Output() navigateToOtherView = new EventEmitter();

    constructor(private _strategistService: StrategistService) {
        super();


    }

    ngOnInit() {

        this.reset();

    }

    reset() {
        if (this.strategistId != undefined) {
            this.getStrategistAdvertisement(this.strategistId);
        } else {
            this.advertisement = <IStrategistAdvertisement>{};
        }
        this.submitAdvertisement = false;
    }

    private getStrategistAdvertisement(strategistId) {
        this.responseToObject<IStrategistAdvertisement>(this._strategistService.getStrategistAdvertisement(strategistId))
            .subscribe(model => {
                this.advertisement = model;
            });

    }

    private saveAdvertisement(form) {
        this.submitAdvertisement = true;
        if (form.valid) {
            if (this.advertisement != null && (this.advertisement.advertisementMessage == null || this.advertisement.advertisementMessage == undefined))
                this.advertisement.advertisementMessage = "";

            this.responseToObject<IStrategistAdvertisement>(this._strategistService.updateStrategistAdvertisement(this.strategistId, this.advertisement))
                .subscribe(model => {
                    this.submitAdvertisement = false;
                    this.navigateToOtherView.emit("downloads");
                },
                err => {

                });
        }
    }

}