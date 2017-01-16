
import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../../core/base.component';
import { PreferenceLeftNavComponent } from '../../../../shared/leftnavigation/preference.leftnav.component';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { Checkbox } from 'primeng/components/checkbox/checkbox';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { TeamService } from '../../../../services/team.service';
import { ITeam } from '../../../../models/team';
import { IPreferenceDataVM, IPreferenceDataVMCompare } from '../../../../viewmodels/preference.data';
import { IPreferences, ILevelPreference, IPreferenceCategory, ILevelPreferenceSave, IPreferenceSave } from '../../../../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet, IPreferenceCommunity } from '../../../../models/Preferences/preferenceCommunity';
import { CommunityStrategistComponent } from '../../../../shared/communitystrategist/component.communitystrategist';
import { ILocationOptimization, ILocationSettings, ILocationOptimizationCustom, ILocationOptimizationCustomCompare } from '../../../../models/Preferences/locationOptimization';
import { LocationOptimizationComponent } from '../../../../shared/locationoptimization/locationoptimization.component';
import { DynamicWrapperComponent }     from '../../../../shared/dynamicform/dynamicwrapper.component';
import { DynamicControlComponent }     from '../../../../shared/dynamicform/dynamicControl.component';
import { PreferencesBusinessObjects } from '../../../../businessobjects/preference.businessobjects';
import { Observable } from 'rxjs/Rx';
import { PreferenceService } from '../../../../services/preference.service';
import { Dialog } from 'primeng/components/dialog/dialog';
import { SecurityService } from '../../../../services/security.service';
import { SecurityPreferenceComponent } from '../../../../shared/security/security.preference.component';
import { ISecurityPreferencesGet} from '../../../../models/Preferences/securityPreference';
import { SessionHelper } from '../../../../core/session.helper';
import { IRole } from '../../../../models/role';

@Component({
    selector: 'eclipse-admin-teampreference',
    templateUrl: './app/components/admin/preferencesettings/teampref/teampreference.component.html',
    directives: [BreadcrumbComponent,
        PreferenceLeftNavComponent,
        DynamicWrapperComponent,
        CommunityStrategistComponent, LocationOptimizationComponent, Checkbox, AutoComplete, Dialog, SecurityPreferenceComponent],
    providers: [PreferencesBusinessObjects
        , PreferenceService
        , TeamService,
        SecurityService]
})

export class TeamPreferences extends BaseComponent {

    /** Class variables */
    selectedTeamValues: number[] = [];
    selectAll: boolean;
    showPanel: string = "hidden";
    errorMessage: string;
    successMessage: string;
    teamsList: ITeam[] = [];
    FilteredTeamresults: ITeam[] = [];
    selectedteam: any;
    chkallDisable: boolean = true;
    private pushData: any = [];
    dataSource: any[] = [];
    categories: IPreferenceCategory[];
    Preferncelst: IPreferenceSave[] = [];
    preferenceSaveData: ILevelPreferenceSave;
    preferencesToSave: ILevelPreferenceSave;
    preferenceViewModel: IPreferenceDataVM;
    public showSaveBtn: boolean = true;
    public showResetBtn: boolean = true;
    btnSaveDisable: boolean = true;
    btnResetDisable: boolean = true;
    private displayConfirm: boolean;
    private confirmType: string = 'RESET';
    queryStringVal: string;
    team: ITeam = <ITeam>{};
    isMultiPrefsCheck: boolean = false;
    showErrorMessage: boolean;
    showSuccessMessage: boolean;
    preferenceViewModelCompare: IPreferenceDataVMCompare;
    locationOptimization: ILocationOptimizationCustomCompare;
    securityStub: ISecurityPreferencesGet;
    communityStrategist: ICustomCommunityPreferenceGet
    prefPermissionMode: string;

    constructor(private _teamService: TeamService,
        private preferencesbo: PreferencesBusinessObjects,
        private preferenceservice: PreferenceService,
        private activatedRoute: ActivatedRoute) {
        super();
        this.activatedRoute.params
            .map(params => params['teamId'])
            .subscribe((qstr) => {
                this.queryStringVal = qstr;
                console.log('query str value :', this.queryStringVal);
            });
        this.initializePreferenceVMProperties();
        this.setRoleTypePermisionMode(PRIV_TEAMPREF)
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
            this.getTeamsByQueryString(this.queryStringVal);
        }
    }

    /**pass query string values to get teams details */
    private getTeamsByQueryString(teamIds: string) {
        //splitting comma seprated team ids
        let arrTeamsIds = teamIds.split(',');
        this.getTeamDetailsByIds(arrTeamsIds);
        this.chkallDisable = false;
    }

    /**get teamid from query string and bind the checkbox*/   
    getTeamDetailsByIds(teamIds: any[]) {

        let apiArray = [];
        teamIds.forEach(element => {
            apiArray.push(this._teamService.getTeamById(element)
                .map((response: Response) => <any>response.json()))
            this.selectedTeamValues.push(element);
        });

        Observable.forkJoin(apiArray)
            .subscribe(modelsData => {                
                this.teamsList = [];
                let cnt = 0;
                teamIds.forEach(element => {                    
                    this.teamsList.push(modelsData[cnt]);
                    cnt++;
                });
                this.teamAllOnchangeChk();
            });
    }

    /** Bind the Team preferences by Team preference name and specific Team Id*/
    bindPreferencesDataByTeamId(teamPreference: string, teamId: number) {
        this.preferencesbo.getPreferencesData(teamPreference, teamId).subscribe(data => {
            console.log("UI: Data[0] for categories--", data[0]);
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;
            //this.preferencesbo.setInheritedValuesIfNotSetInitially(data[1].preferences);

            /** TODO Pattern Validation */
            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Team", teamId, preferenceCustomComponents);
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
                    // adding Custom controls data
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
        this.selectedTeamValues = [];
        if (checkedValue) {
            this.showPanel = "visible";
            this.teamsList.forEach(element => {
                this.selectedTeamValues.push(element.id);
            });
            if (this.selectedTeamValues.length > 1) {
                this.selectAll = (this.selectedTeamValues.length == this.teamsList.length) ? true : false;
                if (this.selectedTeamValues.length >= 2) {
                    if (!this.isMultiPrefsCheck) {
                        this.isMultiPrefsCheck = true;
                        this.bindPreferencesDataByTeamId("Team", null);
                    }
                    else {  /** do nothing */ }
                }
                else {  /** do nothing */ }
            }
            else {
                this.selectAll = (this.selectedTeamValues.length == this.teamsList.length) ? true : false;
                this.isMultiPrefsCheck = false;
                this.bindPreferencesDataByTeamId("Team", this.selectedTeamValues[0]);
            }

        } else {
            this.showPanel = "hidden";
            this.selectAll = false;
            this.selectedTeamValues = [];
            this.isMultiPrefsCheck = false;
        }
    }
  
    /**check all the records when selection of select all checkbox checked */
    teamAllOnchangeChk() {
        this.btnSaveDisable = this.selectedTeamValues.length == 0;
        this.showPanel = "visible";
        if (this.selectedTeamValues.length > 1) {
            this.selectAll = (this.selectedTeamValues.length == this.teamsList.length) ? true : false;
            if (this.selectedTeamValues.length >= 2) {
                if (!this.isMultiPrefsCheck) {
                    this.isMultiPrefsCheck = true;
                    this.bindPreferencesDataByTeamId("Team", null);
                }
                else {  /** do nothing */ }
            }
            else {  /** do nothing */ }
        }
        else if (this.selectedTeamValues.length == 0) {
            this.showPanel = "hidden";
            this.selectAll = false;
        }
        else {
            this.selectAll = (this.selectedTeamValues.length == this.teamsList.length) ? true : false;
            this.isMultiPrefsCheck = false;
            this.bindPreferencesDataByTeamId("Team", this.selectedTeamValues[0]);
        }
    }

    /**auto complete teams data */
    onTeamLoad(event) {
        this.errorMessage = '';
        this.ResponseToObjects<ITeam>(this._teamService.searchTeams(event.query))
            .subscribe(model => {
                // this.FilteredTeamresults = model.filter(a => a.name.includes(event.query) && !a.isDeleted)
                this.FilteredTeamresults = model.filter(a => !a.isDeleted)
                this.teamsList.forEach(element => {
                    this.FilteredTeamresults = this.FilteredTeamresults.filter(record => record.id != element.id);
                });
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**push the selected team into the check list */
    handleselectedTeam(teams) {
        if (teams.name) {
            this.teamsList.push(teams);
            this.selectedteam = undefined;
            this.chkallDisable = false;
            this.selectedTeamValues.push(teams.id);
            this.teamAllOnchangeChk();
        }
    }

    /** Save preferences data for Custodian level*/
    onSubmit() {
        let timer = Observable.timer(1000, 1000);
        this.setMessageDefaults();
        this.initializePreferencesToSaveModel();
        this.preferencesToSave = this.preferencesbo.getReadyToSavePreferences(this.preferenceViewModel, this.preferenceViewModelCompare);
        this.preferencesbo.saveAllPreferences(this.preferenceViewModel, this.preferencesToSave, this.selectedTeamValues, this.preferenceViewModelCompare)
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
        if (this.selectedTeamValues.length == 1) {
            this.bindPreferencesDataByTeamId("Team", this.selectedTeamValues[0]);
            this.displayConfirm = false;
        }
        else {
            this.bindPreferencesDataByTeamId("Team", null);
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
        if (this.selectedTeamValues.length == 1) {
            this.ResetBindPreferencesDataByTeamId("Team", this.selectedTeamValues[0]);
        }
        else {
            this.ResetBindPreferencesDataByTeamId("Team", null);
        }
    }
    /** Reset Bind the Team preferences by Team preference name and specific Team Id*/
    ResetBindPreferencesDataByTeamId(teamPreference: string, teamId: number) {
        this.preferencesbo.getPreferencesData(teamPreference, teamId).subscribe(data => {
            console.log("UI: Data[0] for categories--", data[0]);
            this.preferenceViewModel.preferenceCategories = data[0].sort((a, b) => a.order - b.order);
            this.preferenceViewModel.levelPreferences = data[1];
            this.preferenceViewModel.prefPermissonMode = this.prefPermissionMode;

            /** Set dropdown selected option to Value field after GET */
            this.preferencesbo.setDropdownValue(this.preferenceViewModel);

            /** TODO: commented for the sake of pending custom components */
            let preferenceCustomComponents = data[1].preferences.filter(x => x.componentType == "custom");
            if (preferenceCustomComponents.length > 0) {
                this.pushData = this.preferencesbo.buildApiServiceCallsForCustomComponents("Team", teamId, preferenceCustomComponents);
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