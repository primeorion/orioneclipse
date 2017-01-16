import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IStrategist } from '../models/strategist';

@Injectable()
export class StrategistService {
    private _strategistStatusEndPoint = 'community/strategists/master/status';
    private _userRoleEndPoint = 'community/users/master/roles';
    private _strategistEndPoint = 'community/strategists';


    constructor(private _httpClient: HttpClient) { }

    getStrategistStatus() {
        return this._httpClient.getData(this._strategistStatusEndPoint);
    }
    
    searchStrategistUser(searchString: string){
        return this._httpClient.getData(this._strategistEndPoint + "?search=" + searchString);
    }
    
    getUserRoles(){
        return this._httpClient.getData(this._userRoleEndPoint);
    }
    
     getStrategistDetail(id) {
        return this._httpClient.getData(this._strategistEndPoint + "/" + id);
    }

    getStrategistProfileDetail(id){
         return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/profile");
    }
    
   getStrategistList() {
        return this._httpClient.getData(this._strategistEndPoint);
    }
    deleteStrategist(id) {
        return this._httpClient.deleteData(this._strategistEndPoint + "/" + id);
    }

}