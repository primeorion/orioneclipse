
import { Component, ViewChild, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../../core/base.component';
import { PreferenceLeftNavComponent } from '../../../../shared/leftnavigation/preference.leftnav.component';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { DynamicWrapperComponent }     from '../../../../shared/dynamicform/dynamicwrapper.component';
import { DynamicControlComponent }     from '../../../../shared/dynamicform/dynamicControl.component';
import { PreferenceService } from '../../../../services/preference.service';
import { IPreferences, ILevelPreference, IPreferenceCategory, IPreferenceSave, ILevelPreferenceSave} from '../../../../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet } from '../../../../models/Preferences/preferenceCommunity';
import { CommunityStrategistComponent } from '../../../../shared/communitystrategist/component.communitystrategist';
import { Observable } from 'rxjs/Rx';
import { PreferencesBusinessObjects } from '../../../../businessobjects/preference.businessobjects';
import { IPreferenceDataVM, IPreferenceDataVMCompare} from '../../../../viewmodels/preference.data';
import { LocationOptimizationComponent } from '../../../../shared/locationoptimization/locationoptimization.component';
import { ILocationOptimization, ILocationSettings, ILocationOptimizationCustom, ILocationOptimizationCustomCompare } from '../../../../models/Preferences/locationOptimization';
import { SessionHelper } from '../../../../core/session.helper';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SecurityService } from '../../../../services/security.service';
import { SecurityPreferenceComponent } from '../../../../shared/security/security.preference.component';
import { ISecurityPreferencesGet} from '../../../../models/Preferences/securityPreference';
import { IRole } from '../../../../models/role';

@Component({
    selector: 'eclipse-admin-firmpreference',
    templateUrl: './app/components/admin/preferencesettings/firmpref/firmpreference.component.html',
    directives: [BreadcrumbComponent,
        PreferenceLeftNavComponent,
        DynamicWrapperComponent,
        CommunityStrategistComponent, LocationOptimizationComponent, Dialog, SecurityPreferenceComponent],
    providers: [PreferencesBusinessObjects, PreferenceService, SecurityService]
})

export class FirmPreferences extends BaseComponent {
    private currentpreference = "Firm";
    categories: IPreferenceCategory[];
    Preferncelst: IPreferenceSave[] = [];
    preferenceData: IPreferences[];
    preferenceViewModel: IPreferenceDataVM;
    preferenceViewModelCompare: IPreferenceDataVMCompare;
    locationOptimization: ILocationOptimizationCustomCompare;
    private pushData: any = [];
    dataSource: any[] = [];
    errorMessage: string;
    successMessage: string;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';
    showErrorMessage: boolean;
    showSuccessMessage: boolean;
    preferencesToSave: ILevelPreferenceSave;
    public showSaveBtn: boolean = true;
    public showResetBtn: boolean = true;
    btnSaveDisable: boolean = true;
    btnResetDisable: boolean = true;
    private displayConfirm: boolean;
    private confirmType: string = 'RESET';
    securityStub: ISecurityPreferencesGet;
    preferenceLevel: string;
    communityStrategist: ICustomCommunityPreferenceGet
    prefPermissionMode: string;

    constructor(
        private preferencesbo: PreferencesBusinessObjects,
        private _securityService: SecurityService
    ) {
        super();
        this.initializePreferenceVMProperties();
        this.setRoleTypePermisionMode(PRIV_FIRMPREF)

    }
    setRoleTypePermisionMode(prefType) {
        let sessionHelper = new SessionHelper();
        let sessionrole = sessionHelper.get<IRole>('role');
        let roleType = sessionHelper.get<IRole>('role').roleType;
        let teamPermissons = sessionHelper.getPermission(prefType);
        this.prefPermissionMode = (teamPermissons.canRead
            && !teamPermissons.canAdd
            && !teamPermissons.canUpdate) ? 'VIEW' : 'ADDUPDATE';

    }


    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (!targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        // console.log('targetElement matches: ', matches);
        let [resetval = 0] = matches;
        if (targetElement.id != "") {
            if (targetElement.innerText === "Reset") {
                this.displayConfirm = (resetval == 0);
            }
        }
    }

    /**Intilize Preference Viewmodel properties */
    initializePreferenceVMProperties() {
        this.preferenceViewModel = <IPreferenceDataVM>{
            preferenceCategories: <IPreferenceCategory[]>{},
            levelPreferences: <ILevelPreference>{},
            preferenceCommunities: <ICustomCommunityPreference>{},
            preferenceLocationOptimization: <ILocationOptimizationCustom>{}
        }
    }

    /**Intilize PreferencesToSave Model properties */
    initializePreferencesToSaveModel() {
        this.preferencesToSave = <ILevelPreferenceSave>{
            defaultPreferences: [],
            locationOptimizationPreference: {},
            communityStrategistPreference: {},
            securityPreferences: {}
        };
    }

    @ViewChild(DynamicWrapperComponent) dynamicFormComponent: DynamicWrapperComponent;

    ngOnInit() {
        this.getFirmDetails();
        this.bindPreferencesDataByFirmId("Firm", this.firmId);
        // this.getGridDatawithStub();
    }

    getFirmDetails() {
        let sessionHelper = new SessionHelper();
        let user = sessionHelper.getUser();
        this.firmId = user.firmId;
        this.firmName = user.firmName;
    }

    bindPreferencesDataByFirmId(firmPreference: string, firmId: number) {
        this.preferencesbo.getPreferencesData(firmPreference, firmId).subscribe(data => {

            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;

            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0 && firmId != null) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Firm", firmId, preferenceCustomComponents);
                this.getCustomComponentsAndBindToForm(this.preferenceViewModel, this.pushData);
            }
            else {
                this.bindAllPreferencesToForm(this.preferenceViewModel);
            }
            // when we are same page , reference value issue we have to make Preferncelst empty      
            this.Preferncelst = [];
            this.bindPreferenceCompareData(data[1].preferences);
            this.btnSaveDisable = false;
            this.btnResetDisable = false;
        },
            Error => {
                this.btnSaveDisable = true;
                this.btnResetDisable = true;
            }
        );
    }


    /** Prepare a template for save preferences data */
    bindPreferenceCompareData(preferencelst) {
        preferencelst.forEach(element => {

            this.Preferncelst.push({
                id: element.id,
                preferenceId: element.preferenceId,
                //  name: element.name,
                valueType: element.valueType,
                componentType: element.componentType,
                componentName: element.componentName,
                selectedOptions: element.selectedOptions,
                value: element.value,
                options: element.options
            });
        });
    }

    /** Get the custom components and bind to the form*/
    getCustomComponentsAndBindToForm(preferencesvm: IPreferenceDataVM, pushData: any) {
        this.locationOptimization = <ILocationOptimizationCustomCompare>{};
        this.securityStub = <ISecurityPreferencesGet>{};
        if (pushData.length > 0) {
            Observable.forkJoin(pushData)
                .subscribe(data => {
                    this.preferencesbo.getCustomComponents(data, preferencesvm);
                    this.addCustomControls(preferencesvm);
                    this.bindAllPreferencesToForm(preferencesvm);
                });
        }
        else {
            this.bindAllPreferencesToForm(preferencesvm);
        }
    }

    /*bind all Preferences to Form*/
    bindAllPreferencesToForm(preferencesvm: IPreferenceDataVM) {
        // compare Data object
        this.preferenceViewModelCompare = <IPreferenceDataVMCompare>{
            preferences: this.Preferncelst,
            preferenceCommunities: this.communityStrategist,
            preferenceLocationOptimization: this.locationOptimization,
            preferenceSecurityData: this.securityStub
        }
        // // default API Compare data
        // let sortedLists = this.preferenceViewModelCompare.preferences.filter(x => x.valueType == "SortedList");
        // if (Object.keys(sortedLists).length > 0) {
        //     sortedLists.forEach(element => {
        //         element.selectedOptions = (Object.keys(element.selectedOptions).length > 0) ? Object.values(element.selectedOptions) : Object.values(element.options);
        //     });
        // }

        this.preferencesbo.compareSortedOptionsInSortedList(this.preferenceViewModelCompare, preferencesvm);
        this.dynamicFormComponent.setFormData(
            preferencesvm
        );
        window.scrollTo(0, 0);
    }


    onSubmit() {
        let timer = Observable.timer(1000, 1000);
        this.setMessageDefaults();
        this.initializePreferencesToSaveModel();
        this.preferencesToSave = this.preferencesbo.getReadyToSavePreferences(this.preferenceViewModel, this.preferenceViewModelCompare);
        this.preferencesbo.saveAllPreferences(this.preferenceViewModel, this.preferencesToSave, null, this.preferenceViewModelCompare)
            .subscribe(data => {
                this.updateCompareData(this.preferenceViewModel);
                console.log("Save Data ", JSON.stringify(data));
                this.showSuccessMessage = true;
                this.successMessage = 'Successfully saved!';
                // timer disable POPUP message
                timer.subscribe(t => this.tickerFunc(t));
            },
            error => {
                this.showErrorMessage = true;
                this.errorMessage = 'Error occured while saving the data!';
                // timer disable POPUP message
                timer.subscribe(t => this.tickerFunc(t));
            });

    }
    tickerFunc(tick) {
        if (tick == 0) {
            this.setMessageDefaults();
        }
    }

    /** Display confirmation message before resetting */
    onCancel() {
        this.displayConfirm = true;
    }

    // onReset() {
    //     this.preferenceViewModel = this.preferencesbo.bindInheritedValuesFromImmediateLevelToCurrentLevel(this.preferenceViewModel);
    //     this.dynamicFormComponent.setFormResetData(
    //         this.preferenceViewModel
    //     );

    //     console.log("Reset log", JSON.stringify(this.preferenceViewModel));

    //     //  this.setResetFormData();
    // }
    // setResetFormData() {
    //     debugger
    //     this.communitystrategistComponent.getInheritedOptions(this.preferenceViewModel.preferenceCommunities.strategists);
    //     this.locationoptimizationComponent.rebindControls(this.preferenceViewModel.preferenceLocationOptimization.subClasses);
    //     this.securitypreferenceComponent.bindSecurityData(this.preferenceViewModel.preferenceSecurityData);
    // }
    /** reset the form with previous values */
    resetForm() {
        if (this.firmId != null) {
            this.bindPreferencesDataByFirmId("Firm", this.firmId);
            this.displayConfirm = false;
        }
    }
    IsValidForm() {
        if (Object.keys(this.preferenceViewModel.levelPreferences).length > 0) {
            let prefresultcont = this.preferenceViewModel.levelPreferences.preferences.filter(x => x.componentName == "Textbox" && !x.isValid);
            return !(prefresultcont.length > 0);
        }
        return true;
    }

    /** Set the success and error messages to defaults and empty */
    setMessageDefaults() {
        this.errorMessage = '';
        this.successMessage = '';
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
    }

    updateCompareData(vmPreference) {
        this.addCustomControls(vmPreference);
        this.preferenceViewModelCompare = <IPreferenceDataVMCompare>{
            preferences: this.Preferncelst,
            preferenceCommunities: this.communityStrategist,
            preferenceLocationOptimization: this.locationOptimization,
            preferenceSecurityData: this.securityStub
        }
    }
    addCustomControls(preferencesvm) {
        // Location Optimization
        if (Object.keys(preferencesvm.preferenceLocationOptimization).length > 0) {
            this.locationOptimization = <ILocationOptimizationCustomCompare>{
                level: preferencesvm.preferenceLocationOptimization.level,
                recordId: preferencesvm.preferenceLocationOptimization.recordId,
                id: preferencesvm.preferenceLocationOptimization.id,
                preferenceId: preferencesvm.preferenceLocationOptimization.preferenceId,
                componentType: preferencesvm.preferenceLocationOptimization.componentType,
                componentName: preferencesvm.preferenceLocationOptimization.componentName,
                subClasses: Object.values(preferencesvm.preferenceLocationOptimization.subClasses)
            }
        }
        // Security Preference Compare
        if (Object.keys(preferencesvm.preferenceSecurityData).length > 0) {
            this.securityStub = <ISecurityPreferencesGet>{
                levelName: preferencesvm.preferenceSecurityData.levelName,
                recordId: preferencesvm.preferenceSecurityData.recordId,
                id: preferencesvm.preferenceSecurityData.id,
                preferenceId: preferencesvm.preferenceSecurityData.preferenceId,
                name: preferencesvm.preferenceSecurityData.name,
                displayName: preferencesvm.preferenceSecurityData.displayName,
                categoryType: preferencesvm.preferenceSecurityData.categoryType,
                componentType: preferencesvm.preferenceSecurityData.componentType,
                componentName: preferencesvm.preferenceSecurityData.componentName,
                securityPreferences: Object.values(preferencesvm.preferenceSecurityData.securityPreferences),
                inheritedSecurityPreferences: preferencesvm.preferenceSecurityData.inheritedSecurityPreferences
            }
        }
        // Community Strategist Compare
        if (Object.keys(preferencesvm.preferenceCommunities).length > 0) {
            this.communityStrategist = <ICustomCommunityPreferenceGet>
                {
                    preferenceId: preferencesvm.preferenceCommunities.preferenceId,
                    strategists: <any>
                    {
                        strategistIds: (preferencesvm.preferenceCommunities.strategists.strategistIds != null) ? Object.values(preferencesvm.preferenceCommunities.strategists.strategistIds) : null,
                        modelAccessLevel: preferencesvm.preferenceCommunities.strategists.modelAccessLevel,
                        communityModels: (preferencesvm.preferenceCommunities.strategists.communityModels != null) ? Object.values(preferencesvm.preferenceCommunities.strategists.communityModels) : null
                    }
                }
        }
    }

    onReset() {
        this.ResetbindPreferencesDataByFirmId("Firm", this.firmId);
        // this.preferenceViewModel = this.preferencesbo.bindInheritedValuesFromImmediateLevelToCurrentLevel(this.preferenceViewModel);
        // this.dynamicFormComponent.setFormResetData(
        //     this.preferenceViewModel
        // );
    }

    ResetbindPreferencesDataByFirmId(firmPreference: string, firmId: number) {
        this.preferencesbo.getPreferencesData(firmPreference, firmId).subscribe(data => {

            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;

            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0 && firmId != null) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Firm", firmId, preferenceCustomComponents);
                this.ResetgetCustomComponentsAndBindToForm(this.preferenceViewModel, this.pushData);
            }
            else {
                this.ResetbindAllPreferencesToForm(this.preferenceViewModel);
            }
            // when we are same page , reference value issue we have to make Preferncelst empty      
            this.Preferncelst = [];
            this.bindPreferenceCompareData(this.preferenceViewModel.levelPreferences.preferences);
            this.btnSaveDisable = false;
            this.btnResetDisable = false;
        },
            Error => {
                this.btnSaveDisable = true;
                this.btnResetDisable = true;
            }
        );
    }

    /** Reset Get the custom components and bind to the form*/
    ResetgetCustomComponentsAndBindToForm(preferencesvm: IPreferenceDataVM, pushData: any) {
        this.locationOptimization = <ILocationOptimizationCustomCompare>{};
        this.securityStub = <ISecurityPreferencesGet>{};
        if (pushData.length > 0) {
            Observable.forkJoin(pushData)
                .subscribe(data => {
                    this.preferencesbo.getCustomComponents(data, preferencesvm);
                    // adding Custom controls data
                    this.addCustomControls(preferencesvm);              
                    this.ResetbindAllPreferencesToForm(preferencesvm);
                });
        }
        else {           
            this.ResetbindAllPreferencesToForm(preferencesvm);
        }
    }

    ResetbindAllPreferencesToForm(preferencesvm: IPreferenceDataVM) {
        // Assign InheritedValue
        preferencesvm = this.preferencesbo.bindInheritedValuesFromImmediateLevelToCurrentLevel(preferencesvm);
        this.preferencesbo.compareSortedOptionsInSortedList(this.preferenceViewModelCompare, preferencesvm);
        this.dynamicFormComponent.setFormData(
            preferencesvm
        );
        window.scrollTo(0, 0);
    }

}