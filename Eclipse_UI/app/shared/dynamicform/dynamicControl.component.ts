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
import {ILocationOptimizationCustom} from '../../models/Preferences/locationOptimization';


@Component({
    selector: 'dynamic-control',
    templateUrl: './app/shared/dynamicform/dynamicControl.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, SortObjectsComponent, DND_DIRECTIVES, CommunityStrategistComponent, LocationOptimizationComponent, SecurityPreferenceComponent],
    providers: [FORM_PROVIDERS]

})
export class DynamicControlComponent {

    private indicatorControlValue;
    checkboxlst: any = [];
    errorMessage: string = "";
    @Input() dynamicControlData: IPreferences;
    @Input() form: FormGroup;
    @Input() communityStrategies: ICustomCommunityPreference;
    @Input() LocationOptimizations: ILocationOptimizationCustom;
    @Input() SecurityPrefResult: ISecurityPreferencesGet
    @Input() levelName: string;
    @ViewChild(CommunityStrategistComponent) communitystrategistComponent: CommunityStrategistComponent;
    @ViewChild(SecurityPreferenceComponent) securitypreferenceComponent: SecurityPreferenceComponent;
    @ViewChild(LocationOptimizationComponent) locationoptimizationComponent: LocationOptimizationComponent;


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


    getInheritedValue() {
        if (this.dynamicControlData.inheritedValue) {
            return this.dynamicControlData.inheritedValue;
        }
        else {
            return "";
        }
    }

    getInheritedIndicatorValue() {
        if (this.dynamicControlData.inheritedIndicatorValue) {
            return this.dynamicControlData.inheritedIndicatorValue;
        }
        else {
            return "";
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
    showTooltipdropdown(event) {
        if (event.isInherited) {

            if (event.inheritedSelectedOptions.length > 0) {
                if (event.selectedOptions.length > 0) {
                    if (event.selectedOptions[0]["id"] == event.inheritedSelectedOptions[0]["id"]) {
                        return event.inheritedFrom;
                    }
                }
            }
        }

        return this.levelName;
    }
    setDropdownSelectedOption(event) {
        if (event.target.value != "") {
            this.dynamicControlData.selectedOptions = [{ id: parseInt(event.target.value) }];
        }
        else {
            this.dynamicControlData.selectedOptions = [];
        }
    }
    setResetControl(event) {

        if (this.dynamicControlData.componentType == "custom") {

            if (this.dynamicControlData.valueType == "SortedList") {                
                if (this.dynamicControlData.inheritedSelectedOptions.length > 0) {
                    this.dynamicControlData.selectedOptions = [];
                    this.dynamicControlData.selectedOptions = Object.values(this.dynamicControlData.inheritedSelectedOptions);
                }
                else {
                    this.dynamicControlData.selectedOptions = Object.values(this.dynamicControlData.options);
                }
            }
            else if (this.dynamicControlData.componentName == "CommunityStrategistEnabledListCascadingControl") {
                if (Object.keys(this.communityStrategies.inheritedStrategists).length > 0) {
                    this.communityStrategies.strategists.strategistIds = (this.communityStrategies.inheritedStrategists.strategistIds != null) ? Object.values(this.communityStrategies.inheritedStrategists.strategistIds) : null;
                    this.communityStrategies.strategists.modelAccessLevel = this.communityStrategies.inheritedStrategists.modelAccessLevel;
                    this.communityStrategies.strategists.communityModels = (this.communityStrategies.inheritedStrategists.strategistIds != null) ? Object.values(this.communityStrategies.inheritedStrategists.communityModels) : null;
                }
                else {
                    this.communityStrategies.strategists.strategistIds = null;
                    this.communityStrategies.strategists.modelAccessLevel = null;
                    this.communityStrategies.strategists.communityModels = null;
                }
                this.communitystrategistComponent.getInheritedOptions(this.communityStrategies.strategists);
            }

            else if (this.dynamicControlData.componentName == "SecurityDataGrid") {
                this.SecurityPrefResult.securityPreferences = Object.values(this.SecurityPrefResult.inheritedSecurityPreferences);
                this.securitypreferenceComponent.bindSecurityData(this.SecurityPrefResult);
            }
            else if (this.dynamicControlData.componentName == "LocationOptimizationDataGrid") {
                if (Object.keys(this.LocationOptimizations.inheritedSubClasses).length > 0) {
                    this.LocationOptimizations.subClasses = Object.values(this.LocationOptimizations.inheritedSubClasses);
                }
                else {
                    this.LocationOptimizations.subClasses = [];
                }
                this.locationoptimizationComponent.rebindControls(this.LocationOptimizations.subClasses);
            }
        }
        else {
            if (this.dynamicControlData.componentName == "Dropdown") {

                if (this.dynamicControlData.inheritedSelectedOptions.length > 0) {
                    let InheritValue = this.dynamicControlData.inheritedSelectedOptions[0]["id"];
                    (document.getElementById(event.currentTarget.id))["value"] = InheritValue;
                    this.dynamicControlData.selectedOptions = [{ id: InheritValue, order: 0 }];
                    this.form.controls[event.currentTarget.id]["_value"] = InheritValue;
                }
                else {
                    (document.getElementById(event.currentTarget.id))["value"] = "";
                    this.dynamicControlData.value = "";
                    this.dynamicControlData.selectedOptions = [{ id: "", order: 0 }];
                    this.form.controls[event.currentTarget.id]["_value"] = "";
                }

            }
            else {
                //get Inherited value
                let InheritValue = this.getInheritedValue();
                (document.getElementById(event.currentTarget.id))["value"] = InheritValue;
                this.dynamicControlData.value = InheritValue;
                this.dynamicControlData.selectedOptions = InheritValue;
                this.form.controls[event.currentTarget.id]["_value"] = InheritValue;
            }
        }
        // UpdateValue is neccessary
        this.form.controls[event.currentTarget.id].updateValueAndValidity();
    }
    setToRadioControl(param, dynamicControlData) {

        this.dynamicControlData.value = param.id;
        this.dynamicControlData.selectedOptions = param.id;
        this.form.controls[dynamicControlData.name]["_value"] = param.id;
        // UpdateValue is neccessary
        this.form.controls[dynamicControlData.name].updateValueAndValidity();

    }
    setcheckboxchecked(param) {
        if (param == "true") {
            return true;
        }
        else {
            return false;
        }
    }
    setCheckBoValue(event) {
        if (event.target.checked) {
            this.dynamicControlData.value = "true";
        }
        else {
            this.dynamicControlData.value = "false";
        }
    }

    setToCheckBoxControl(param, dynamicControlData, selectedOptions) {

        var idx = selectedOptions.indexOf(param);
        if (idx > -1) {
            selectedOptions.splice(idx, 1);
        }
        else {
            selectedOptions.push(param);
        }
        this.dynamicControlData.value = this.checkboxlst.toString();
        this.form.controls[dynamicControlData.name]["_value"] = selectedOptions;
        this.form.controls[dynamicControlData.name].updateValueAndValidity();
    }

    checkboxChecked(opt, dynamicControlData) {
        if (this.form["_value"][dynamicControlData.name]["value"] == opt.id) {
            return true;
        }
        else {
            return false;
        }
    }
    getRadioChecked(opt, dynamicControlData) {
        if (this.form["_value"][dynamicControlData.name]["value"] == opt.id) {
            return true;
        }
        else {
            return false;
        }
    }
    validateTextBox(event) {
        this.errorMessage = "please enter valid data!";
        this.dynamicControlData.isValid = false;
    }
    emptyError() {
        this.dynamicControlData.isValid = true;
        this.errorMessage = "";
    }
    setValid(event) {
        if (this.dynamicControlData.maxValue != null &&
            (this.dynamicControlData.value + event.key) > this.dynamicControlData.maxValue) {
            return false;
        }

        if (this.dynamicControlData.valueType == "Number") {
            if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                || event.key == "?" || event.key == "*") {
                return false;
            }
            if (this.dynamicControlData.value.includes(".")) {
                if (event.key == ".") {
                    return false
                }
            }
            if (event.key != ".") {
                let regexvalidate = /^(?:\d*\.\d{1,2}|\d+)$/;
                return regexvalidate.test(event.target.value + event.key);
            }
        }
        else if (this.dynamicControlData.valueType == "number") {
            if (event.key.toLowerCase() == "e" || event.key == "-" || event.key == "+" || event.key == "," || event.key == "/"
                || event.key == "?" || event.key == "*" || event.key == ".") {
                return false;
            }
            let parsetxt = parseInt(event.target.value + event.key);
            let maxValue = event.target.max == "null" ? Number.MAX_VALUE : event.target.max;
            let minValue = event.target.min == "null" ? 0 : event.target.min;
            return (!isNaN(parsetxt) && parsetxt >= event.target.min && parsetxt <= event.target.max);

        }
    }

    setDynamicDataValue(event) {

        this.dynamicControlData.value = undefined;
        this.dynamicControlData.selectedIndicatorValue = event.target.value;

        for (var i = 0; i < this.dynamicControlData.indicatorOptions.length; i++) {
            var option = this.dynamicControlData.indicatorOptions[i];
            if (option.name == this.dynamicControlData.selectedIndicatorValue) {
                this.dynamicControlData.maxValue = option.maxValue == null ? Number.MAX_VALUE : option.maxValue;
                this.dynamicControlData.minValue = option.minValue == null ? 0 : option.minValue;
                break;
            }
        }

    }

}