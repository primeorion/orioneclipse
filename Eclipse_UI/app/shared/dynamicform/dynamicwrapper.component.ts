import { Component, Input, ViewChild}  from '@angular/core';
import { FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, FORM_PROVIDERS, FormBuilder, FormControl, Validators  } from '@angular/forms';
import { PreferenceService } from '../../services/preference.service';
import { FilterPipe } from '../../pipes/FilterPipe';
import { IPreferences } from '../../models/Preferences/preference';
import { ICustomCommunityPreference } from '../../models/Preferences/preferenceCommunity';
import { DynamicControlComponent } from './dynamicControl.component';
import { IPreferenceDataVM } from '../../viewmodels/preference.data';
import { ISecurityPreferencesGet} from '../../models/Preferences/securityPreference';
import { DynamicControlreadonlyComponent } from './dynamicControlreadonly.component';
import {ILocationOptimizationCustom} from '../../models/Preferences/locationOptimization';
@Component({
  selector: 'dynamic-wrapper',
  templateUrl: './app/shared/dynamicform/dynamicwrapper.component.html',
  directives: [DynamicControlComponent, DynamicControlreadonlyComponent, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES],
  providers: [PreferenceService, FORM_PROVIDERS],
  pipes: [FilterPipe]
})

export class DynamicWrapperComponent {

  @Input() preferences: any;
  categories: any = [];
  @Input() preferenceCommunities: ICustomCommunityPreference;
  @Input() locationOptimizations: ILocationOptimizationCustom;
  @Input() SecurityPrefResultWrapper: ISecurityPreferencesGet;
  @Input() levelName: string;
  form: FormGroup;
  perfpermissionMode; string;

  @ViewChild(DynamicControlComponent) dynamicformcontrolComponent: DynamicControlComponent;

  constructor(private preferenceservice: PreferenceService) { }

  setFormData(preferenceVM: IPreferenceDataVM) {
    this.preferences = preferenceVM.levelPreferences.preferences;
    this.form = this.toFormGroup(this.preferences);
    this.categories = preferenceVM.preferenceCategories;
    this.preferenceCommunities = (preferenceVM.preferenceCommunities != null) ? preferenceVM.preferenceCommunities : <ICustomCommunityPreference>{};
    this.locationOptimizations = (preferenceVM.preferenceLocationOptimization != null) ? preferenceVM.preferenceLocationOptimization : <ILocationOptimizationCustom>{};
    this.SecurityPrefResultWrapper = preferenceVM.preferenceSecurityData;
    this.levelName = preferenceVM.levelPreferences.level;
    this.perfpermissionMode = preferenceVM.prefPermissonMode;
  }

  //toFormGroup(preference: IPreference<any>[]) {
  toFormGroup(preference: IPreferences[]) {
    //console.log(preference);
    let group: any = {};
    preference.forEach(pfsettings => {
      group[pfsettings.name] = pfsettings.required ? new FormControl(pfsettings.value || '', Validators.compose([Validators.required]))
        : new FormControl(pfsettings.value || '');
      if (pfsettings.indicatorOptions != undefined && pfsettings.indicatorOptions.length > 0) {
        group[pfsettings.name + pfsettings.componentName] = new FormControl(pfsettings.indicatorValue || '', Validators.compose([Validators.required]));
      }
    });
    return new FormGroup(group);
  }

}