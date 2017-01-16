import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../../core/base.component';
import { PreferenceLeftNavComponent } from '../../../../shared/leftnavigation/preference.leftnav.component';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { Checkbox } from 'primeng/components/checkbox/checkbox';
import { IAccount} from  '../../../../models/account';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
//import { PortfolioService } from '../../../../services/portfolio.service';
import { LocationOptimizationComponent } from '../../../../shared/locationoptimization/locationoptimization.component';

/** Added for account taking Custodian as Reference */
import { IPreferenceDataVM, IPreferenceDataVMCompare } from '../../../../viewmodels/preference.data';
import { IPreferences, ILevelPreference, IPreferenceCategory, ILevelPreferenceSave, IPreferenceSave } from '../../../../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet } from '../../../../models/Preferences/preferenceCommunity';
import { ILocationOptimization, ILocationSettings, ILocationOptimizationCustom, ILocationOptimizationCustomCompare } from '../../../../models/Preferences/locationOptimization';
import { DynamicWrapperComponent }     from '../../../../shared/dynamicform/dynamicwrapper.component';
import { DynamicControlComponent }     from '../../../../shared/dynamicform/dynamicControl.component';
import { PreferencesBusinessObjects } from '../../../../businessobjects/preference.businessobjects';
import { Observable } from 'rxjs/Rx';
import { PreferenceService } from '../../../../services/preference.service';
import { AccountService } from '../../../../services/account.service';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SecurityService } from '../../../../services/security.service';
import { SecurityPreferenceComponent } from '../../../../shared/security/security.preference.component';
import { ISecurityPreferencesGet} from '../../../../models/Preferences/securityPreference';
import { SessionHelper } from '../../../../core/session.helper';
import { IRole } from '../../../../models/role';

@Component({
    selector: 'eclipse-admin-accountpreference',
    templateUrl: './app/components/admin/preferencesettings/accountpref/accountpreference.component.html',
    directives: [PreferenceLeftNavComponent,
        DynamicWrapperComponent,
        BreadcrumbComponent, Checkbox, AutoComplete, LocationOptimizationComponent, Dialog, SecurityPreferenceComponent],
    providers: [PreferencesBusinessObjects
        , PreferenceService
        , AccountService,
        SecurityService
    ]
})

export class AccountPreferences extends BaseComponent {
    errorMessage: string;
    successMessage: string;
    selectedAccountValues: number[] = [];
    accountsList: any[] = [];
    // selectedAllCheckkBox: boolean;
    selectAll: boolean;
    showPanel: string = "hidden";
    FilteredAccountResults: IAccount[] = [];
    selectedAccount: any;
    chkallDisable: boolean = true;
    private pushData: any = [];
    dataSource: any[] = [];
    categories: IPreferenceCategory[];
    Preferncelst: IPreferenceSave[] = [];
    preferencesToSave: ILevelPreferenceSave;
    preferenceViewModel: IPreferenceDataVM;
    public showSaveBtn: boolean = true;
    public showResetBtn: boolean = true;
    btnSaveDisable: boolean = true;
    btnResetDisable: boolean = true;
    isMultiPrefsCheck: boolean = false;
    showErrorMessage: boolean;
    showSuccessMessage: boolean;
    private displayConfirm: boolean;
    private confirmType: string = 'RESET';
    queryStringVal: string;
    account: IAccount = <IAccount>{};
    preferenceViewModelCompare: IPreferenceDataVMCompare;
    locationOptimization: ILocationOptimizationCustomCompare;
    securityStub: ISecurityPreferencesGet;
    communityStrategist: ICustomCommunityPreferenceGet
    prefPermissionMode: string;

    constructor(
        private _accountService: AccountService,
        private preferencesbo: PreferencesBusinessObjects,
        private preferenceservice: PreferenceService,
        private activatedRoute: ActivatedRoute) {
        super();

        this.activatedRoute.params
            .map(params => params['accountId'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });

        this.initializePreferenceVMProperties();
        this.setRoleTypePermisionMode(PRIV_ACCOUNTPREF)
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
            communityStrategistPreference: {}
        };
    }
    @ViewChild(DynamicWrapperComponent) dynamicFormComponent: DynamicWrapperComponent;

    ngOnInit() {
        if (this.queryStringVal != undefined) {
            this.getAccountsByQueryString(this.queryStringVal);
        }
    }


    /**pass query string values to get teams details */
    private getAccountsByQueryString(teamIds: string) {
        //splitting comma seprated account ids
        let arrAccountsIds = teamIds.split(',');
        this.getAccountDetailsByIds(arrAccountsIds);
        this.chkallDisable = false;
    }

    /**get teamid from query string and bind the checkbox*/
    getAccountDetailsByIds(accountIds: any[]) {
        let apiArray = [];
        accountIds.forEach(element => {
            apiArray.push(this._accountService.searchAccounts(element)
                .map((response: Response) => <any>response.json()))
            this.selectedAccountValues.push(element);
        });

        Observable.forkJoin(apiArray)
            .subscribe(modelsData => {
                let cnt = 0;
                accountIds.forEach(element => {
                    let model = modelsData[cnt].filter(item => item.id == +element);
                    if (model.length > 0) {
                        this.accountsList.push(model[0])
                    }
                    cnt++;
                });
                this.accountOnchangeChk();
            });
    }

    /**AutoComplete Search for Account(s) */
    onAccountLoad(event) {
        this.ResponseToObjects<IAccount>(this._accountService.searchAccounts(event.query))
            .subscribe(account => {
                this.FilteredAccountResults = account;
                this.accountsList.forEach(element => {
                    this.FilteredAccountResults = this.FilteredAccountResults.filter(record => record.id != element.id);
                });
            }, error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /** Bind the account preferences by account preference name and specific account Id*/
    bindPreferencesDataByAccountId(accountPreference: string, accountId: number) {
        this.preferencesbo.getPreferencesData(accountPreference, accountId).subscribe(data => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;
            //  this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);

            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Account", accountId, preferenceCustomComponents);
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
            preferenceSecurityData: this.securityStub
        }
        // let sortedLists = this.preferenceViewModelCompare.preferences.filter(x => x.valueType == "SortedList");
        // if (Object.keys(sortedLists).length>0) {
        //     sortedLists.forEach(element => {
        //        element.selectedOptions = (Object.keys(element.selectedOptions).length > 0) ? Object.values(element.selectedOptions) : Object.values(element.options);
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
        this.selectedAccountValues = [];
        if (checkedValue) {
            this.showPanel = "visible";
            this.accountsList.forEach(element => {
                this.selectedAccountValues.push(element.id);
            });
            if (this.selectedAccountValues.length > 1) {
                this.selectAll = (this.selectedAccountValues.length == this.accountsList.length) ? true : false;
                if (this.selectedAccountValues.length >= 2) {
                    if (!this.isMultiPrefsCheck) {
                        this.isMultiPrefsCheck = true;
                        this.bindPreferencesDataByAccountId("Account", null);
                    }
                    else {  /** do nothing */ }
                }
                else {  /** do nothing */ }
            }
            else {
                this.selectAll = (this.selectedAccountValues.length == this.accountsList.length) ? true : false;
                this.isMultiPrefsCheck = false;
                this.bindPreferencesDataByAccountId("Account", this.selectedAccountValues[0]);
            }

        } else {
            this.showPanel = "hidden";
            this.selectAll = false;
            this.selectedAccountValues = [];
            this.isMultiPrefsCheck = false;
        }
    }

    /**Select all check box to checked if all records are selected */
    accountOnchangeChk() {
        this.btnSaveDisable = this.selectedAccountValues.length == 0;
        this.showPanel = "visible";
        if (this.selectedAccountValues.length > 1) {
            this.selectAll = (this.selectedAccountValues.length == this.accountsList.length) ? true : false;
            if (this.selectedAccountValues.length >= 2) {
                if (!this.isMultiPrefsCheck) {
                    this.isMultiPrefsCheck = true;
                    this.bindPreferencesDataByAccountId("Account", null);
                }
                else {  /** do nothing */ }
            }
            else {  /** do nothing */ }
        }
        else if (this.selectedAccountValues.length == 0) {
            this.showPanel = "hidden";
            this.selectAll = false;
        }
        else {
            this.selectAll = (this.selectedAccountValues.length == this.accountsList.length) ? true : false;
            this.isMultiPrefsCheck = false;
            this.bindPreferencesDataByAccountId("Account", this.selectedAccountValues[0]);
        }
    }

    /**push the selected account into the check list */
    handleSelectedAccount(accountitem) {
        if (accountitem.name) {
            this.accountsList.push(accountitem);
            this.selectedAccount = undefined;
            this.chkallDisable = false;
            this.selectedAccountValues.push(accountitem.id);
            this.accountOnchangeChk();
        }
    }

    /** Save preferences data for Custodian level*/
    onSubmit() {
        let timer = Observable.timer(1000, 1000);
        this.setMessageDefaults();
        this.initializePreferencesToSaveModel();
        this.preferencesToSave = this.preferencesbo.getReadyToSavePreferences(this.preferenceViewModel, this.preferenceViewModelCompare);
        this.preferencesbo.saveAllPreferences(this.preferenceViewModel, this.preferencesToSave, this.selectedAccountValues, this.preferenceViewModelCompare)
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
        if (this.selectedAccountValues.length == 1) {
            this.bindPreferencesDataByAccountId("Account", this.selectedAccountValues[0]);
            this.displayConfirm = false;
        }
        else {
            this.bindPreferencesDataByAccountId("Account", null);
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
        // reset the Form with initial API Load data  
        if (this.selectedAccountValues.length == 1) {
            this.resetBindPreferencesDataByAccountId("Account", this.selectedAccountValues[0]);
        }
        else {
            this.resetBindPreferencesDataByAccountId("Account", null);
        }
    }
    /** Bind the account preferences by account preference name and specific account Id*/
    resetBindPreferencesDataByAccountId(accountPreference: string, accountId: number) {
        this.preferencesbo.getPreferencesData(accountPreference, accountId).subscribe(data => {
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;
            //  this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);

            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Account", accountId, preferenceCustomComponents);
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