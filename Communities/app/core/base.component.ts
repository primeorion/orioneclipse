import { Component, OnInit } from '@angular/core';
import {DatePipe} from '@angular/common';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BrowserDomAdapter } from '@angular/platform-browser/src/browser/browser_adapter';

export class BaseComponent {
    dom: BrowserDomAdapter;
    /** 
     * Contructor
     */
    constructor() {
        this.dom = new BrowserDomAdapter();
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
        return new DatePipe().transform(params.value, 'MM/dd/yyyy');
    }
    /** renders status for row data */
    private statusRenderer(params) {
        return '<span><img src="../app/assets/img/' + (params.value == 1 ? 'green' : 'grey') + '-dot.png"/></span>';
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
    /** Renders based on status filter  */
    statusFilterRenderer(params) {
        let filterParam = true;
        var result = '<span>';
        if (params.value == 0){
            result += '<img src="../app/assets/img/grey-dot.png"/>';
        }
        else if (params.value == 1){
            result += '<img src="../app/assets/img/green-dot.png"/>';
        }
        else{
            return null;
        }
        return result + '</span>';
    }
}
