import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CustomExceptionHandler } from '../app/core/exceptionhandler';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { SessionHelper } from './core/session.helper';
import { HttpClient } from './core/http.client';
import { Spinner } from './shared/spinner/spinner';
import { APP_ROUTER_PROVIDERS, routes } from './app.routes';

import { DND_PROVIDERS } from 'ng2-dnd';
import { LoginComponent } from '../app/login/login.component';
import { LogoutComponent } from '../app/login/logout.component';
import { LoginAsComponent } from '../app/login/loginAs.component';
import { EclipseComponent } from '../app/eclipse.component';
import { DashboardLeftNavComponent } from './shared/leftnavigation/dashboard.leftnav.component';
import { OverviewComponenet } from '../app/components/dashboard/overview.component';
import { NotAuthorizedComponent } from './shared/notauthorized/notauthorized.component';
import { NotFoundComponent } from './shared/notfound/notfound.component';
import './libs/constants.enums';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { CustomSubService } from './core/customSubService';
import { SharedModule } from './shared/shared.module';
import { ProgressBarCharts } from './services/progresschart.service';
import { PreloadSelectedModules } from './core/module.preload.strategy';
import { SimpleNotificationsModule, PushNotificationsModule } from 'angular2-notifications';
import { NotificationService } from './services/notification.service';
import { FirmService } from './services/firm.service';
import { DataQueriesComponenet } from '../app/components/querybuilder/dataqueries/dataqueries.component';
enableProdMode();

@NgModule({
  // module dependencies
  imports: [BrowserModule, HttpModule, FormsModule, ReactiveFormsModule,
    SharedModule, SimpleNotificationsModule, PushNotificationsModule,
    APP_ROUTER_PROVIDERS],
  exports: [RouterModule],
  // components and directives
  declarations: [AppComponent, NotAuthorizedComponent, NotFoundComponent, Spinner,
    LoginComponent, LogoutComponent, LoginAsComponent, DashboardLeftNavComponent, EclipseComponent,
    OverviewComponenet,DataQueriesComponenet],
  bootstrap: [AppComponent], // root component
  // providers & services
  providers: [AuthGuard, AuthService, HttpClient, SessionHelper, NotificationService,
    CustomSubService, ProgressBarCharts, PreloadSelectedModules, FirmService,
    { provide: 'ApiEndpoint', useValue: 'http://34.193.170.5:3000/v1/' },
    { provide: 'NotificationEndpoint', useValue: 'http://34.193.170.5:3000' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: 'CommunityUrl', useValue: 'http://34.193.170.5:3590/' }]
})
export class AppModule { }