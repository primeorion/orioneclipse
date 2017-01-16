import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IModelImport } from '../viewmodels/modelimport';
import {IModelList} from '../models/model';

@Injectable()
export class ModelService {
    private _allModelEndpoints = 'community/models';
    private _modelDetailEndpoint = 'community/strategists/models'
    private _downloadTemplateEndpoint = 'community/strategists/models/template/download';
    private _modelEndpoint = 'community/strategists';
    private _securitySearchEndpoint = 'community/security';
    private _modelStatusEndpoint = 'community/strategists/models/master/status';

    constructor(private _httpClient: HttpClient) { }
    
    //get all model list Info
    getModelList() {
        return this._httpClient.getData(this._allModelEndpoints);
    }
    //get  model view by modelId 
    getModelView(id: number) {
        return this._httpClient.getData(this._modelDetailEndpoint + "/" + id);
    }
    //model template  
    getModelTemplate() {
        return this._httpClient.getData(this._downloadTemplateEndpoint);
    }
    //Upload model file for model creation  
    uploadModelTemplate(file: IModelImport) {
        var formData: any = new FormData();
        formData.append("name", file.name);
        formData.append("description", file.description);
        formData.append("model", file.model);

        return this._httpClient.uploadFile(this._modelEndpoint +   "/models/import", formData);
    }
    //Get Securities 
    securitySearch(search) {
        return this._httpClient.getData(this._securitySearchEndpoint + "?search=" + search);
    }
    //Get model status
    modelStatus(){
        return this._httpClient.getData(this._modelStatusEndpoint);
    }
    //post model
    createModel(models : IModelList ){
       return this._httpClient.postData(this._modelEndpoint + "/models", models);
    }
    //delete model
    deleteModelById(id:number){
        return this._httpClient.deleteData(this._modelEndpoint + "/models/" + id );
    }
    // search model by name or id
    searchModel(search){
        return this._httpClient.getData(this._modelEndpoint + "/models?search=" + search );
    }
    // update model
    updateModel(modelId : number,model : IModelList){
        return this._httpClient.updateData(this._modelEndpoint + "/models/" + modelId,model)
    }

}