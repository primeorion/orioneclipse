import { Injectable } from '@angular/core';
import { HttpClient } from '../core/http.client';

@Injectable()
export class ViewsService {
    private _viewsEndPoint = 'settings/views';
    constructor(private _httpClient: HttpClient) { }

    /** To add View */
    addView(view: any) {
        return this._httpClient.postData(this._viewsEndPoint, view);
    }

    /** To get views list by view type Id */
    getSavedViewsByTypeId(viewTypeId: number) {
        return this._httpClient.getData(this._viewsEndPoint + '?type=' + viewTypeId);
    }

    /** To get View */
    getView(viewId: number) {
        return this._httpClient.getData(this._viewsEndPoint + '/' + viewId);
    }

    /** To delete view */
    deleteView(viewId: number) {
        return this._httpClient.deleteData(this._viewsEndPoint + '/' + viewId);
    }

    /** To update View */
    updateView(view: any) {
        return this._httpClient.updateData(this._viewsEndPoint + '/' + view.id, view);
    }

    /** To set selected view as default view */
    setAsDefaultView(viewId: number) {
        return this._httpClient.postData(this._viewsEndPoint + '/defaultView/' + viewId, {});
    }

    /** To get view name  */
    checkViewNameExistence(viewName: string) {
        return this._httpClient.getData(this._viewsEndPoint + '?name=' + viewName);
    }

}
