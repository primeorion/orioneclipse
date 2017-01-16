import { Injectable }       from '@angular/core';
import { Http, Response } from '@angular/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {  ILevelPreferenceSave } from '../models/Preferences/preference';
import { IPreferences, IPreferenceCategory} from '../models/Preferences/preference';
import { ICommunityStrategist, ICommunity, IPreferenceCommunity } from '../models/Preferences/preferenceCommunity';
import { Observable }     from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ILocationOptimizationCustom } from '../models/Preferences/locationOptimization';
import { ISecurityPreferencesGet } from '../models/Preferences/securityPreference';


@Injectable()
export class PreferenceService {

    private _prefsForLevelEndPoint = 'preference';

    constructor(private http: Http, private _httpClient: HttpClient) { }

    /* Fetch Preference categories by Level */
    /**
       (new)  /preference/:levelName/categories
     */
    getPrefLevelCategories(levelName: string) {
        return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
            levelName + "/" +
            "categories");
    }

    /* Fetch Preference categories by Level */
    getpreferencesForLevel(levelName: string, levelId: number) {
        return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
            levelName + "/" +
            levelId);
    }

    /** Fetch Preference communities */
    /**
       (new)   /preference/:levelName/communityStrategist/:recordId/:communityStrategistPreferenceId/:preferenceValueId/:inheritedPreferenceValueId
     */
    getPreferenceCommunities(levelName: string,
        recordId: number,
        componentName: string,
        preferenceId: number,
        preferenceValueId: number,
        inheritedPreferenceValueId: any) {
        if (recordId != null) {            
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                recordId + "/" +
                preferenceId + "/" +
                preferenceValueId + "/" +
                inheritedPreferenceValueId)
                .map((response: Response) => <IPreferenceCommunity>response.json());
        }
        else {
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                preferenceId + "/" + "master")
                .map((response: Response) => <IPreferenceCommunity>response.json());
        }
    }

    /** To get Location Optimization custom component details */
    /**
       (new)  /preference/:levelName/locationOptimization/:recordId/:locationPreferenceId/:preferenceValueId/:inheritedPreferenceValueId
     */
    getLocationOptimizationPreferences(levelName: string,
        recordId: number,
        componentName: string,
        preferenceId: number,
        preferenceValueId: number,
        inheritedPreferenceValueId: any) {
        if (recordId != null) {
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                recordId + "/" +
                preferenceId + "/" +
                preferenceValueId + "/" +
                inheritedPreferenceValueId)
                .map((response: Response) => <ILocationOptimizationCustom>response.json());
        }
        else {
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                preferenceId + "/" + "master")
                .map((response: Response) => <ILocationOptimizationCustom>response.json());
        }
    }

    /** To get Security Preference custom component details */
    /**
       (new)  levelName/securityPreference/:recordId/:securityPreferenceId/:preferenceValueId
     */
    getSecurityPreferences(levelName: string,
        recordId: number,
        componentName: string,
        preferenceId: number,
        preferenceValueId: number,
        inheritedPreferenceValueId: any) {
        if (recordId != null) {
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                recordId + "/" +
                preferenceId + "/" +
                preferenceValueId + "/"
                + inheritedPreferenceValueId
            )
                .map((response: Response) => <ISecurityPreferencesGet>response.json());
        }
        else {            
            return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
                levelName + "/" +
                componentName + "/" +
                preferenceId + "/" + "master")
                .map((response: Response) => <ISecurityPreferencesGet>response.json());
        }
    }

    /**To update team */
    updatePreference(preference: ILevelPreferenceSave) {
        return this._httpClient.postData(this._prefsForLevelEndPoint + "/updateAll", preference);
    }

    /** To get Master preferences for Bulk GET */
    /**
       (new)  /preference/:levelName/master
     */
    getMasterPreferences(master: string, levelName: string) {
        return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
            levelName + "/" +
            master);
    }

    /** Update Mass preferences */
    updateMassPreferences(preference: ILevelPreferenceSave) {
        return this._httpClient.postData(this._prefsForLevelEndPoint + "/" +
            "Action" + "/" +
            "massUpdateAll", preference);
    }

    /** Generic service to get custom component preferences data 
     * (Location Optimization, communityStrategist, Securities) 
     * LO: /preference/:levelName/communityStrategist/:recordId/:communityStrategistPreferenceId/:preferenceValueId/:inheritedPreferenceValueId
     * CS: /preference/:levelName/locationOptimization/:recordId/:locationPreferenceId/:preferenceValueId/:inheritedPreferenceValueId
     * */
    // getCustomComponentPreferencesStructure(levelName: string, recordId: number,
    //     componentName: string, preferenceId: number,
    //     preferenceValueId: number, inheritedPreferenceValueId: any) {
    //     switch (componentName) {
    //         case "locationOptimization":
    //             if (recordId != null) {
    //                 return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
    //                                                 levelName + "/" +
    //                                                 componentName + "/" +
    //                                                 recordId + "/" +
    //                                                 preferenceId + "/" + 
    //                                                 preferenceValueId + "/" + 
    //                                                 inheritedPreferenceValueId)
    //                     .map((response: Response) => <ILocationOptimizationCustom>response.json());
    //             }
    //             else {
    //                 return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
    //                                                 levelName + "/" +
    //                                                 componentName + "/" +
    //                                                 preferenceId + "/" +  "master")
    //                     .map((response: Response) => <ILocationOptimizationCustom>response.json());
    //             }
    //         case "communityStrategist":
    //             if (recordId != null) {
    //                 return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
    //                                                 levelName + "/" +
    //                                                 componentName + "/" +
    //                                                 recordId + "/" +
    //                                                 preferenceId + "/" + 
    //                                                 preferenceValueId + "/" + 
    //                                                 inheritedPreferenceValueId)
    //                     .map((response: Response) => <IPreferenceCommunity>response.json());
    //             }
    //             else {
    //                 return this._httpClient.getData(this._prefsForLevelEndPoint + "/" +
    //                                                 levelName + "/" +
    //                                                 componentName + "/" +
    //                                                 preferenceId + "/" +  "master")
    //                     .map((response: Response) => <IPreferenceCommunity>response.json());
    //             }
    //     }
    // }

}

