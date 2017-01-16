import {Injectable} from '@angular/core';
import {HttpModule, Http, Request, RequestOptionsArgs, Response, XHRBackend, RequestOptions, ConnectionBackend, Headers} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {CustomSubService} from '../core/customSubService';

@Injectable()
export class CustomHttp extends Http {
  _subService: CustomSubService
   constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, subService: CustomSubService) {
        super(backend, defaultOptions);
        this._subService = subService;
    }
 
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options));
    }
 
    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url,options));
    }
 
    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {   
        return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
    }
 
    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
    }
 
    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url, options));
    }
    
    getRequestOptionArgs(options?: RequestOptionsArgs) : RequestOptionsArgs {
        // if (options == null) {
        //     options = new RequestOptions();
        // }
        // if (options.headers == null) {
        //     options.headers = new Headers();
        // }
        // options.headers.append('Content-Type', 'application/json');
        return options;
    }
  
    intercept(observable: Observable<Response>): Observable<Response> {
      this._subService.beforeRequest.emit("beforeRequestEvent");
      return observable.do(() => this._subService.afterRequest.emit("afterRequestEvent"),
                            err => this._subService.afterRequest.emit("afterRequestEvent"));
    }

   
}