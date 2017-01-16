import { Component, Input } from '@angular/core';
import * as Util from '../../../core/functions';
import { TacticalService } from '../../../services/tactical.service';
import { ITTSecurity, IIdName } from '../../../models/tactical';

@Component({
    selector: 'eclipse-tactical-securities',
    templateUrl: './app/components/tradeorder/tactical/tactical.securities.component.html'
})
export class TacticalSecuritiesComponent {
    @Input() model: ITTSecurity[];

    constructor() { }
}
