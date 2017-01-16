import { Component } from '@angular/core';
import { BaseComponent } from '../../core/base.component';

import { ProgressBarCharts } from '../../services/progresschart.service';
import { DashboardService } from '../../services/dashboard.service';
import { IDashboardSummary, IAnalysisSummary, IModalSummary, IPricerange } from '../../models/mainDashboard';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'eclipse-dashboard-overview',
  templateUrl: './app/components/dashboard/overview.component.html',
  providers: [DashboardService]
})

export class OverviewComponenet extends BaseComponent {

  DashboardData: IDashboardSummary = <IDashboardSummary>{};
  donutData: IModalSummary[] = [];//= <IModalSummary>{};
  summaryData: IAnalysisSummary = <IAnalysisSummary>{};
  pricerange: IPricerange = <IPricerange>{};
  connection;
  disableFullImport: boolean = false;

  constructor(private progressBar: ProgressBarCharts, private notificationService: NotificationService, private _dashboardservice: DashboardService) {
    super();
    this.DashboardData = <IDashboardSummary>{};
    this.donutData = [];
    this.summaryData = <IAnalysisSummary>{};
    this.pricerange = <IPricerange>{};
  }

  ngOnInit() {

    this.responseToObject<IDashboardSummary>(this._dashboardservice.getDashboardsummary())
      .subscribe(responceData => {
        this.DashboardData = responceData;
        this.donutData = this.DashboardData['warningsSummary'];
        this.summaryData = this.DashboardData['importAnalysisSummary'];
        this.pricerange = this.summaryData['priceRange'];
        // for (var i = 0; i < this.donutData['length']; i++) {
        //   if (i <= 2) {
        //     this.progressBar.createProgressPieChart(".progresschartpie_one", this.donutData[i]);
        //   }
        //   else {
        //     this.progressBar.createProgressPieChart(".progresschartpie_two", this.donutData[i]);

        //   }

        // };

      });
    this.loadNotifications();

  }

  public getPostImportData() {

    this.responseToObject<any>(this._dashboardservice.getimportData())
      .subscribe(responceData => {
        console.log(responceData, 'responceData')
      });
  }


  /** TODO: SERVICES THAT ARE YET TO BE INTEGRATED
   *  1. REFRESH ANALYTICS
   *  2. START NEW FULL IMPORT
   *  3. START NEW PARTIAL IMPORT
   */

  /** on menu links click, specific action will be performed */
  onMenuClick(action) {
    switch (action) {
      case "RefreshAnalytics":
        this.refreshAnalyticsdata();
        break;
    }
  }

  /** REFRESH ANALYTICS */
  public refreshAnalyticsdata() {

    // this.responseToObject<any>(this._dashboardservice.refreshAnalytics())
    //   .subscribe(analyticsResponse => {
    //     console.log('Refresh analytics Response---', 'analyticsResponse')
    //   });

  }

  /** START NEW FULL IMPORT */
  public startNewFullImport() {

    this.responseToObject<any>(this._dashboardservice.initiateNewFullImport())
      .subscribe(fullImportResponse => {
        console.log('full Import Response', fullImportResponse)
      });

  }

  /** START NEW PARTIAL IMPORT */
  public startNewPartialImport() {

    this.responseToObject<any>(this._dashboardservice.initiateNewPartialImport())
      .subscribe(partialImportResponse => {
        console.log('partial Import Response', partialImportResponse)
      });

  }

  /**to calculate percentage */
  calculatePercentage(actualValue, totalValue) {
    return ((actualValue / totalValue) * 100); //.toFixed(2);
  }

  /** to get module name for routing */
  getRouteModuleName(name: string) {
    let routeModuleName = "";
    switch (name) {
      case "models":
        routeModuleName = "model";
        break;
      case "accounts":
        routeModuleName = "account";
        break;
      case "portfolios":
        routeModuleName = "portfolio";
        break;
      case "tradeorders":
        routeModuleName = "tradeorder";
        break;
      default:
        routeModuleName = "dashboard";
        break;
    }
    return routeModuleName;
  }

  /** to get page name for routing */
  getRouteActionName(name: string) {
    let routeActionName = "";
    switch (name) {
      case "tradeorders":
        routeActionName = "list";
        break;
      case "holdings":
        routeActionName = "";
        break;
      default:
        routeActionName = "dashboard";
        break;
    }
    return routeActionName;
  }
  /**to get color for bar based on the module name */
  getColorClassName(name: string) {
    let className = "";
    switch (name) {
      case "models":
        className = "model";
        break;
      case "accounts":
        className = "tolerance";
        break;
      case "portfolios":
        className = "rebalance";
        break;
      case "holdings":
        className = "cashneed";
        break;
      case "tradeorders":
        className = "trades";
        break;
      default:
        className = "model";
        break;
    }
    return className;
  }
  /**to get title for bar based on the module name */
  getModuleName(name: string) {
    let moduleName = "";
    switch (name) {
      case "models":
        moduleName = "Models";
        break;
      case "tradeorders":
        moduleName = "Trade Orders";
        break;
      case "portfolios":
        moduleName = "Portfolios";
        break;
      case "accounts":
        moduleName = "Accounts";
        break;
      case "holdings":
        moduleName = "Holdings";
        break;
      default:
        moduleName = name;
        break;
    }
    return moduleName;
  }


  //for Notification subscribe
  loadNotifications() {    
    this.connection = this.notificationService.getNotifications().subscribe(notification => {      
      let notificationData = JSON.parse(<any>notification);
      if (notificationData != null) {
        if (notificationData["typeId"] == 2 && notificationData["progressNotification"]["progress"] != 100) {
          this.disableFullImport = true;
        }
        else if (notificationData["typeId"] == 2 && notificationData["progressNotification"]["progress"] == 100) {
          this.disableFullImport = false;
        }
        else {
          this.disableFullImport = false;
        }
      }

      // this.notification = JSON.parse(<any>notification);
      // this.notificationVM = JSON.parse(<any>notification);
      // TODO: Notification Notification here
      // switch ("" + this.notificationVM.typeId) {
      //     case "" + EmitNotificationType.NotificationWindow: /** FOR NOTIFICATION WINDOW MESSAGE/S */
      //         if (this.notificationVM.userNotification != null) {
      //             this.createHtmlNotification(this.notificationVM.userNotification.id, this.notificationVM.userNotification.subject, this.notificationVM.userNotification.body, 2000);
      //             //this.createNotification(this.notificationVM.userNotification.id, this.notificationVM.userNotification.subject, + "/n" + this.notificationVM.userNotification.body, 5000);                        
      //             this.msgCount++;
      //             this.msgCounter.emit(this.msgCount);
      //         }
      //         break;
      //     case "" + EmitNotificationType.ProgressWindow: /**FOR PROGRESS WINDOW NOTIFICATION */
      //         this.hideProgressBar = true;
      //         if (this.notificationVM.progressNotification) {
      //             this.value = this.notificationVM.progressNotification.progress;
      //             this.analyticsProgress = this.notificationVM.progressNotification.message;
      //             if (this.notificationVM.progressNotification.progress == 100) {
      //                 this.showProgress(this.notificationVM.progressNotification);
      //             }
      //         }
      //         break;
      // }
    });
  }

}




