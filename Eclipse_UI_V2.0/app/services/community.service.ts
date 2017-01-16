import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';

@Injectable()
export class CommunityService {
    private strategistEndPoint = 'community/strategists';
    private modelEndPoint = 'community/models';
    // private strategistList: any[] = [];

    constructor(private _httpClient: HttpClient) { }

    /*** To get Community strategist  */
    getCommunityStrategist() {
        return this._httpClient.getData(this.strategistEndPoint + "/approved");
    }

    /*** To get Community Models  */
    getCommunityModelByStrategistId(strategistId: number) {
        return this._httpClient.getData(this.modelEndPoint + "/approved?strategistId=" + strategistId);
    }

    /** To import community model */
    importCommunityModel(communityModelId: number) {
        return this._httpClient.postData(this.modelEndPoint + "/import/" + communityModelId, {});
    }

    // /***To get */
    // getCommunityModelByStrategistIds(strategistIds: number[]) {
    //     strategistIds.forEach(element => {
    //         this.strategistList.push(this._httpClient.getData(this.modelEndPoint + "?strategistId=" + element));
    //     });
    //     return this.strategistList;
    // }

}
