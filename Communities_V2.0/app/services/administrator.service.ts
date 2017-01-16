import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';


@Injectable()
export class AdministratorService {
    private _administratorSummaryEndPoint = 'community/dashboard/summary';
    

    constructor(private _httpClient: HttpClient) { }

    getAdministratorSummary(date) {
        return this._httpClient.getData(this._administratorSummaryEndPoint);
    }

    

}