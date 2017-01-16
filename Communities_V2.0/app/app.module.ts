import { NgModule, enableProdMode } from '@angular/core';
import { CommonModule } from "@angular/common"
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../app/login/login.component';
import { LogoutComponent } from '../app/login/logout.component';
import { CommunityComponent } from '../app/community.component';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { DashboardComponent } from '../app/components/dashboard/dashboard.component';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { LOGIN_SERVICE_PROVIDERS } from './login/login.routes';
import { Http, HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { HttpClient } from './core/http.client';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CustomExceptionHandler } from '../app/core/exceptionhandler';
import './libs/constants.enums';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { Spinner } from './shared/spinner/spinner';
import { CustomSubService } from './core/customSubService';
import { StrategistService } from './services/strategist.service';
import { CustomHttp } from './core/customhttp';
import { CustomValidator } from './shared/validator/CustomValidator';
import { PreloadSelectedModules } from './core/module.preload.strategy';
import { AuthorizeComponent } from '../app/login/authorize.component';
import { DialogModule } from 'primeng/components/dialog/dialog';

enableProdMode();

@NgModule({
  imports: [BrowserModule, HttpModule, APP_ROUTER_PROVIDERS, FormsModule, ReactiveFormsModule, DialogModule],       // module dependencies
  declarations: [AppComponent, DashboardLeftNavComponent, Spinner, LoginComponent,
    LogoutComponent, AuthorizeComponent, CommunityComponent, DashboardComponent],   // components and directives
  bootstrap: [AppComponent],     // root component
  providers: [LOGIN_SERVICE_PROVIDERS, HttpClient, Title, AuthGuard, AuthService,
    CustomSubService, CustomValidator, PreloadSelectedModules,StrategistService,
    { provide: 'ApiEndpoint', useValue: 'http://34.193.170.5:4000/v1/' },
    {
      provide: Http, useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, subService: CustomSubService) => new CustomHttp(backend, defaultOptions, subService),
      deps: [XHRBackend, RequestOptions, CustomSubService]
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy }]             // services
})
export class AppModule { }