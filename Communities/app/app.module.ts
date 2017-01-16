import { NgModule , enableProdMode}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';
import {Title} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { LOGIN_SERVICE_PROVIDERS } from './login/login.routes';
import { Http,HTTP_PROVIDERS,XHRBackend, RequestOptions } from '@angular/http';
import { HttpClient } from './core/http.client';
import { provide, PLATFORM_DIRECTIVES } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ExceptionHandler, bind } from '@angular/core';
import { CustomExceptionHandler } from '../app/core/exceptionhandler';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { Spinner } from './shared/spinner/spinner';
import {CustomSubService} from './core/customSubService';
import {CustomHttp} from './core/customhttp';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb';
import { CustomValidator } from './shared/validator/CustomValidator';

enableProdMode();
@NgModule({
  imports: [BrowserModule, HttpModule, APP_ROUTER_PROVIDERS, FormsModule],       // module dependencies
  declarations: [AppComponent,DashboardLeftNavComponent,Spinner],   // components and directives
  bootstrap: [AppComponent],     // root component
  providers: [LOGIN_SERVICE_PROVIDERS, HTTP_PROVIDERS, HttpClient,Title,AuthGuard,AuthService,CustomSubService,BreadcrumbComponent,CustomValidator
    //, provide('ApiEndpoint', { useValue: 'http://54.225.10.87:3000/v1/' })
    , provide('ApiEndpoint', { useValue: 'http://54.173.63.220:4000/v1/' })
    , provide(Http, {useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, subService: CustomSubService)=> new CustomHttp(backend, defaultOptions, subService)
    , deps: [XHRBackend, RequestOptions, CustomSubService]})
    , bind(LocationStrategy).toClass(HashLocationStrategy)]                    // services
})
export class AppModule { }