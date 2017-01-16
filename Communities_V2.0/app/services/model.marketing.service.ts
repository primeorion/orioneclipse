import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IDocument } from '../viewmodels/document';
import { IModelCommentary, IModelAdvertisement, IModelPerformance } from '../models/model';


@Injectable()
export class ModelMarketingService {

    private _modelEndpoint = 'community/strategists/models';
    private _subscriptionEndpoint = 'community/strategists';

    constructor(private _httpClient: HttpClient) { }

    getModelCommentary(id: number) {
        return this._httpClient.getData(this._modelEndpoint + "/" + id + "/commentary");
    }


    saveCommentary(commentary: IModelCommentary) {
        return this._httpClient.postData(this._modelEndpoint + "/" + commentary.modelId + "/commentary", commentary);
    }
    // get model advertisments based on modelId
    getModelAdvertisement(id: number) {
        return this._httpClient.getData(this._modelEndpoint + "/" + id + "/advertisement");
    }

    saveAdvertisement(advertisement: IModelAdvertisement) {
        return this._httpClient.postData(this._modelEndpoint + "/" + advertisement.modelId + "/advertisement", advertisement);
    }
    // get model documents based on modelId
    getMarketingDocuments(id: number) {
        return this._httpClient.getData(this._modelEndpoint + "/" + id + "/documents");
    }

    deleteMarketingDocument(modelId: number, documentId) {
        return this._httpClient.deleteData(this._modelEndpoint + "/" + modelId + "/document?documentId=" + documentId);
    }

    uploadMarketingDocument(modelId: number, document: IDocument) {
        var formData: any = new FormData();
        formData.append("name", document.name);
        formData.append("description", document.description);
        formData.append("document", document.document);

        return this._httpClient.uploadFile(this._modelEndpoint + "/" + modelId + "/document", formData);
    }
    //get model performances based on modelId
    getModelPerformance(id: number) {
        return this._httpClient.getData(this._modelEndpoint + "/" + id + "/performance");
    }

    saveModelPerformance(performance: IModelPerformance) {
        return this._httpClient.postData(this._modelEndpoint + "/" + performance.modelId + "/performance", performance);
    }

    updateModelPerformance(performance: IModelPerformance) {
        return this._httpClient.updateData(this._modelEndpoint + "/" + performance.modelId + "/performance", performance);
    }
    // get subscription strategist profiles
    getSubscriptionProfiles() {
        return this._httpClient.getData(this._subscriptionEndpoint + "/profile/subscribe");
    }
    // get legal agreement based on strategistId
    getLegalAgreement(strategistId: number) {
        return this._httpClient.getData(this._subscriptionEndpoint + "/" + strategistId + "/legalAgreement");
    }
    // subscribe/unSubscribe strategist
    subscribeOrUnsubscribe(strategistId: number, isSubscribe) {
        return this._httpClient.postData(this._subscriptionEndpoint + "/" + strategistId + "/subscribe", isSubscribe);
    }
}