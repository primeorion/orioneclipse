import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IStrategist , IStrategistAdvertisement , IStrategistCommentary,
    IStrategistSalesDetail, IStrategistSupportDetail, IStrategistAgreement } from '../models/strategist';
import { IUser } from '../models/user';
import {IFirm} from '../models/firm';
import { IDocument } from '../viewmodels/document';

@Injectable()
export class StrategistService {
    private _strategistStatusEndPoint = 'community/strategists/master/status';
    private _userRoleEndPoint = 'community/users/master/roles';
    private _strategistUserSearchEndPoint = 'community/strategists';
    private _strategistEndPoint = 'community/strategists';
    private _userVerifyEndPoint = 'community/strategists/user/verify';
    private _firmsEndPoint = 'community/users/firms/list';    

    constructor(private _httpClient: HttpClient) { }

    getStrategistStatus() {
        return this._httpClient.getData(this._strategistStatusEndPoint);
    }
    
    searchStrategist(searchString: string){
        return this._httpClient.getData(this._strategistUserSearchEndPoint + "?search=" + searchString);
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
    
    getStrategistCommentary(id){
        return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/commentary");
    }
    
    getStrategistSalesDetail(id){
        return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/sales");
    }
    
    getStrategistSupportDetail(id){
         return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/support");
    }
    
    getStrategistAdvertisement(id){
         return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/advertisementMessage");
    }
    
    getStrategistAgreement(id){
        return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/legalAgreement");
    }
    
    getStrategistDownload(id){
        return this._httpClient.getData(this._strategistEndPoint + "/" + id + "/documents");
    }
    
    verifyUser(id){
        return this._httpClient.getData(this._userVerifyEndPoint + "/" + id);
    }
    
    saveStrategist(strategist: IStrategist){
        
        return this._httpClient.postData(this._strategistEndPoint, strategist);
    }
    
    updateStrategistProfile(strategist: IStrategist){
        
        return this._httpClient.updateData(this._strategistEndPoint + '/' + strategist.id , strategist);
    }
    
    updateStrategistCommentary(id , commentary : IStrategistCommentary ){
        return this._httpClient.updateData(this._strategistEndPoint + "/" + id + "/commentary",
            commentary);
    }
    
    updateStrategistSalesDetail(id , salesDetail : IStrategistSalesDetail){
        return this._httpClient.updateData(this._strategistEndPoint + "/" + id + "/sales",
            salesDetail);
    }
    
    updateStrategistSupportDetail(id , supportDetail : IStrategistSupportDetail){
        return this._httpClient.updateData(this._strategistEndPoint + "/" + id + "/support",
            supportDetail);
    }

    updateStrategistAgreement(id, agreement : IStrategistAgreement){
        return this._httpClient.updateData(this._strategistEndPoint + "/" + id + "/legalAgreement",
            agreement);
    }
    
    updateStrategistAdvertisement(id , advertisement : IStrategistAdvertisement){
        return this._httpClient.updateData(this._strategistEndPoint + "/" + id + "/advertisementMessage",
            advertisement);
    }   
    
    deleteStrategist(id) {
        return this._httpClient.deleteData(this._strategistEndPoint + "/" + id);
    } 
    
    deleteStrategistDocument(strategistId , documentId) {
        return this._httpClient.deleteData(this._strategistEndPoint + "/" + strategistId + "/document?documentId=" + documentId);
    } 
    
    uploadStrategistLargeLogo(file , id){
        var formData: any = new FormData();
        formData.append("logo", file);
        
        return this._httpClient.uploadFile(this._strategistEndPoint + "/" + id + "/logo/large",formData);
    }   
    
    uploadStrategistSmallLogo(file , id){
        var formData: any = new FormData();
        formData.append("logo", file);
        
        return this._httpClient.uploadFile(this._strategistEndPoint + "/" + id + "/logo/small" ,formData);
    }
    
    addUserToStrategist(strategistId: number , users : IUser[]){
        
         return this._httpClient.postData(this._strategistEndPoint + "/" + strategistId + "/user/add", 
                 {'users': users});
    }
  
    removeUserFromStrategist(strategistId: number, userId: number){
        return this._httpClient.deleteData(this._strategistEndPoint + "/" + strategistId + "/" + userId + "/user");
    }
      
      
    uploadStrategistDocument(strategistId: number , document: IDocument){
        var formData: any = new FormData();
        formData.append("name", document.name);
        formData.append("description" , document.description);
        formData.append("document", document.document);
        
        return this._httpClient.uploadFile(this._strategistEndPoint + "/" + strategistId + "/document" , formData);
        
        
    }
    getFirmsByUser(){
        return this._httpClient.getData(this._firmsEndPoint);      
    }
    
    
}