import { Component, Input, ViewChild } from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/common';
import { FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, FORM_PROVIDERS} from '@angular/forms';
import { IPreferences } from '../../models/Preferences/preference';
import { ICustomCommunityPreference, IPreferenceCommunity } from '../../models/Preferences/preferenceCommunity';
import { SortObjectsComponent } from '../../shared/sortobjects/sortobjects.component';
import {DND_DIRECTIVES} from 'ng2-dnd/ng2-dnd';
import { CommunityStrategistComponent } from '../../shared/communitystrategist/component.communitystrategist';
import { LocationOptimizationComponent } from '../../shared/locationoptimization/locationoptimization.component';
import { SecurityPreferenceComponent } from '../../shared/security/security.preference.component';
//import { SecurityService } from '../../services/security.service';
import { ISecurityPreferencesGet} from '../../models/Preferences/securityPreference';

@Component({
    selector: 'dynamic-control-readonly',
    templateUrl: './app/shared/dynamicform/dynamicControlreadonly.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, SortObjectsComponent, DND_DIRECTIVES, CommunityStrategistComponent, LocationOptimizationComponent, SecurityPreferenceComponent],
    providers: [FORM_PROVIDERS]

})
export class DynamicControlreadonlyComponent {

    private indicatorControlValue;
    checkboxlst: any = [];
    errorMessage: string = "";
    @Input() dynamicControlData: IPreferences;
    @Input() form: FormGroup;
    @Input() communityStrategies: ICustomCommunityPreference;
    @Input() LocationOptimizations: any[];
    @Input() SecurityPrefResult: ISecurityPreferencesGet
    @Input() levelName: string;
    @ViewChild(CommunityStrategistComponent) communitystrategistComponent: CommunityStrategistComponent;
    @ViewChild(SecurityPreferenceComponent) securitypreferenceComponent: SecurityPreferenceComponent;

    constructor() { }

    ngOnInit() {
        this.indicatorControlValue = this.dynamicControlData.name + this.dynamicControlData.componentName;
        this.setIndicatorValue();
    }

    setIndicatorValue() {
        if (this.dynamicControlData.indicatorOptions != null
            && this.dynamicControlData.indicatorOptions.length > 0) {
            if (this.dynamicControlData.indicatorValue == null) {
                this.dynamicControlData.indicatorValue = this.dynamicControlData.indicatorOptions[0].name;
            }

            for (var i = 0; i < this.dynamicControlData.indicatorOptions.length; i++) {
                var option = this.dynamicControlData.indicatorOptions[i];
                if (option.name == this.dynamicControlData.indicatorValue) {
                    this.dynamicControlData.maxValue = option.maxValue == null ? Number.MAX_VALUE : option.maxValue;
                    this.dynamicControlData.minValue = option.minValue == null ? 0 : option.minValue;
                    break;
                }
            }
        }
    }

    showTooltip(event) {
        if (event.isInherited) {
            if (event.value == event.inheritedValue) {
                return event.inheritedFrom;
            }
        }
        return this.levelName;
    }
    setcheckboxchecked(param) {
        return (param == "true") ? true : false;
    }

    setCheckBoValue(event) {
        this.dynamicControlData.value = (event.target.checked) ? "true" : "false";
    }

    checkboxChecked(opt, dynamicControlData) {
        return (this.form["_value"][dynamicControlData.name]["value"] == opt.id) ? true : false;
    }
}