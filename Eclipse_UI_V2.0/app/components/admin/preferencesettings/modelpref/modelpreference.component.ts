
import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../../core/base.component';
import { PreferenceLeftNavComponent } from '../../../../shared/leftnavigation/preference.leftnav.component';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { ITeamModel } from '../../../../models/team';
import { IModelDetails } from '../../../../models/modeling/modeldetails';

import { Checkbox } from 'primeng/components/checkbox/checkbox';
import { ModelService } from '../../../../services/model.service';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { IPreferenceDataVM, IPreferenceDataVMCompare } from '../../../../viewmodels/preference.data';
import { IPreferences, ILevelPreference, IPreferenceCategory, ILevelPreferenceSave, IPreferenceSave } from '../../../../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet } from '../../../../models/Preferences/preferenceCommunity';
import { CommunityStrategistComponent } from '../../../../shared/communitystrategist/component.communitystrategist';
import { ILocationOptimization, ILocationSettings, ILocationOptimizationCustom, ILocationOptimizationCustomCompare } from '../../../../models/Preferences/locationOptimization';
import { LocationOptimizationComponent } from '../../../../shared/locationoptimization/locationoptimization.component';
import { DynamicWrapperComponent } from '../../../../shared/dynamicform/dynamicwrapper.component';
import { DynamicControlComponent } from '../../../../shared/dynamicform/dynamicControl.component';
import { PreferencesBusinessObjects } from '../../../../businessobjects/preference.businessobjects';
import { Observable } from 'rxjs/Rx';
import { PreferenceService } from '../../../../services/preference.service';
import { TeamService } from '../../../../services/team.service';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SecurityService } from '../../../../services/security.service';
import { SecurityPreferenceComponent } from '../../../../shared/security/security.preference.component';
import { ISecurityPreferencesGet } from '../../../../models/Preferences/securityPreference';
import { IRedemptionFeePreferencesGet } from '../../../../models/Preferences/redemptionfeepreference';/** NEWLY ADDED */
import { SessionHelper } from '../../../../core/session.helper';
import { IRole } from '../../../../models/role';

@Component({
    selector: 'eclipse-admin-modelpreference',
    templateUrl: './app/components/admin/preferencesettings/modelpref/modelpreference.component.html',
    providers: [PreferencesBusinessObjects
        , PreferenceService
        , TeamService
        , ModelService,
        SecurityService]
})

export class ModelPreferences extends BaseComponent {
    errorMessage: string;
    successMessage: string;
    selectedModelValues: number[] = [];
    // modelList: ITeamModel[] = [];
    modelList: IModelDetails[] = [];
    // selectedAllCheckkBox: boolean;
    selectAll: boolean = false;
    showPanel: string = "hidden";
    // FilteredModelresults: ITeamModel[] = [];
    FilteredModelresults: IModelDetails[] = [];
    selectedmodel: any;
    chkallDisable: boolean = true;
    private pushData: any = [];
    /**location optimization component attributes */
    dataSource: any[] = [];
    categories: IPreferenceCategory[];
    Preferncelst: IPreferenceSave[] = [];
    preferencesToSave: ILevelPreferenceSave;
    preferenceViewModel: IPreferenceDataVM;
    public showSaveBtn: boolean = true;
    public showResetBtn: boolean = true;
    btnSaveDisable: boolean = true;
    btnResetDisable: boolean = true;
    private displayConfirm: boolean;
    private confirmType: string = 'RESET';
    queryStringVal: string;
    // teamModel: ITeamModel = <ITeamModel>{};
    teamModel: IModelDetails = <IModelDetails>{};
    isMultiPrefsCheck: boolean = false;
    showErrorMessage: boolean;
    showSuccessMessage: boolean;
    preferenceViewModelCompare: IPreferenceDataVMCompare;
    locationOptimization: ILocationOptimizationCustomCompare;
    securityStub: ISecurityPreferencesGet;
    redemptionFeeStub: IRedemptionFeePreferencesGet; /** NEWLY ADDED */
    communityStrategist: ICustomCommunityPreferenceGet
    prefPermissionMode: string;

    constructor(private _teamService: TeamService,
        private _modelService: ModelService,
        private preferencesbo: PreferencesBusinessObjects,
        private preferenceservice: PreferenceService,
        private activatedRoute: ActivatedRoute) {
        super();
        this.activatedRoute.params
            .map(params => params['modelId'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
        this.initializePreferenceVMProperties();
        this.setRoleTypePermisionMode(PRIV_MODELPREF)

    }
    setRoleTypePermisionMode(prefType) {
        let sessionHelper = new SessionHelper();
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

    /**Intialize properties */
    initializePreferenceVMProperties() {
        this.preferenceViewModel = <IPreferenceDataVM>{
            preferenceCategories: <IPreferenceCategory[]>{},
            levelPreferences: <ILevelPreference>{},
            preferenceCommunities: <ICustomCommunityPreference>{},
            preferenceLocationOptimization: <ILocationOptimizationCustom>{}
        }
    }

    /**Initialize PreferencesToSave Model properties */
    initializePreferencesToSaveModel() {
        this.preferencesToSave = <ILevelPreferenceSave>{
            defaultPreferences: [],
            locationOptimizationPreference: {},
            communityStrategistPreference: {},
            securityPreferences: {}, /** NEWLY ADDED */
            redemptionFeePreferences: {} /** NEWLY ADDED */
        };
    }

    @ViewChild(DynamicWrapperComponent) dynamicFormComponent: DynamicWrapperComponent;

    ngOnInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.getModelsByQueryString(this.queryStringVal);
        }
    }

    /**pass query string values to get teams details */
    private getModelsByQueryString(modelIds: string) {
        //splitting comma seprated model ids
        let arrModelIds = modelIds.split(',');
        this.chkallDisable = true;
        this.getModelDetailsByIDs(arrModelIds);
    }

    /**retrive model data by modelid  */
    getModelDetailsByIDs(modelIds: any[]) {
        let apiArray = [];
        modelIds.forEach(element => {
            apiArray.push(this._modelService.getModelDetail(element).map((response: Response) => <any>response.json()))
            this.selectedModelValues.push(element);
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                let cnt = 0;
                modelIds.forEach(element => {
                    this.modelList.push(modelsData[cnt]);
                    cnt++;
                });
                this.selectAllCheckBox(true);
            });
    }

    /** Bind the Model preferences by Model preference name and specific Model Id*/
    bindPreferencesDataByModelId(modelPreference: string, modelId: number) {
        this.preferencesbo.getPreferencesData(modelPreference, modelId).subscribe((data: any[]) => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;
            // this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);

            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Model", modelId, preferenceCustomComponents);
                this.getCustomComponentsAndBindToForm(this.preferenceViewModel, this.pushData);
            }
            else {
                this.bindAllPreferencesToForm(this.preferenceViewModel);
            }
            // when we are same page , reference value issue we have to make Preferncelst empty      
            this.Preferncelst = [];
            this.bindPreferenceCompareData(data[1].preferences)
            this.btnSaveDisable = false;
            this.btnResetDisable = false;
        },
            Error => {
                this.btnSaveDisable = true;
                this.btnResetDisable = true;
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

    /** bind all Preferences to Form */
    bindAllPreferencesToForm(preferencesvm: IPreferenceDataVM) {
        // compare Data object
        this.preferenceViewModelCompare = <IPreferenceDataVMCompare>{
            preferences: this.Preferncelst,
            preferenceCommunities: this.communityStrategist,
            preferenceLocationOptimization: this.locationOptimization,
            preferenceSecurityData: this.securityStub,
            preferenceRedemptionFeeData: this.redemptionFeeStub /** NEWLY ADDED */
        }
        // let sortedLists = this.preferenceViewModelCompare.preferences.filter(x => x.valueType == "SortedList");
        // if (Object.keys(sortedLists).length>0) {
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

    /**check all the records when selection of select all checkbox checked */
    selectAllCheckBox(checkedValue) {
        this.chkallDisable = false;
        this.selectedModelValues = [];
        if (checkedValue) {
            this.showPanel = "visible";
            this.modelList.forEach(element => {
                this.selectedModelValues.push(element.id);
            });
            if (this.selectedModelValues.length > 1) {
                this.selectAll = (this.selectedModelValues.length == this.modelList.length) ? true : false;
                if (this.selectedModelValues.length >= 2) {
                    if (!this.isMultiPrefsCheck) {
                        this.isMultiPrefsCheck = true;
                        this.bindPreferencesDataByModelId("Model", null);
                    }
                    else {  /** do nothing */ }
                }
                else {  /** do nothing */ }
            }
            else {
                this.selectAll = (this.selectedModelValues.length == this.modelList.length) ? true : false;
                this.isMultiPrefsCheck = false;
                this.bindPreferencesDataByModelId("Model", this.selectedModelValues[0]);
            }

        } else {
            this.showPanel = "hidden";
            this.selectAll = false;
            this.selectedModelValues = [];
            this.isMultiPrefsCheck = false;
        }
    }

    /**check all the records when selection of select all checkbox checked */
    modelOnchangeChk() {
        this.btnSaveDisable = this.selectedModelValues.length == 0;
        this.showPanel = "visible";
        if (this.selectedModelValues.length > 1) {
            this.selectAll = (this.selectedModelValues.length == this.modelList.length) ? true : false;
            if (this.selectedModelValues.length >= 2) {
                if (!this.isMultiPrefsCheck) {
                    this.isMultiPrefsCheck = true;
                    this.bindPreferencesDataByModelId("Model", null);
                }
                else {  /** do nothing */ }
            }
            else {  /** do nothing */ }
        }
        else if (this.selectedModelValues.length == 0) {
            this.showPanel = "hidden";
            this.selectAll = false;
        }
        else {
            this.selectAll = (this.selectedModelValues.length == this.modelList.length) ? true : false;
            this.isMultiPrefsCheck = false;
            this.bindPreferencesDataByModelId("Model", this.selectedModelValues[0]);
        }
    }

    /* AutoComplete Search by ModelName */
    onModelLoad(event) {
        this.ResponseToObjects<IModelDetails>(this._modelService.getModelSearch(event.query))
            .subscribe(model => {
                this.FilteredModelresults = model;
                this.modelList.forEach(element => {
                    this.FilteredModelresults = this.FilteredModelresults.filter(record => record.id != element.id);
                });
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**push the selected model into check list */
    handleselectedModel(modelitem) {
        if (modelitem.name) {
            this.modelList.push(modelitem)
            this.selectedmodel = undefined;
            this.chkallDisable = false;
            this.selectedModelValues.push(modelitem.id);
            this.modelOnchangeChk();
        }
    }

    /** Save preferences data for Custodian level*/
    onSubmit() {
        let timer = Observable.timer(1000, 1000);
        this.setMessageDefaults();
        this.initializePreferencesToSaveModel();
        this.preferencesToSave = this.preferencesbo.getReadyToSavePreferences(this.preferenceViewModel, this.preferenceViewModelCompare);
        this.preferencesbo.saveAllPreferences(this.preferenceViewModel, this.preferencesToSave, this.selectedModelValues, this.preferenceViewModelCompare)
            .subscribe(data => {
                this.updateCompareData(this.preferenceViewModel)
                this.showSuccessMessage = true;
                this.successMessage = 'Successfully saved!';
                timer.subscribe(t => this.tickerFunc(t));

            },
            error => {
                this.showErrorMessage = true;
                this.errorMessage = 'Error occured while saving the data!';
                timer.subscribe(t => this.tickerFunc(t));

            }
            );
    }
    tickerFunc(tick) {
        if (tick == 0) {
            this.setMessageDefaults();
            this.resetForm();
        }
    }
    /** Display confirmation message before resetting */
    onCancel() {
        this.displayConfirm = true;
    }

    /** reset the form with previous values */
    resetForm() {
        // reset the Form with initial API Load data  
        if (this.selectedModelValues.length == 1) {
            this.bindPreferencesDataByModelId("Model", this.selectedModelValues[0]);
            this.displayConfirm = false;
        }
        else {
            this.bindPreferencesDataByModelId("Model", null);
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
            preferenceSecurityData: this.securityStub,
            preferenceRedemptionFeeData: this.redemptionFeeStub
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
        /** TODO: CHECK THIS AFTER INTEGRATION */
        // Redemption Fee Preference Compare
        if (preferencesvm.preferenceRedemptionFeeData != undefined) {
            if (Object.keys(preferencesvm.preferenceRedemptionFeeData).length > 0) {
                this.redemptionFeeStub = <IRedemptionFeePreferencesGet>{
                    levelName: preferencesvm.preferenceRedemptionFeeData.levelName,
                    recordId: preferencesvm.preferenceRedemptionFeeData.recordId,
                    id: preferencesvm.preferenceRedemptionFeeData.id,
                    preferenceId: preferencesvm.preferenceRedemptionFeeData.preferenceId,
                    name: preferencesvm.preferenceRedemptionFeeData.name,
                    displayName: preferencesvm.preferenceRedemptionFeeData.displayName,
                    categoryType: preferencesvm.preferenceRedemptionFeeData.categoryType,
                    componentType: preferencesvm.preferenceRedemptionFeeData.componentType,
                    componentName: preferencesvm.preferenceRedemptionFeeData.componentName,
                    redemptionFeePreferences: Object.values(preferencesvm.preferenceRedemptionFeeData.redemptionFeePreferences),
                    inheritedRedemptionFeePreferences: preferencesvm.preferenceRedemptionFeeData.inheritedRedemptionFeePreferences
                }
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
        if (this.selectedModelValues.length == 1) {
            this.resetBindPreferencesDataByModelId("Model", this.selectedModelValues[0]);
        }
        else {
            this.resetBindPreferencesDataByModelId("Model", null);
        }
    }
    /** Bind the Model preferences by Model preference name and specific Model Id*/
    resetBindPreferencesDataByModelId(modelPreference: string, modelId: number) {
        this.preferencesbo.getPreferencesData(modelPreference, modelId).subscribe((data: any[]) => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;
            // this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);

            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Model", modelId, preferenceCustomComponents);
                this.ResetgetCustomComponentsAndBindToForm(this.preferenceViewModel, this.pushData);
            }
            else {
                this.ResetbindAllPreferencesToForm(this.preferenceViewModel);
            }
            // when we are same page , reference value issue we have to make Preferncelst empty      
            this.Preferncelst = [];
            this.bindPreferenceCompareData(this.preferenceViewModel.levelPreferences.preferences)
            this.btnSaveDisable = false;
            this.btnResetDisable = false;
        },
            Error => {
                this.btnSaveDisable = true;
                this.btnResetDisable = true;
            });
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
        preferencesvm = this.preferencesbo.bindInheritedValuesFromImmediateLevelToCurrentLevel(preferencesvm);
        this.preferencesbo.compareSortedOptionsInSortedList(this.preferenceViewModelCompare, preferencesvm);
        this.dynamicFormComponent.setFormData(
            preferencesvm
        );
        window.scrollTo(0, 0);
    }
}