import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SessionHelper } from './session.helper';
import { IRolePrivilege } from '../models/user.models';
import { BrowserDomAdapter } from '@angular/platform-browser/src/browser/browser_adapter';

export class BaseComponent {
    dom: BrowserDomAdapter;
    public _sessionHelper: SessionHelper;
    public permission: IRolePrivilege;
    public activeRoute: string;
    /** 
     * Contructor
     */
    constructor(privilegeCode: string = '') {
        this.dom = new BrowserDomAdapter();
        this._sessionHelper = new SessionHelper();
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

    /*** date formate MM/dd/yyyy */
    dateRenderer(params) {
        if (params.value == "0000-00-00 00:00:00")
            return '';
        return new DatePipe().transform(params.value, 'MM/dd/yyyy');
    }

    /** formates the date to given format, default format is MM/dd/yyyy */
    formatDate(date, format = 'MM/dd/yyyy') {
        if (date == "0000-00-00 00:00:00" || date == "0000-00-00")
            return '';
        return new DatePipe().transform(date, 'MM/dd/yyyy');
    }

    getDate(days) {
        let date = new Date();
        if (days < 0 || days > 0) date.setDate(date.getDate() + days);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date;
    }

    getDateForCounts(days: number = -30) {
        return this.getDate(days);
    }

    getToday() {
        return this.getDate(0);
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


}
