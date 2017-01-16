import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SessionHelper } from './session.helper';
import { IRolePrivilege } from '../models/roleprivileges';
import { DOCUMENT } from '@angular/platform-browser';
import { TokenHelperService } from '../core/tokenhelper.service';

export class BaseComponent {
    private dom;
    activeRoute: string;
    public _sessionHelper: SessionHelper;
    public permission: IRolePrivilege;
    public _tokenHelper: TokenHelperService;
    public roleTypeId: number;
    /** 
     * Contructor
     */

    constructor(privilegeCode: string = '') {
        this.dom = DOCUMENT;
        this._sessionHelper = new SessionHelper();
        this._tokenHelper = new TokenHelperService();
        let userDetails = this._tokenHelper.getUser();
        if (userDetails != undefined || userDetails != null)
            this.roleTypeId = this._tokenHelper.getUser()["roleId"];
        if (this.permission == undefined && privilegeCode != '') {
            this.permission = this._sessionHelper.getPermission(privilegeCode);
        }
    }

    responseToObject<T>(_response: Observable<Response>) {
        return _response.map((response: Response) => <T>response.json());
    }

    ResponseToObjects<T>(_response: Observable<Response>) {
        return _response.map((response: Response) => <T[]>response.json());
    }

    /**
     * spinner methods
     */
    showSpinner() {
        this.dom.removeClass(this.dom.query("spinner"), "hide-spinner");
    }

    /**
     * spinner methods
     */
    hideSpinner() {
        this.dom.addClass(this.dom.query("spinner"), "hide-spinner");
    }

    /*** date formate dd/mm/yyyy */
    dateRenderer(params) {
        if (params.value == "0000-00-00 00:00:00")
            return '';
        return new DatePipe('yMd').transform(params.value, 'MM/dd/yyyy');
    }

    /**Generate Dynamic Color Codes */
    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    isValidImageSize(imageSize, maxSize) {
        if (imageSize > maxSize) {
            return false;
        }

        return true;
    }

    isValidImageFormat(fileType) {
        return (fileType.split('/')[0] == 'image');
    }

    isValidPdfDocument(fileType) {
        return fileType == 'application/pdf';
    }
    isValidExcelFile(fileType) {
        return fileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

}
