import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../../../core/base.component';
import { IStrategistCommentary } from '../../../../../models/strategist';
import { StrategistService } from '../../../../../services/strategist.service';
import { FormGroup } from '@angular/forms';



@Component({
    selector: 'community-strategist-commentary',
    templateUrl: './app/components/administrator/strategist/detail/commentary/commentary.component.html'
})
export class StrategistCommentaryComponent extends BaseComponent {

    private commentary: IStrategistCommentary = <IStrategistCommentary>{};
    private submitCommentary: boolean = false;


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
            this.getStrategistCommentary(this.strategistId);
        } else {
            this.commentary = <IStrategistCommentary>{};
        }
        this.submitCommentary = false;
    }

    private getStrategistCommentary(strategistId) {
        this.responseToObject<IStrategistCommentary>(this._strategistService.getStrategistCommentary(strategistId))
            .subscribe(model => {
                this.commentary = model;
            });

    }

    private saveCommentary(form) {
        this.submitCommentary = true;
        if (form.valid) {
            if (this.commentary != null && (this.commentary.strategyCommentary == null || this.commentary.strategyCommentary == undefined))
                this.commentary.strategyCommentary = "";

            this.responseToObject<IStrategistCommentary>(this._strategistService.updateStrategistCommentary(this.strategistId, this.commentary))
                .subscribe(model => {
                    this.submitCommentary = false;
                    this.navigateToOtherView.emit("sales");
                },
                err => {

                });
        }
    }

}