
import { Injectable, Inject } from '@angular/core';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { PreferenceService } from '../services/preference.service';
import { SecurityService } from '../services/security.service';
import { IPreferences, ILevelPreference, IPreferenceCategory, ILevelPreferenceSave } from '../models/Preferences/preference';
import { IPreferenceCommunity, ICustomCommunityPreferenceSave } from '../models/Preferences/preferenceCommunity';
import { ISecurityPreference, ICustomSecurityPreferenceSave } from '../models/Preferences/securityPreference';

import { Observable } from 'rxjs/Rx';
import { IPreferenceDataVM } from '../viewmodels/preference.data';
import { PreferenceEnums } from '../libs/preference.enums';
import { CustodianService } from '../services/custodian.service';
import { ILocationOptimizationCustom, ILocationOptimizationSave } from '../models/Preferences/locationOptimization';
import { convertEnumValuesToString, toPrimitiveInt, toPrimitiveIntNull, removeDuplicates } from '../core/functions';
import { IRedemptionFeePreference, ICustomRedemptionFeePreferenceSave } from '../models/Preferences/redemptionfeepreference';


@Injectable()
export class PreferencesBusinessObjects {
    preferenceSaveData: ILevelPreferenceSave;
    prefEnums: any;
    constructor(private preferenceservice: PreferenceService
        , private securityService: SecurityService
    ) {
        this.prefEnums = convertEnumValuesToString(PreferenceEnums);
    }

    /**--------------------------------------------------GET START -------------------------------------------- */
    /* Get Prefrence levels and Categories */
    getPreferencesData(levelName: string, id: number) {
        /** Get Categories and Level preferences */
        if (id != null) {
            return Observable.forkJoin(
                this.preferenceservice.getPrefLevelCategories(levelName)
                    .map((response: Response) => <IPreferenceCategory>response.json()),
                this.preferenceservice.getpreferencesForLevel(levelName, id)
                    .map((response: Response) => <ILevelPreference>response.json())
            );
        }
        /** Get categories and Master Preferences if no id exists */
        else {
            return Observable.forkJoin(this.preferenceservice.getPrefLevelCategories(levelName)
                .map((res: Response) => <IPreferenceCategory>res.json()),
                this.preferenceservice.getMasterPreferences(this.prefEnums.master, levelName)
                    .map((res: Response) => <ILevelPreference>res.json())
            );
        }
    }

    /* Get custom components data*/
    getCustomComponents(observableData: any, preferencesvm: any) {
        let preferenceCustomDataData = preferencesvm.levelPreferences.preferences.filter(x => x.componentType == this.prefEnums.Custom.toLowerCase());
        let cnt = 0;
        /** Get the Api's data accordingly from apiArray */
        preferenceCustomDataData.forEach(element => {
            switch (element.componentName) {
                /** Community Strategist Enabled List Cascading Control */
                case this.prefEnums.CommunityStrategistEnabledListCascadingControl:
                    let communityStrategist = observableData.filter(x => x.preferenceId == element.preferenceId);
                    if (communityStrategist.length > 0) {
                        // if (element.isInherited) {

                        //     communityStrategist[0].strategists = (Object.keys(communityStrategist[0].strategists).length > 0) ?
                        //         (communityStrategist[0].strategists.strategistIds == null) ?
                        //             communityStrategist[0].inheritedStrategists :
                        //             communityStrategist[0].strategists :
                        //         communityStrategist[0].strategists;
                        // }
                        preferencesvm.preferenceCommunities = communityStrategist[0];
                    }
                    break;
                /** Location Optimization DataGrid */
                case this.prefEnums.LocationOptimizationDataGrid:

                    let locationOptimization = observableData.filter(x => x.componentName == PreferenceEnums.LocationOptimizationDataGrid);
                    if (locationOptimization.length > 0) {
                        // if (element.isInherited) {
                        //     locationOptimization[0].subClasses = (Object.keys(locationOptimization[0].subClasses).length > 0) ?
                        //         locationOptimization[0].subClasses :
                        //         locationOptimization[0].inheritedSubClasses;
                        // }
                        preferencesvm.preferenceLocationOptimization = locationOptimization[0];
                    }
                    break;
                /** Security preferences DataGrid */
                case this.prefEnums.SecurityDataGrid:
                    let securityPref = observableData.filter(x => x.componentName == PreferenceEnums.SecurityDataGrid);
                    if (securityPref.length > 0) {
                        // if (element.isInherited) {

                        //     securityPref[0].securityPreferences = (Object.keys(securityPref[0].securityPreferences).length > 0) ?
                        //         securityPref[0].inheritedSecurityPreferences :
                        //         securityPref[0].securityPreferences;
                        // }
                        preferencesvm.preferenceSecurityData = securityPref[0];
                    }
                    break;
                /**TODO: CHECK THIS AFTER INTEGRATION */
                /** Redemption Fee preferences DataGrid */
                case this.prefEnums.RedemptionFeeDataGrid:
                    let redemptionFeePref = observableData.filter(x => x.componentName == PreferenceEnums.RedemptionFeeDataGrid);
                    if (redemptionFeePref.length > 0) {
                        // if (element.isInherited) {

                        //     securityPref[0].securityPreferences = (Object.keys(securityPref[0].securityPreferences).length > 0) ?
                        //         securityPref[0].inheritedSecurityPreferences :
                        //         securityPref[0].securityPreferences;
                        // }
                        preferencesvm.preferenceRedemptionFeeData = redemptionFeePref[0];
                    }
                    break;
            }
            cnt++;
        });
    }
    /**------------------------------------------------- GET END -------------------------------------------------*/

    /** ----------------------------------------------- BUILD CUSTOM COMPONENT API START--------------------------*/

    /** Prepare an array of ApiServiceCalls for Custom Components */
    buildApiServiceCallsForCustomComponents(levelName: string,
        recordId: number,
        preferenceData: any) {
        let apiArray = [];
        /** Fill the custom component apis within Array */
        preferenceData.forEach(element => {
            switch (element.componentName) {
                /** Community Strategist Enabled List Cascading Control */
                case this.prefEnums.CommunityStrategistEnabledListCascadingControl:
                    apiArray.push(this.preferenceservice.getPreferenceCommunities(levelName,
                        recordId,
                        this.prefEnums.communityStrategist,
                        element.preferenceId,
                        element.id,
                        element.inheritedFromValueId
                    ));
                    break;
                /** Location Optimization DataGrid */
                case this.prefEnums.LocationOptimizationDataGrid:
                    apiArray.push(this.preferenceservice.getLocationOptimizationPreferences(levelName,
                        recordId,
                        this.prefEnums.locationOptimization,
                        element.preferenceId,
                        element.id,
                        element.inheritedFromValueId));
                    break;
                /** Security preferences DataGrid */
                case this.prefEnums.SecurityDataGrid:
                    apiArray.push(this.preferenceservice.getSecurityPreferences(levelName,
                        recordId,
                        this.prefEnums.securityPreference,
                        element.preferenceId,
                        element.id,
                        element.inheritedFromValueId));
                    break;
                /** Redemption Fee preferences Data Grid */
                /** TODO: */
                case this.prefEnums.RedemptionFeeDataGrid:
                    apiArray.push(this.preferenceservice.getRedemptionFeePreferences(levelName,
                        recordId,
                        this.prefEnums.redemptionFeePreference,
                        element.preferenceId,
                        element.id,
                        element.inheritedFromValueId));
                    break;
            }
        });
        return apiArray;
    }
    /** ----------------------------------------------- BUILD CUSTOM COMPONENT API END ----------------------------*/

    /**--------------------------------------------- FETCH Edited values - START ----------------------------------*/
    /** Fetch the altered dropdown values from form */
    fetchEditedDropdownSelectedOptions(element: any, apiPreferences: any, preferencesToSave: any) {
        let filteredPreference: any;
        let isSaveToDB: boolean = false;
        filteredPreference = apiPreferences.filter(x => x.componentType == this.prefEnums.Default.toLowerCase()
            && x.preferenceId == element.preferenceId);

        if (filteredPreference[0].selectedOptions.length > 0 && element.selectedOptions.length > 0) {
            if (filteredPreference[0].selectedOptions[0].id != element.selectedOptions[0].id) {
                isSaveToDB = true;
                filteredPreference[0].selectedOptions = [];
                filteredPreference[0].selectedOptions = element.selectedOptions;
            }
        }
        else if (filteredPreference[0].selectedOptions.length == 0 && element.selectedOptions.length == 0) {
            isSaveToDB = false;
        }
        else {
            isSaveToDB = true;
            filteredPreference[0].selectedOptions = [];
            filteredPreference[0].selectedOptions = element.selectedOptions;
        }

        if (isSaveToDB) {
            let dropdownselectedOptions = [];
            if (element.selectedOptions.length > 0) {
                dropdownselectedOptions = element.options.filter(x => x.id == element.selectedOptions[0].id)
            }
            else {
                filteredPreference[0].value = null
            }
            preferencesToSave.push({
                id: filteredPreference[0].id,
                preferenceId: filteredPreference[0].preferenceId,
                valueType: filteredPreference[0].valueType,
                componentType: filteredPreference[0].componentType,
                componentName: filteredPreference[0].componentName,
                selectedOptions: dropdownselectedOptions,
                value: filteredPreference[0].value
            });
        }
        return preferencesToSave;
    }

    /** Fetch the edited checkbox and textbox values from form */
    fetchEditedCheckboxnTextValues(element: any, apiPreferences: any, preferencesToSave: any) {
        let filteredPreference: any;
        if (element.componentType == this.prefEnums.Default.toLowerCase()) {
            filteredPreference = apiPreferences.filter(x => x.componentType == this.prefEnums.Default.toLowerCase()
                && x.preferenceId == element.preferenceId
                && x.value == element.value);
            if (filteredPreference.length == 0) {
                let preferenceData = apiPreferences.filter(x => x.componentType == this.prefEnums.Default.toLowerCase()
                    && x.preferenceId == element.preferenceId);
                preferenceData[0].value = element.value;
                preferencesToSave.push({
                    id: preferenceData[0].id,
                    preferenceId: preferenceData[0].preferenceId,
                    valueType: preferenceData[0].valueType,
                    componentType: preferenceData[0].componentType,
                    componentName: preferenceData[0].componentName,
                    selectedOptions: preferenceData[0].selectedOptions,
                    value: element.value,
                    selectedIndicatorValue: element.indicatorValue
                });
            }
        }
        return preferencesToSave;
    }

    /** Fetch the edited Sorted list values from form */
    fetchEditedSortedListSelectedOptions(vmPreferenceItem, getApiSortedOptions, preferencesToSave) {
        let flagIsOrderChanged: boolean = false;
        let getDataObjects = (Object.keys(getApiSortedOptions).length > 0) ?
            getApiSortedOptions : null;

        let postDataObjects = (Object.keys(vmPreferenceItem.selectedOptions).length > 0) ?
            vmPreferenceItem.selectedOptions : vmPreferenceItem.options;

        // save data to DB [collection]
        if ((getDataObjects == null) && (postDataObjects != null)) {
            flagIsOrderChanged = true;
        }
        // save data to DB [collection] || NULL
        else if ((getDataObjects != null) && (postDataObjects != null)) {
            //Compare not same / equal
            let isReordered = getApiSortedOptions.every((v, i) => v === vmPreferenceItem.selectedOptions[i])
            if (!isReordered) {
                flagIsOrderChanged = true;
            }
        }

        if (flagIsOrderChanged) {
            let sortedOptions = [];
            let cnt = 1;
            postDataObjects.forEach(element => {
                sortedOptions.push({ "id": element.id, "name": element.name, "order": cnt });
                cnt++;
            });
            preferencesToSave.push({
                id: vmPreferenceItem.id,
                preferenceId: vmPreferenceItem.preferenceId,
                valueType: vmPreferenceItem.valueType,
                componentType: vmPreferenceItem.componentType,
                componentName: vmPreferenceItem.componentName,
                selectedOptions: sortedOptions,
                value: vmPreferenceItem.value
            });
        }
        return preferencesToSave;
    }

    /** Fetch the edited LocationOptimization values */
    fetchEditedLocationOptimizationOptions(locationOptimization: any, apiPreferences: any) {
        return <ILocationOptimizationSave>{
            id: locationOptimization.id,
            preferenceId: locationOptimization.preferenceId,
            subClasses: (Object.keys(locationOptimization.subClasses).length > 0) ? locationOptimization.subClasses : null
        }
    }

    /** Fetch the edited communityStrategistPreference values */
    fetchEditedcommunityStrategistPreference(communityStrategistPreference: any, apiPreferences: any) {

        return <ICustomCommunityPreferenceSave>{
            id: communityStrategistPreference.id,
            preferenceId: communityStrategistPreference.preferenceId,
            strategists:
            <IPreferenceCommunity>{
                strategistIds: communityStrategistPreference.strategists.strategistIds,
                modelAccessLevel: communityStrategistPreference.strategists.modelAccessLevel,
                communityModels: communityStrategistPreference.strategists.communityModels
            }
        }
    }

    /** Fetch the edited Security Preference values */
    fetchEditedsecurityPreferrencePreference(securityPreference: any, apiPreferences: any) {
        return <ICustomSecurityPreferenceSave>{
            id: securityPreference.id,
            preferenceId: securityPreference.preferenceId,
            securities: (Object.keys(securityPreference.securityPreferences).length > 0) ? securityPreference.securityPreferences : null
        }
    }

    /** Fetch the edited Redemption Fee Preference values */
    fetchEditedRedemptionFeePreference(redemptionFeePreference: any, apiPreferences: any) {
        return <ICustomRedemptionFeePreferenceSave>{
            id: redemptionFeePreference.id,
            preferenceId: redemptionFeePreference.preferenceId,
            redemptionFees: (Object.keys(redemptionFeePreference.redemptionFeePreferences).length > 0) ? redemptionFeePreference.redemptionFeePreferences : null
        }
    }

    /**----------------------------------------------FETCH Edited values - END------------------------------------*/

    /**------------------------------------------- SET UI Values START -------------------------------------------*/
    /** Set the dropdown selected option to Value field*/
    setDropdownValue(preferenceViewModel: any) {
        preferenceViewModel.levelPreferences.preferences.forEach(preference => {
            if (preference.componentName != null) {
                if (preference.componentName.toLowerCase() == this.prefEnums.Dropdown.toLowerCase()) {
                    if (preference.selectedOptions.length > 0) {
                        preference.value = preference.selectedOptions[0].id;
                    }
                }
                else if (preference.componentName.toLowerCase() == "textbox") {
                    if (preference.valueType == "Decimal") {
                        /** Set validation for number type - Decimal */
                        preference.valueType = "Number";
                        // preference.pattern = "[0-9]?[0-9]?(\.[0-9][0-9]?)?{0,2}";
                        preference.pattern = /^([0-9])?(\.[0-9]{1,2})?$/;
                    }
                    else {
                        preference.pattern = "[0-9]*";
                    }
                    preference.minValue = (preference.minValue != null) ? preference.minValue : 0;
                    preference.maxValue = (preference.maxValue != null) ? preference.maxValue : Number.MAX_VALUE;
                    preference.watermarkText = (preference.watermarkText != null) ? preference.watermarkText : "Please enter value";
                }
                preference.isValid = true;
            }
        });
    }
    /**------------------------------------------- SET UI Values END ---------------------------------------------*/

    /**--------------------------------------- NEW SAVE/UPDATE START ----------------------------------------------- */
    /** get ReadyToSave Preferences DATA for saving*/
    getReadyToSavePreferences(prefrenceVM: IPreferenceDataVM, apiPreferences: any) {

        /** LOCAL Method variables */
        let prefEnums = convertEnumValuesToString(PreferenceEnums),
            // filteredPreference = [],
            isSaveToDB = false;
        let preferencesToSave: ILevelPreferenceSave = <ILevelPreferenceSave>{
            level: prefrenceVM.levelPreferences.level,
            id: prefrenceVM.levelPreferences.id,
            defaultPreferences: [],
            locationOptimizationPreference: {},
            communityStrategistPreference: {},
            securityPreferences: {}
        }
        prefrenceVM.levelPreferences.preferences.forEach(element => {
            // filteredPreference = [];
            isSaveToDB = false;

            switch (element.componentType) {

                /** For Default preferences fetch the edited dropdown selected options */
                case prefEnums.Default.toLowerCase():

                    switch (element.componentName.toLowerCase()) {
                        case prefEnums.Dropdown.toLowerCase():
                            preferencesToSave.defaultPreferences = this.fetchEditedDropdownSelectedOptions(element,
                                apiPreferences.preferences,
                                preferencesToSave.defaultPreferences);
                            break;
                        default:
                            preferencesToSave.defaultPreferences = this.fetchEditedCheckboxnTextValues(element,
                                apiPreferences.preferences,
                                preferencesToSave.defaultPreferences);
                            break;
                    }
                    break;
                /** For custom preferences fetch the edited/re-ordered sorted options */
                case prefEnums.Custom.toLowerCase():
                    switch (element.componentName.toLowerCase()) {
                        case prefEnums.PriorityRankingSortedlist.toLowerCase():
                            let priorityrankingsortedlist = apiPreferences.preferences.filter(x => x.componentName.toLowerCase() == prefEnums.PriorityRankingSortedlist.toLowerCase())
                            preferencesToSave.defaultPreferences = this.fetchEditedSortedListSelectedOptions(element,
                                priorityrankingsortedlist[0].selectedOptions,
                                preferencesToSave.defaultPreferences);
                            break;
                        case prefEnums.TaxLotDepletionMethodSortedlist.toLowerCase():
                            let taxlotdepletionmethodSortedlist = apiPreferences.preferences.filter(x => x.componentName.toLowerCase() == prefEnums.TaxLotDepletionMethodSortedlist.toLowerCase())
                            preferencesToSave.defaultPreferences = this.fetchEditedSortedListSelectedOptions(element,
                                taxlotdepletionmethodSortedlist[0].selectedOptions,
                                preferencesToSave.defaultPreferences);
                            break;
                        case prefEnums.LocationOptimizationDataGrid.toLowerCase():
                            preferencesToSave.locationOptimizationPreference = this.fetchEditedLocationOptimizationOptions(prefrenceVM.preferenceLocationOptimization,
                                apiPreferences.preferenceLocationOptimization);
                            break;

                        case prefEnums.CommunityStrategistEnabledListCascadingControl.toLowerCase():
                            preferencesToSave.communityStrategistPreference = this.fetchEditedcommunityStrategistPreference(prefrenceVM.preferenceCommunities,
                                apiPreferences.preferenceCommunities);
                            break;

                        case prefEnums.SecurityDataGrid.toLowerCase():
                            preferencesToSave.securityPreferences = this.fetchEditedsecurityPreferrencePreference(prefrenceVM.preferenceSecurityData,
                                apiPreferences.preferenceSecurityData);
                            break;
                        /**TODO: RECHECK THIS PLACEHOLDER ONCE INTEGRATED */
                        case prefEnums.RedemptionFeeDataGrid.toLowerCase():
                            preferencesToSave.redemptionFeePreferences = this.fetchEditedRedemptionFeePreference(prefrenceVM.preferenceRedemptionFeeData,
                                apiPreferences.preferenceRedemptionFeeData);
                            break;
                    }
            }
        });
        return preferencesToSave;
    }

    /** Save preferences for Normal and MASS Update */
    saveAllPreferences(prefrenceVM: any, Preferncelst: any, selectedLevelIds: number[], apiPreference: any) {
        this.preferenceSaveData = <ILevelPreferenceSave>{
            defaultPreferences: [],
            locationOptimizationPreference: {},
            communityStrategistPreference: {}
        };

        /** Convert the strings to integer/s if any within Number array */
        let convertedSelectedIds = (selectedLevelIds != null) ?
            toPrimitiveInt(selectedLevelIds) : null;

        if (selectedLevelIds != null && selectedLevelIds.length > 1) {            /** MASS UPDATE */

            this.preferenceSaveData =
                {
                    level: prefrenceVM.levelPreferences.level,
                    id: null,
                    ids: convertedSelectedIds,
                    defaultPreferences: Preferncelst.defaultPreferences,
                    locationOptimizationPreference: (Object.keys(Preferncelst.locationOptimizationPreference).length > 0) ?
                        (Preferncelst.locationOptimizationPreference.subClasses != null) ? Preferncelst.locationOptimizationPreference : null : null,
                    communityStrategistPreference: (Object.keys(Preferncelst.communityStrategistPreference).length > 0) ?
                        (Preferncelst.communityStrategistPreference.strategistIds != null) ? Preferncelst.communityStrategistPreference : null : null,
                    securityPreferences: (Preferncelst.securityPreferences.securities != null) ? Preferncelst.securityPreferences : null,
                    /** TODO: CHECK THIS AFTER INTEGRATION */
                    redemptionFeePreferences: (Preferncelst.redemptionFeePreferences != undefined) ?
                        ((Preferncelst.redemptionFeePreferences.securities != null) ? Preferncelst.redemptionFeePreferences : null) : null
                };

            console.log("MASS Preference Save Data: ", JSON.stringify(this.preferenceSaveData));
            return this.preferenceservice.updateMassPreferences(this.preferenceSaveData)
                .map((response: Response) => <any>response.json());
        }
        /** UPDATE */
        else {

            this.preferenceSaveData =
                {
                    level: prefrenceVM.levelPreferences.level,
                    id: prefrenceVM.levelPreferences.id,
                    ids: null,
                    defaultPreferences: Preferncelst.defaultPreferences,
                    locationOptimizationPreference: (Object.keys(Preferncelst.locationOptimizationPreference).length > 0) ?
                        this.comparelocationOptimizationPreferenceToSave(Preferncelst.locationOptimizationPreference, apiPreference) : null,
                    communityStrategistPreference: (Object.keys(Preferncelst.communityStrategistPreference).length > 0) ?
                        this.comparecommunityStrategistPreferenceToSave(Preferncelst.communityStrategistPreference, apiPreference) : null,
                    securityPreferences: (Object.keys(Preferncelst.securityPreferences).length > 0) ?
                        this.compareSecurityPreferencesToSave(Preferncelst.securityPreferences, apiPreference) : null,
                    /** TODO: CHECK THIS AFTER INTEGRATION */
                    redemptionFeePreferences: (Preferncelst.redemptionFeePreferences != undefined) ?
                        ((Object.keys(Preferncelst.redemptionFeePreferences).length > 0) ?
                            this.compareSecurityPreferencesToSave(Preferncelst.redemptionFeePreferences, apiPreference) : null) : null
                };
            console.log("Preference Save Data: ", JSON.stringify(this.preferenceSaveData));
            return this.preferenceservice.updatePreference(this.preferenceSaveData)
                .map((response: Response) => <any>response.json());
        }
    }


    /**--------------------------------------- NEW SAVE/UPDATE END ------------------------------------------------- */

    /** */
    setInheritedValuesIfNotSetInitially(preferencesLst) {
        preferencesLst.forEach(element => {
            if (element.isInherited) {
                switch (element.componentType) {
                    case this.prefEnums.Default.toLowerCase():
                        this.setInheritedValuesForDefaultControls(element);
                        break;
                    case this.prefEnums.Custom.toLowerCase():
                        this.setInheritedValuesForCustomControls(element);
                        break;
                }
            }
        });
    }

    setInheritedValuesForDefaultControls(prefElement: any) {
        switch (prefElement.componentName.toLowerCase()) {
            case this.prefEnums.Textbox.toLowerCase(): // textbox
            case this.prefEnums.Checkbox.toLowerCase(): // checkbox
                console.log(prefElement.componentName, "Control value change", prefElement.inheritedValue)
                prefElement.value = (prefElement.value == null) ? prefElement.inheritedValue : prefElement.value;
                break;
            case this.prefEnums.Dropdown.toLowerCase():
                console.log(prefElement.componentName, "Control value change", prefElement.inheritedSelectedOptions)
                prefElement.selectedOptions = (Object.keys(prefElement.selectedOptions).length == 0) ? prefElement.inheritedSelectedOptions : prefElement.selectedOptions;
                break;
        }
    }

    setInheritedValuesForCustomControls(prefElement: any) {
        switch (prefElement.componentName.toLowerCase()) {
            // SortedLsit
            case this.prefEnums.PriorityRankingSortedlist.toLowerCase():
            case this.prefEnums.TaxLotDepletionMethodSortedlist.toLowerCase():

                prefElement.selectedOptions = (Object.keys(prefElement.selectedOptions).length == 0) ? prefElement.inheritedSelectedOptions : prefElement.selectedOptions;

                break;

        }
    }


    /** COMPARE */
    // communityStrategistPreference to Save COMPARE
    comparecommunityStrategistPreferenceToSave(postMainObject: any, getMainObject: any) {

        let getDataObjects = (getMainObject.preferenceCommunities.strategists.strategistIds != null) ?
            toPrimitiveIntNull(getMainObject.preferenceCommunities.strategists.strategistIds) : null;

        let postDataObjects = (postMainObject.strategists.strategistIds != null) ?
            toPrimitiveIntNull(postMainObject.strategists.strategistIds) : null;

        // save data to DB empty
        if ((getDataObjects == null) && (postDataObjects == null)) {
            return postMainObject
        }
        // save data to DB [collection]
        if ((getDataObjects == null) && (postDataObjects != null)) {
            return postMainObject
        }

        // save data to DB [empty]
        if ((getDataObjects != null) && (postDataObjects == null)) {
            postMainObject.strategists.strategistIds = [];
            postMainObject.strategists.modelAccessLevel = null;
            postMainObject.strategists.communityModels = [];
            return postMainObject;
        }

        3 // save data to DB [collection] || NULL
        if ((getDataObjects != null) && (postDataObjects != null)) {

            // length not equal
            if (getMainObject.preferenceCommunities.strategists.strategistIds.length != postMainObject.strategists.strategistIds.length) {
                return postMainObject;
            }
            //Compare not same / equal
            let compareObject = getMainObject.preferenceCommunities.strategists.strategistIds.every((v, i) => v == postMainObject.strategists.strategistIds[i])
            if (!compareObject) {
                return postMainObject;
            }
            else {
                compareObject = getMainObject.preferenceCommunities.strategists.modelAccessLevel === postMainObject.strategists.modelAccessLevel
                if (!compareObject) {
                    return postMainObject;
                }
                else {

                    if (Object.keys(getMainObject.preferenceCommunities.strategists.communityModels).length == (Object.keys(postMainObject.strategists.communityModels).length)) {
                        compareObject = getMainObject.preferenceCommunities.strategists.communityModels.every((v, i) => v === postMainObject.strategists.communityModels[i])
                        if (!compareObject) {
                            return postMainObject;
                        }
                        postMainObject.strategists.strategistIds = null;
                        postMainObject.strategists.modelAccessLevel = null;
                        postMainObject.strategists.communityModels = null;
                        return postMainObject;
                    }
                    else {
                        return postMainObject;
                    }
                }
            }
        }
    }
    /** COMPARE */
    // SecurityPreferences to Save COMPARE
    compareSecurityPreferencesToSave(postMainObject: any, getMainObject: any) {
        let getDataObjects = (getMainObject.preferenceSecurityData.securityPreferences != null) ?
            toPrimitiveIntNull(getMainObject.preferenceSecurityData.securityPreferences) : null;

        let postDataObjects = (postMainObject.securities != null) ?
            toPrimitiveIntNull(postMainObject.securities) : null;

        // save data to DB empty
        if ((getDataObjects == null) && (postDataObjects == null)) {
            return postMainObject
        }
        // save data to DB [collection]
        if ((getDataObjects == null) && (postDataObjects != null)) {
            return postMainObject
        }

        // save data to DB [empty]
        if ((getDataObjects != null) && (postDataObjects == null)) {
            postMainObject.securities = [];
            return postMainObject;
        }

        3 // save data to DB [collection] || NULL
        if ((getDataObjects != null) && (postDataObjects != null)) {

            // length not equal
            if (getMainObject.preferenceSecurityData.securityPreferences.length != postMainObject.securities.length) {
                return postMainObject;
            }
            //Compare not same / equal
            let compareObject = getMainObject.preferenceSecurityData.securityPreferences.every((v, i) => v === postMainObject.securities[i])
            if (!compareObject) {
                return postMainObject;
            }
            postMainObject.securities = null;
            return postMainObject;
        }
    }

    /** locationOptimizationPreference to Save COMPARE */
    comparelocationOptimizationPreferenceToSave(postMainObject: any, getMainObject: any) {

        let getDataObjects = (getMainObject.preferenceLocationOptimization.subClasses != null) ?
            toPrimitiveIntNull(getMainObject.preferenceLocationOptimization.subClasses) : null;

        let postDataObjects = (postMainObject.subClasses != null) ?
            toPrimitiveIntNull(postMainObject.subClasses) : null;

        1  // save data to DB empty
        if ((getDataObjects == null) && (postDataObjects == null)) {
            return postMainObject
        }
        // save data to DB [collection]
        if ((getDataObjects == null) && (postDataObjects != null)) {
            return postMainObject
        }

        2 // save data to DB [empty]
        if ((getDataObjects != null) && (postDataObjects == null)) {
            postMainObject.subClasses = [];
            return postMainObject;
        }

        3 // save data to DB [collection] || NULL
        if ((getDataObjects != null) && (postDataObjects != null)) {
            // length not equal
            if (getMainObject.preferenceLocationOptimization.subClasses.length != postMainObject.subClasses.length) {
                return postMainObject;
            }
            //Compare not same / equal
            let compareObject = getMainObject.preferenceLocationOptimization.subClasses.every((v, i) => v === postMainObject.subClasses[i])
            if (!compareObject) {
                return postMainObject;
            }
            postMainObject.subClasses = null;
            return postMainObject

        }
    }

    /** */
    compareSortedOptionsInSortedList(preferenceViewModelCompare: any, preferencesvm: any) {
        let sortedLists = preferenceViewModelCompare.preferences.filter(x => x.valueType.toLowerCase() == this.prefEnums.sortedlist);
        if (Object.keys(sortedLists).length > 0) {
            sortedLists.forEach(element => {
                //  element.selectedOptions = 

                if ((Object.keys(element.selectedOptions).length != Object.keys(element.options).length)) {
                    element.selectedOptions = (<any>Object).values(element.options);
                }
                else if ((Object.keys(element.selectedOptions).length > 0)) {
                    element.selectedOptions = (<any>Object).values(element.selectedOptions);
                }
                else {
                    element.selectedOptions = (<any>Object).values(element.options)
                }
            });
        }

        // PreferenceVM Sortedlist selectionOption compare
        let vmsortedLists = preferencesvm.levelPreferences.preferences.filter(x => x.valueType.toLowerCase() == this.prefEnums.sortedlist);
        if (Object.keys(vmsortedLists).length > 0) {
            vmsortedLists.forEach(element => {

                let getOptions = Object.values(element.options);
                let getSelectedoptions = Object.values(element.selectedOptions);
                getSelectedoptions.forEach(elementSelectedOptions => {
                    getOptions.push(elementSelectedOptions);
                });
                // compare length if both length not equal ( options & SelectedOptions)                
                if (Object.keys(getSelectedoptions).length != Object.keys(getOptions).length) {
                    element.selectedOptions = removeDuplicates(getOptions, "id");
                }

            });
        }
    }
    /** BIND the inherited values of immediate upper level to the current level if any */
    bindInheritedValuesFromImmediateLevelToCurrentLevel(prefrenceVM: IPreferenceDataVM) {
        let prefEnums = convertEnumValuesToString(PreferenceEnums);
        prefrenceVM.levelPreferences.preferences.forEach(elementpref => {
            // filteredPreference = [];

            switch (elementpref.componentType) {
                /** For Default preferences fetch the edited dropdown selected options */
                /** DEFAULT: Assign inherited values to Actual value 
                 * Textbox
                 * Dropdown
                 * Checkbox
                 */
                case prefEnums.Default.toLowerCase():

                    switch (elementpref.componentName.toLowerCase()) {
                        case prefEnums.Dropdown.toLowerCase():

                            if (elementpref.inheritedSelectedOptions.length > 0) {
                                let InheritValue = elementpref.inheritedSelectedOptions[0]["id"];
                                let inheritName = elementpref.inheritedSelectedOptions[0]["name"];
                                elementpref.selectedOptions = [{ id: InheritValue, order: 0, name: inheritName }];
                                elementpref.value = InheritValue;
                            }
                            else {
                                elementpref.value = "";
                                elementpref.selectedOptions = [{ id: "", order: 0 }];
                            }

                            break;
                        default:
                            if (elementpref.inheritedValue) {
                                elementpref.value = elementpref.inheritedValue
                                elementpref.indicatorValue = elementpref.inheritedIndicatorValue;
                            }
                            else {
                                elementpref.value = "";
                            }
                            break;
                    }
                    break;
                /** For custom preferences fetch the edited/re-ordered sorted options */
                case prefEnums.Custom.toLowerCase():
                    /** CUSTOM: Assign inherited values to Actual value 
                     * Community strategists
                    * Location Optimizations
                    * Securities
                    * Sorted List-PriorityRankingSortedlist, TaxLotDepletionMethodSortedlist
                    */
                    switch (elementpref.componentName.toLowerCase()) {
                        case prefEnums.PriorityRankingSortedlist.toLowerCase():
                        case prefEnums.TaxLotDepletionMethodSortedlist.toLowerCase():
                            if (elementpref.inheritedSelectedOptions.length > 0) {
                                elementpref.selectedOptions = [];
                                elementpref.selectedOptions = (<any>Object).values(elementpref.inheritedSelectedOptions);
                            }
                            else {
                                elementpref.selectedOptions = (<any>Object).values(elementpref.options);
                            }

                            break;
                        case prefEnums.LocationOptimizationDataGrid.toLowerCase():
                            if (elementpref.isInherited) {

                                if (Object.keys(prefrenceVM.preferenceLocationOptimization.inheritedSubClasses).length > 0) {
                                    prefrenceVM.preferenceLocationOptimization.subClasses = (<any>Object).values(prefrenceVM.preferenceLocationOptimization.inheritedSubClasses);
                                }
                                else {
                                    prefrenceVM.preferenceLocationOptimization.subClasses = [];
                                }
                            }
                            else {
                                prefrenceVM.preferenceLocationOptimization.subClasses = [];
                            }
                            break;

                        case prefEnums.CommunityStrategistEnabledListCascadingControl.toLowerCase():
                            if (elementpref.isInherited) {
                                if (Object.keys(prefrenceVM.preferenceCommunities.inheritedStrategists).length > 0) {
                                    prefrenceVM.preferenceCommunities.strategists.strategistIds = (prefrenceVM.preferenceCommunities.inheritedStrategists.strategistIds != null) ? Object.values(prefrenceVM.preferenceCommunities.inheritedStrategists.strategistIds) : null;
                                    prefrenceVM.preferenceCommunities.strategists.modelAccessLevel = prefrenceVM.preferenceCommunities.inheritedStrategists.modelAccessLevel;
                                    prefrenceVM.preferenceCommunities.strategists.communityModels = (prefrenceVM.preferenceCommunities.inheritedStrategists.strategistIds != null) ? Object.values(prefrenceVM.preferenceCommunities.inheritedStrategists.communityModels) : null;
                                }
                                else {
                                    prefrenceVM.preferenceCommunities.strategists.strategistIds = null;
                                    prefrenceVM.preferenceCommunities.strategists.modelAccessLevel = null;
                                    prefrenceVM.preferenceCommunities.strategists.communityModels = null;
                                }
                            }
                            else {
                                prefrenceVM.preferenceCommunities.strategists.strategistIds = null;
                                prefrenceVM.preferenceCommunities.strategists.modelAccessLevel = null;
                                prefrenceVM.preferenceCommunities.strategists.communityModels = null;
                            }

                            break;

                        case prefEnums.SecurityDataGrid.toLowerCase():
                            if (elementpref.isInherited) {
                                prefrenceVM.preferenceSecurityData.securityPreferences = (<any>Object).values(prefrenceVM.preferenceSecurityData.inheritedSecurityPreferences);
                            }
                            else {
                                prefrenceVM.preferenceSecurityData.securityPreferences = [];
                            }
                            break;

                        /** TODO: CHECK THIS AFTER INTEGRATION */
                        case prefEnums.RedemptionFeeDataGrid.toLowerCase():
                            if (elementpref.isInherited) {
                                prefrenceVM.preferenceRedemptionFeeData.redemptionFeePreferences = (<any>Object).values(prefrenceVM.preferenceRedemptionFeeData.inheritedRedemptionFeePreferences);
                            }
                            else {
                                prefrenceVM.preferenceRedemptionFeeData.redemptionFeePreferences = [];
                            }
                            break;
                    }
            }
        });

        return prefrenceVM;
    }

}