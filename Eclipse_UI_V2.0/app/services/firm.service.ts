import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {IFirmProfile} from '../models/firm';

@Injectable()
export class FirmService {
    private _firmEndPoint = 'admin/firms/profile';
    constructor(private _httpClient: HttpClient) { }

    /** Get firm profile */
    getFirmProfile() {
        return this._httpClient.getData(this._firmEndPoint,false);
    }

    /** Update a firm profile */
    updateFirmProfile(logo, name) {   
        var formData: any = new FormData();
        formData.append("logo", logo);
        formData.append("name", name);
        return this._httpClient.uploadFile(this._firmEndPoint,formData);
    }

}
