
import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../../core/base.component';
import { PreferenceLeftNavComponent } from '../../../../shared/leftnavigation/preference.leftnav.component';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { DynamicWrapperComponent } from '../../../../shared/dynamicform/dynamicwrapper.component';
import { DynamicControlComponent } from '../../../../shared/dynamicform/dynamicControl.component';
import { PreferenceService } from '../../../../services/preference.service';
import { IPreferences, ILevelPreference, IPreferenceCategory, ILevelPreferenceSave, IPreferenceSave, } from '../../../../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet } from '../../../../models/Preferences/preferenceCommunity';
import { CommunityStrategistComponent } from '../../../../shared/communitystrategist/component.communitystrategist';
import { Observable } from 'rxjs/Rx';
import { PreferencesBusinessObjects } from '../../../../businessobjects/preference.businessobjects';
import { IPreferenceDataVM, IPreferenceDataVMCompare } from '../../../../viewmodels/preference.data';
import { LocationOptimizationComponent } from '../../../../shared/locationoptimization/locationoptimization.component';
import { ILocationOptimization, ILocationSettings, ILocationOptimizationCustom, ILocationOptimizationCustomCompare } from '../../../../models/Preferences/locationOptimization';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Checkbox } from 'primeng/components/checkbox/checkbox';
import { ICustodian } from '../../../../models/custodian';
import { CustodianService } from '../../../../services/custodian.service';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SecurityService } from '../../../../services/security.service';
import { SecurityPreferenceComponent } from '../../../../shared/security/security.preference.component';
import { ISecurityPreferencesGet } from '../../../../models/Preferences/securityPreference';
import { IRedemptionFeePreferencesGet } from '../../../../models/Preferences/redemptionfeepreference';/** NEWLY ADDED */
import { SessionHelper } from '../../../../core/session.helper';
import { IRole } from '../../../../models/role';

@Component({
    selector: 'eclipse-admin-custodianpreference',
    templateUrl: './app/components/admin/preferencesettings/custodianpref/custodianpreference.component.html',
    providers: [
        PreferencesBusinessObjects
        , PreferenceService
        , CustodianService,
        SecurityService
    ]
})

export class CustodianPreferences extends BaseComponent {

    /** Class variables */
    categories: IPreferenceCategory[];
    Preferncelst: IPreferenceSave[] = [];
    preferencesToSave: ILevelPreferenceSave;
    preferenceViewModel: IPreferenceDataVM;
    private pushData: any = [];
    /**location optimization component attributes */
    dataSource: any[] = [];
    selectedCustodianValues: number[] = [];
    custodiansList: any[] = [];
    FilteredCustodianresults: any[] = [];
    selectAll: boolean;
    showPanel: string = "hidden";
    chkallDisable: boolean = true;
    selectedcustodian: any;
    errorMessage: string;
    successMessage: string;
    public showSaveBtn: boolean = true;
    public showResetBtn: boolean = true;
    btnSaveDisable: boolean = true;
    btnResetDisable: boolean = true;
    private displayConfirm: boolean;
    private confirmType: string = 'RESET';
    queryStringVal: string;
    custodian: ICustodian = <ICustodian>{};
    isMultiPrefsCheck: boolean = false;
    showErrorMessage: boolean;
    showSuccessMessage: boolean;
    preferenceViewModelCompare: IPreferenceDataVMCompare;
    locationOptimization: ILocationOptimizationCustomCompare;
    securityStub: ISecurityPreferencesGet;
    redemptionFeeStub: IRedemptionFeePreferencesGet; /** NEWLY ADDED */
    communityStrategist: ICustomCommunityPreferenceGet
    prefPermissionMode: string;

    constructor(private _custodianService: CustodianService,
        private preferencesbo: PreferencesBusinessObjects,
        private preferenceService: PreferenceService,
        private activatedRoute: ActivatedRoute
    ) {
        super();

        this.activatedRoute.params
            .map(params => params['Id'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
        this.initializePreferenceVMProperties();
        this.setRoleTypePermisionMode(PRIV_CUSTODIANPREF);
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
            this.getcustodiansByQueryString(this.queryStringVal);
        }
    }

    /**pass query string values to get custodians details */
    private getcustodiansByQueryString(custodianIds: string) {
        //splitting comma seprated custodian ids
        let arrcustodiansIds = custodianIds.split(',');
        this.getCustodianDetailsByIds(arrcustodiansIds);
        this.chkallDisable = false;
    }

    /*** To Get selected custodian details by Id*/
    getCustodianDetailsByIds(custodianIds: any[]) {
        let apiArray = [];
        custodianIds.forEach(element => {
            apiArray.push(this._custodianService.getCustodianById(element).map((response: Response) => <any>response.json()))
            this.selectedCustodianValues.push(element);
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                let cnt = 0;
                custodianIds.forEach(element => {
                    this.custodiansList.push(modelsData[cnt]);
                    cnt++;
                });
                this.selectAllCheckBox(true);
            });
    }

    /** Bind the custodian preferences by custodian preference name and specific custodian Id*/
    bindPreferencesDataByCustId(custodianPreference: string, custodianId: number) {
        this.preferencesbo.getPreferencesData(custodianPreference, custodianId).subscribe((data: any[]) => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;

            //   this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);
            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Custodian", custodianId, preferenceCustomComponents);
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
        this.selectedCustodianValues = [];
        if (checkedValue) {
            this.showPanel = "visible";
            this.custodiansList.forEach(element => {
                this.selectedCustodianValues.push(element.id);
            });
            if (this.selectedCustodianValues.length > 1) {
                this.selectAll = (this.selectedCustodianValues.length == this.custodiansList.length) ? true : false;
                if (this.selectedCustodianValues.length >= 2) {
                    if (!this.isMultiPrefsCheck) {
                        this.isMultiPrefsCheck = true;
                        this.bindPreferencesDataByCustId("Custodian", null);
                    }
                    else {  /** do nothing */ }
                }
                else {  /** do nothing */ }
            }
            else {
                this.selectAll = (this.selectedCustodianValues.length == this.custodiansList.length) ? true : false;
                this.isMultiPrefsCheck = false;
                this.bindPreferencesDataByCustId("Custodian", this.selectedCustodianValues[0]);
            }

        } else {
            this.showPanel = "hidden";
            this.selectAll = false;
            this.selectedCustodianValues = [];
            this.isMultiPrefsCheck = false;
        }
    }

    /**check all the records when selection of select all checkbox checked */
    custodianAllOnchangeChk() {
        this.btnSaveDisable = this.selectedCustodianValues.length == 0;
        this.showPanel = "visible";
        if (this.selectedCustodianValues.length > 1) {
            this.selectAll = (this.selectedCustodianValues.length == this.custodiansList.length) ? true : false;
            if (this.selectedCustodianValues.length >= 2) {
                if (!this.isMultiPrefsCheck) {
                    this.isMultiPrefsCheck = true;
                    this.bindPreferencesDataByCustId("Custodian", null);
                }
                else {  /** do nothing */ }
            }
            else {  /** do nothing */ }
        }
        else if (this.selectedCustodianValues.length == 0) {
            this.showPanel = "hidden";
            this.selectAll = false;
        }
        else {
            this.selectAll = (this.selectedCustodianValues.length == this.custodiansList.length) ? true : false;
            this.isMultiPrefsCheck = false;
            this.bindPreferencesDataByCustId("Custodian", this.selectedCustodianValues[0]);
        }
    }

    /**auto complete custodian data */
    onCustodianLoad(event) {
        this.errorMessage = '';
        this.ResponseToObjects<ICustodian>(this._custodianService.custodianSearch(event.query))
            .subscribe(model => {
                // this.FilteredCustodianresults = model.filter(a => a.name.includes(event.query) && !a.isDeleted);
                this.FilteredCustodianresults = model.filter(a => !a.isDeleted);
                this.custodiansList.forEach(element => {
                    this.FilteredCustodianresults = this.FilteredCustodianresults.filter(record => record.id != element.id);
                });
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**push the selected custodian into the check list */
    handleselectedCustodian(custodianitem) {
        if (custodianitem.name) {
            this.custodiansList.push(custodianitem);
            this.selectedcustodian = undefined;
            this.chkallDisable = false;
            this.selectedCustodianValues.push(custodianitem.id);
            this.custodianAllOnchangeChk();
        }
    }

    onSubmit() {
        let timer = Observable.timer(1000, 1000);
        this.setMessageDefaults();
        this.initializePreferencesToSaveModel();
        this.preferencesToSave = this.preferencesbo.getReadyToSavePreferences(this.preferenceViewModel, this.preferenceViewModelCompare);
        this.preferencesbo.saveAllPreferences(this.preferenceViewModel, this.preferencesToSave, this.selectedCustodianValues, this.preferenceViewModelCompare)
            .subscribe(data => {
                this.updateCompareData(this.preferenceViewModel);
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
        if (this.selectedCustodianValues.length == 1) {
            this.bindPreferencesDataByCustId("Custodian", this.selectedCustodianValues[0]);
            this.displayConfirm = false;
        }
        else {
            this.bindPreferencesDataByCustId("Custodian", null);
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
        if (this.selectedCustodianValues.length == 1) {
            this.resetBindPreferencesDataByCustId("Custodian", this.selectedCustodianValues[0]);
        }
        else {
            this.resetBindPreferencesDataByCustId("Custodian", null);
        }
    }
    /** Bind the custodian preferences by custodian preference name and specific custodian Id*/
    resetBindPreferencesDataByCustId(custodianPreference: string, custodianId: number) {
        this.preferencesbo.getPreferencesData(custodianPreference, custodianId).subscribe((data: any[]) => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;

            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Custodian", custodianId, preferenceCustomComponents);
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