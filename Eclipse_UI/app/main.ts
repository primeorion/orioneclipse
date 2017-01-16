import { bootstrap}    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { LocationStrategy, HashLocationStrategy  } from '@angular/common';
import { provide, PLATFORM_DIRECTIVES } from '@angular/core';
import { ExceptionHandler, bind } from '@angular/core';
import { enableProdMode } from '@angular/core';
import { CustomExceptionHandler } from '../app/core/exceptionhandler';
import { Http, XHRBackend, RequestOptions} from '@angular/http';
import { TokenHelperService } from './core/tokenhelper.service';
import { SessionHelper } from './core/session.helper';
//import { Config } from './config/config';
import { HttpClient } from './core/http.client';
import { Spinner } from './shared/spinner/spinner';
import { APP_ROUTER_PROVIDERS, routes } from './app.routes';
import { ColorPickerService } from './shared/colorPicker/color-picker/color-picker.service'
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb';
import {DND_PROVIDERS} from 'ng2-dnd/ng2-dnd';
import './libs/constants.enums';

bootstrap(AppComponent, [
    DND_PROVIDERS,
    APP_ROUTER_PROVIDERS,
    bind(LocationStrategy).toClass(HashLocationStrategy),
    HTTP_PROVIDERS, HttpClient, SessionHelper,
    TokenHelperService, ColorPickerService,
    provide(PLATFORM_DIRECTIVES, { useValue: [ROUTER_DIRECTIVES, Spinner, BreadcrumbComponent], multi: true }),
    // provide( Config , {
    //     useFactory: (http: any) => {
    //         console.log(new Config(http).load());
    //         return new Config(http).load();
    //     },
    //     deps: [Http]
    // }),
    // provide(ExceptionHandler, {
    //     useClass: CustomExceptionHandler
    // }), 
    //provide('ApiEndpoint', { useValue: 'http://192.168.190.65:3001/v1/' }),
    // provide(Http, {
    //     useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions, tokenhelper: TokenHelperService) => new HttpClient(xhrBackend, requestOptions, tokenhelper),
    //     deps: [XHRBackend, RequestOptions, TokenHelperService]
    // })
      //provide('ApiEndpoint', { useValue: 'http://192.168.43.150:3000/v1/' })
     //provide('ApiEndpoint', { useValue: 'http://54.173.63.220:3000/v1/' })
    provide('ApiEndpoint', { useValue: 'http://54.225.10.87:3000/v1/' })
    //}),  provide('ApiEndpoint', {useValue: 'https://testapi.orionadvisor.com/api/v1/'})
]);
