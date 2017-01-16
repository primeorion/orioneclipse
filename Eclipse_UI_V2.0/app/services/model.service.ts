import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IModelDetail } from '../models/modelDetail';
import { IModel, IModelAdd, ISubModel, IcreateNewModel } from '../models/modeling/model';
import { IModelCreate } from '../models/modeling/modelcreate';
import { IAssignPortfolioToModel } from '../models/modeling/assignportfoliotomodel';
import { IAssignSleeveToModel } from '../models/modeling/assignsleevetomodel';
import { IModelExcelImport } from '../models/modeling/modelexcelimport';

@Injectable()
export class ModelService {

    private _modelEndPoint = 'modeling/models';
    private _portfolioEndPoint = 'portfolio/portfolios';
    private modelDashboardEndPoint = 'dashboard/model/summary';

    constructor(private _httpClient: HttpClient) { }

    /************************************** GETs*********************************************/

    /**Create NEW Model for viewstructure*/
    getNewModel() {
        return this._httpClient.getData(this._modelEndPoint + '/modelTypes');
    }

    /** Get Sub Models Types */
    getSubModel(id: number) {
        return this._httpClient.getData(this._modelEndPoint + '/submodels' + '?modelType=' + id);
    }

    /**Get team Model data for auto complete */
    getModelSearch(searchString: string) {
        return this._httpClient.getData(this._modelEndPoint + '?search=' + searchString)
    }

    /** get Sleeved accounts for autocomplete */
    searchModelSleeveAccounts(searchString: string) {
        return this._httpClient.getData(this._modelEndPoint + '?search=' + searchString)
    }

    getModelData() {
        return this._httpClient.getData(this._modelEndPoint);
    }

    getModelDetail(id) {
        return this._httpClient.getData(this._modelEndPoint + "/" + id);
    }

    /** Get pending model details by its Id */
    getPendingModelDetail(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + "/" + modelId + "/" + "pending");
    }

    /**get Models dashboard summary*/
    getModelDashboardData() {
        return this._httpClient.getData(this.modelDashboardEndPoint);
    }

    /** To get model status */
    getModelStatus() {
        return this._httpClient.getData(this._modelEndPoint + '/modelStatus');
    }

    /** To get model status */
    getModelFilters() {
        return this._httpClient.getData(this._modelEndPoint + '/filterTypes');
    }

    /** Get all models list based on status */
    getModels(modelTypeId: number = 0) {
        return (modelTypeId == 0)
            ? this._httpClient.getData(this._modelEndPoint)
            : this._httpClient.getData(this._modelEndPoint + '?filter=' + modelTypeId);
    }

    /** Get model portfolios based on model Id */
    getModelPortfolios(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/' + modelId + '/portfolios');
    }

    /** Get model portfolios based on model Id */
    getModelTeams(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/' + modelId + '/teams');
    }

    /** get Models - Get All Model Management Styles */
    getModelManagementStyles() {
        return this._httpClient.getData(this._modelEndPoint + '/managementStyles');
    }

    geSubModelsByType(modelTypeId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/submodels?modelType=' + modelTypeId);
    }

    /** Gets Allocations for selected Portfolio associated with a model */
    getModelPortfolioAllocation(portfolioId: number) {
        return this._httpClient.getData(this._portfolioEndPoint + '/' + portfolioId + '/' + 'allocations');
    }

    /** Gets Target Allocations % for current model */
    getModelAllocation(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/' + modelId + '/' + 'allocations');
    }

    /** Get All Waiting For Approval Portfolios */
    getApprovalPortfolioslistOfModels(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/' + modelId + '/' + 'portfolios' + '/' + 'pending');
    }

    /** Get All sleeved accounts for given Model */
    getSleevedAccountsForModel(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + '/' + modelId + '/sleeves');
    }

    /** Get Model Templates by required format */
    getModelTemplateByFormat(formatType) {
        return this._httpClient.getData(this._modelEndPoint + '/upload/templates?format=' + formatType)
    }

    /** Get Model Template */
    getModelTemplate() {
        return this._httpClient.getData(this._modelEndPoint + '/upload/templates');
    }

    downloadfile(type: string) {
        var headers = new Headers();
        headers.append('responseType', 'arraybuffer');
        return this._httpClient.getData(this._modelEndPoint + '/upload/templates?format=' + type)
            // .map(res => new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            .map(res => new Blob([res], { type: 'application/vnd.ms-excel' }));
        // .catch(this.logAndPassOn);
    }

    /** Checks whether model can be rebalaced or not */
    canRebalanceModel(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + "/" + modelId + "/" + "canRebalance");
    }

    /** Get The namespace compare  */

    /** Get Sub Models Types */
    validateModelNamespace(modelName: string, modelNamespace: string) {
        return this._httpClient.getData(this._modelEndPoint + '?name=' + modelName + '&nameSpace=' + modelNamespace);
    }

    validateSubModelNamespace(submodelName: string, modelNamespace: string) {
        return this._httpClient.getData(this._modelEndPoint + '/submodels?name=' + submodelName + '&nameSpace=' + modelNamespace);
    }

    getSubModelDetailById(submodelid) {
        return this._httpClient.getData(this._modelEndPoint + "/submodels/" + submodelid);
    }

    /************************************** GETs*********************************************/

    /************************************** POSTs *********************************************/

    addModel(modelsave: IModelAdd) {
        return this._httpClient.postData(this._modelEndPoint, modelsave);
    }

    addSubModel(submodelsave: IcreateNewModel) {
        return this._httpClient.postData(this._modelEndPoint + "/submodels", submodelsave);
    }

    /** assign portfolio/s to model */
    assignPortfolioToModel(assignPortfolio: IAssignPortfolioToModel, modelId: number) {
        return this._httpClient.postData(this._modelEndPoint + "/" + modelId + '/Portfolios', assignPortfolio);
    }

    /** assign sleeve/s to model */
    assignSleeveToModel(assignSleeve: IAssignSleeveToModel, modelId: number) {
        return this._httpClient.postData(this._modelEndPoint + "/" + modelId + '/sleeves', assignSleeve);
    }

    /** Rebalace model based on its Id */
    rebalanceModel(modelRebalancedData) {
        return this._httpClient.postData('rebalancer/rebalance', modelRebalancedData);
    }

    /** Copy model */
    copyModel(modelId: number, copiedModel) {
        return this._httpClient.postData(this._modelEndPoint + "/" + modelId + "/" + "copy", copiedModel)
    }

    copySubModel(subModelId:number,copiedSubModel){
        return this._httpClient.postData(this._modelEndPoint+"/submodels/"+subModelId+"/copy",copiedSubModel)
    }

    /** Save ModelDeatils  */
    savemodeldetails(modelId, modelupdateData) {
        return this._httpClient.postData(this._modelEndPoint + '/' + modelId + '/modelDetail/', modelupdateData);
    }

    /************************************** POSTs *********************************************/

    /************************************** PUTs/UPDATEs *********************************************/
    updateSubmodelfavoritestatus(subModelId, favoriteStatus) {
        return this._httpClient.updateData(this._modelEndPoint + '/submodels/favorites/' + subModelId, { "isFavorite": favoriteStatus });
    }
    
    updateSubmodel(subModelId, name, namespace) {
        let data = {
            "name": name,
            "nameSpace": namespace
        }
        return this._httpClient.updateData(this._modelEndPoint + '/submodels/' + subModelId, data);
    }
    updateModel(model: IModelAdd) {
        return this._httpClient.updateData(this._modelEndPoint + "/" + model.id, model);
    }

    /** Approve or Reject Portfolio/s from Model based on user privilege */
    approveOrRejectModelPortfolio(modelId: number, actionStatus: string, modelPortfolioApproval: any) {
        return this._httpClient.updateData(this._modelEndPoint + '/' + modelId + '/' + 'portfolios' + '/' + actionStatus, modelPortfolioApproval);
    }

    /** Approve or reject Model which is waiting for Approval */
    approveOrRejectPendingModel(modelId: number, actionStatus: string, modelPendingApproval: any) {
        return this._httpClient.updateData(this._modelEndPoint + '/' + modelId + '/' + 'pending' + '/' + actionStatus, modelPendingApproval);
    }


    /** Update ModelDeatils */
    updatemodeldetails(modelId, modelupdateData) {
        return this._httpClient.updateData(this._modelEndPoint + '/' + modelId + '/modelDetail/', modelupdateData);
    }

    /************************************** PUTs/UPDATEs *********************************************/

    /************************************** DELETEs *********************************************/

    /** Models - Can Delete Model */
    /** https://baseurl/v1/modeling/models/:id/can */
    canDeleteModel(modelId: number) {
        return this._httpClient.getData(this._modelEndPoint + "/" + modelId + "/" + "canDelete");
    }

    /** Delete specific Model */
    deleteModel(modelId: number) {
        return this._httpClient.deleteData(this._modelEndPoint + "/" + modelId);
    }

    /** This will unassign the selected portfolio from Model */
    unAssignPortfolioFromModel(modelId: number, portfolioId: number) {
        return this._httpClient.deleteData(this._modelEndPoint + "/" + modelId + "/" + 'Portfolios' + "/" + portfolioId);
    }

    //can Delete sub-Model
    canDeleteSubModel(subModelId, modelId) {
        return this._httpClient.getData(this._modelEndPoint + '/submodels/' + subModelId + '/canDelete?modelId=' + modelId);
    }
    // Delete the Sub-Model
    deleteSubModel(subModelId, modelId) {
        return this._httpClient.deleteData(this._modelEndPoint + '/submodels/' + subModelId + '?modelId=' + modelId);
    }

    /************************************** DELETEs *********************************************/

    /************************************** UPLOADs *********************************************/

    /** Upload selected file */
    uploadModelTemplate(file: IModelExcelImport) {
        var formData: any = new FormData();
        formData.append("file", file.file);
        return this._httpClient.uploadFile(this._modelEndPoint + "/upload", formData);
    }

    /************************************** UPLOADs *********************************************/

    patchModelNameNameSpace(modelId, modelName, modelNameSpace) {
        let data = [
            { "op": "replace", "path": "/name", "value": modelName },
            { "op": "replace", "path": "/nameSpace", "value": modelNameSpace }
        ]
        let patachdata =
            {
                "data": data
            }
        return this._httpClient.patchData(this._modelEndPoint + "/" + modelId, patachdata);
    }
}
