import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { IPreferences} from '../../models/Preferences/preference';
import { ICommunity, IPreferenceCommunity, ICustomCommunityPreference} from '../../models/Preferences/preferenceCommunity';
import { PreferenceService } from '../../services/preference.service';
import { CommunityService } from '../../services/community.service';
import { ICommunityModel, ICommunityStrategist } from '../../models/community';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import {convertEnumValuesToString, toPrimitiveInt} from '../../core/functions';

@Component({
    selector: 'preference-community-stratagists',
    templateUrl: './app/shared/communitystrategist/component.communitystrategist.html',
    providers: [PreferenceService, CommunityService]
})

export class CommunityStrategistComponent extends BaseComponent {
    communityStrategist: ICommunityStrategist[] = [];
    communities: any[] = [];
    modelAccessLevel: number;
    selectedStrategistItems: any[] = [];
    modelStrategistItems: any[] = [];
    errorMessage: string;
    @Input() displaypermission: string;
    @Input() CommunityStrategies: ICustomCommunityPreference;

    //** Community Strategist list
    selectedStrategitNames: any[] = [];
    selecetdModel: string;
    selectedCommunityNames: any[] = [];



    constructor(private _preferenceService: PreferenceService, private _communityService: CommunityService) {
        super();
        this.modelAccessLevel = 1;
        this.CommunityStrategies = <ICustomCommunityPreference>{};
    }

    ngOnInit() {
        this.getStragies();
    }
    getInheritedOptions(communityStrategies: IPreferenceCommunity) {
        if (Object.keys(communityStrategies).length > 0) {
            this.CommunityStrategies.strategists = communityStrategies;
            this.getStragies();
        }
        else {
            this.selectedStrategistItems = [];
            this.modelAccessLevel = 1;
        }
    }

    /**load Stragies and models based on strategy id */
    getStragies() {

        this.selectedStrategitNames = [];
        this.selecetdModel = "";
        this.selectedCommunityNames = [];
        this.modelStrategistItems = [];
        this.communities = [];

        let apiArray = [];
        apiArray.push(this._communityService.getCommunityStrategist()
            .map((response: Response) => <ICommunityStrategist>response.json()));

        if (Object.keys(this.CommunityStrategies.strategists).length > 0) {

            apiArray.push(this._communityService.getCommunityModelByStrategistId(this.CommunityStrategies.strategists.strategistIds)
                .map((response: Response) => <ICommunityModel[]>response.json()));
        }

        Observable.forkJoin(apiArray)
            .subscribe((model: any[]) => {
                model[0].forEach(element => {
                    this.modelStrategistItems.push({ label: element.name, value: element.id });
                    this.modelStrategistItems.sort((t1, t2) => {
                        if (t1.label > t2.label) return 1;
                        if (t1.label < t2.label) return -1;
                        return 0
                    })
                });
                let convertedstrategistIds = (this.CommunityStrategies.strategists.strategistIds != null) ?
                    toPrimitiveInt(this.CommunityStrategies.strategists.strategistIds) : null;

                if (convertedstrategistIds != null) {
                    model[1].forEach(element => {
                        this.communities.push({ communityId: element.id, community: element.name, strategistId: element.strategistId, isSelected: false });

                        this.communities.forEach(element => {
                            let match = this.CommunityStrategies.strategists.communityModels.filter(record => record == element.communityId);
                            if (match.length > 0 && match.length != undefined) {

                                element.isSelected = true;
                            }
                            else { element.isSelected = false };
                        });
                    });
                }

                // Adding Data for View                
                if (!this.displaypermission) {
                    this.modelStrategistItems.forEach(communityItem => {
                        if (Object.keys(this.CommunityStrategies.strategists.strategistIds.filter(x => x == communityItem.value)).length > 0) {
                            this.selectedStrategitNames.push(communityItem.label);
                        }
                    });
                    if (Object.keys(this.communities).length > 0) {
                        this.selecetdModel = "Selected Model";
                        this.communities.filter(x => x.isSelected).forEach(communitiesItem => {
                            this.selectedCommunityNames.push(communitiesItem.community);

                        });
                    }
                    else {
                        this.selecetdModel = "All";
                    }
                }

                this.selectedStrategistItems = this.CommunityStrategies.strategists.strategistIds;
                this.modelAccessLevel = this.CommunityStrategies.strategists.modelAccessLevel;
                console.log("Data from fork join Stragies :", this.modelStrategistItems);
                console.log("Data from fork join communities after push:", this.communities);
            });
    }


    /**On strategist drop down change */
    private onStrategistChange(selectedVal) {
        if (selectedVal != null) {
            if (Object.keys(selectedVal).length > 0) {
                /** push the array list values */
                this.selectedStrategistItems = selectedVal;
                this.modelAccessLevel = 1;
                this.CommunityStrategies.strategists.strategistIds = selectedVal;
                this.CommunityStrategies.strategists.communityModels = []
                this.CommunityStrategies.strategists.modelAccessLevel = this.modelAccessLevel;
                this.CommunityStrategies.strategists.communityModels = []
            }
            else {
                /** push the [] */
                this.selectedStrategistItems = null;
                this.modelAccessLevel = null;
                this.communities = [];
                this.CommunityStrategies.strategists.strategistIds = [];
                this.CommunityStrategies.strategists.modelAccessLevel = null;
                this.CommunityStrategies.strategists.communityModels = []
            }
        }
        else {
            /** push null as is */
            this.selectedStrategistItems = null;
            this.modelAccessLevel = null;
            this.communities = [];
            this.CommunityStrategies.strategists.strategistIds = null;
            this.CommunityStrategies.strategists.modelAccessLevel = null;
            this.CommunityStrategies.strategists.communityModels = null
        }
        // if (Object.keys(selectedVal).length > 0) {
        //     this.modelAccessLevel = 1;
        //     this.CommunityStrategies.strategists.strategistIds = selectedVal;
        //     this.CommunityStrategies.strategists.communityModels = []
        //     this.CommunityStrategies.strategists.modelAccessLevel = this.modelAccessLevel;
        //     this.CommunityStrategies.strategists.communityModels = []
        // }
        // else {
        //     // this.selectedStrategistItems = null;
        //     // this.modelAccessLevel = null;
        //     // this.communities = [];
        //     this.CommunityStrategies.strategists.strategistIds = this.selectedStrategistItems;
        //     this.CommunityStrategies.strategists.modelAccessLevel = null;
        //     this.CommunityStrategies.strategists.communityModels = null
        // }

    }

    /** On model access level drop down change*/
    private onModelAccessLevelChange(value) {
        this.modelAccessLevel = parseInt(value);
        this.communities = [];
        this.bindCommunities();
    }

    /**on model change bind communities */
    private bindCommunities() {
        this.selectedStrategistItems.forEach(element => {
            this.getCommunities(element);
        });
    }

    /**Fires on community check box check  */
    private onCommunityChkChange(event) {
        let id = parseInt(event.target.value);
        if (event.currentTarget.checked == true)
            this.CommunityStrategies.strategists.communityModels.push(id);
        else
            this.CommunityStrategies.strategists.communityModels.splice(this.CommunityStrategies.strategists.communityModels.indexOf(id), 1);
    }

    /**get communities by strategistIds */
    private getCommunities(strategistId) {
        if (this.modelAccessLevel == 2) {
            this._communityService.getCommunityModelByStrategistId(strategistId)
                .map((response: Response) => response.json())
                .subscribe(model => {
                    model.forEach(element => {
                        this.communities.push({
                            communityId: element.id, community: element.name, strategistId: element.strategistId, isSelected: false
                        });
                    });
                    console.log("Community Model", model);
                })
        }
        this.CommunityStrategies.strategists.modelAccessLevel = this.modelAccessLevel;
        this.CommunityStrategies.strategists.communityModels = []
    }
}