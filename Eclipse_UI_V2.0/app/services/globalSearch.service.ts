import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '../core/http.client';
import { IGlobalSearchResults } from '../models/globalSearch';
import { IPortfolioSimple } from '../models/portfolio';
import { IAccountSimple } from '../models/account';
import { IHoldingWithReturnValue } from '../models/holding';
import { IModel } from '../models/modeling/model';
import { ITeam } from '../models/team';
import { IRole} from '../models/user.models';
import { IUser} from '../models/user';
import { ISecurity } from '../models/security';

@Injectable()
export class GlobalSearchService {

    private _portfolioSimpleEndPoint = 'portfolio/portfolios/simple';
    private _accountSimpleEndPoint = 'account/accounts/simple';
    private _holdingsEndPoint = 'holding/holdings';
    private _modelEndPoint = 'modeling/models';
    private _teamEndPoint = 'admin/teams';
    private _rolesEndPoint = 'admin/roles';
    private _userEndPoint = 'admin/Users';
    private _securityEndPoint = "security/securities";

    constructor(private _httpClient: HttpClient) { }

    getDashboardPages(){
        var dashboardPages : IGlobalSearchResults[] = [
            {
                "id":1,
                "name":"Dashboard Overview",
                "category": "page",
                "module":"",
                "uiClass": "fa-paper-plane-o",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/dashboard"
            }
        ];

        return dashboardPages;
    }

    getPortfolioPages(){
        var portfolioPages : IGlobalSearchResults[] = [
            {
                "id":2,
                "name":"Portfolio: Portfolio Dashboard",
                "category": "page",
                "module":"Portfolio",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/portfolio/dashboard"
            },
            {
                "id":3,
                "name":"Portfolio: All Portfolios",
                "category": "page",
                "module":"Portfolio",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/portfolio/list"
            },
            {
                "id":4,
                "name":"Portfolio: Portfolio Details",
                "category": "page",
                "module":"Portfolio",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/portfolio/view"
            }
        ];
        return portfolioPages;
    }

    getAccountPages(){
        var accountPages : IGlobalSearchResults[] = [
           {
                "id":5,
                "name":"Accounts: Account Dashboard",
                "category": "page",
                "module":"Accounts",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/account/dashboard"
            },
            {
                "id":6,
                "name":"Accounts: All Accounts",
                "category": "page",
                "module":"Accounts",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/account/list"
            },
            {
                "id":7,
                "name":"Accounts: Account Details",
                "category": "page",
                "module":"Accounts",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/account/view"
            }
        ];
        return accountPages;
    }

    getHoldingPages(){
        var holdingPages : IGlobalSearchResults[] = [
            {
                "id":8,
                "name":"Holdings: Holdings Dashboard",
                "category": "page",
                "module":"Holdings",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/holding/dashboard"
            }
        ];

        return holdingPages;
    }

    getModelMaintenancePages(){
        var modelMaintenancePages : IGlobalSearchResults[] = [
           {
                "id":9,
                "name":"Model Maintenance: Model Dashboard",
                "category": "page",
                "module":"Model Maintenance",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/model/dashboard"
            },
            {
                "id":10,
                "name":"Model Maintenance: All Models",
                "category": "page",
                "module":"Model Maintenance",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/model/list"
            },
            {
                "id":11,
                "name":"Model Maintenance: Model Details",
                "category": "page",
                "module":"Model Maintenance",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/model/view"
            }
        ];
        return modelMaintenancePages;
    }

    getModelCreationPages(){
        var modelCreationPages : IGlobalSearchResults[] = [
           {
                "id":12,
                "name":"Model Creation: Model Information",
                "category": "page",
                "module":"Model Creation",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/model/modelinfoadd"
            },
            {
                "id":13,
                "name":"Model Creation: Model Structure",
                "category": "page",
                "module":"Model Creation",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/model/modelinfoadd"
            }
        ];
        return modelCreationPages;
    }

    getSecuritiesPages(){
        var securitiesPages : IGlobalSearchResults[] = [
           {
                "id":14,
                "name":"Securities: Securities Dashboard",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/dashboard"
            },
            {
                "id":15,
                "name":"Securities: All Securities",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/maintenance/list"
            },
            {
                "id":16,
                "name":"Securities: Securities Detail",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/maintenance/view"
            },
            {
                "id":17,
                "name":"Securities: All Securities Set",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/securitySet/list"
            },
            {
                "id":18,
                "name":"Securities: Securities Set Detail",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/securitySet/view"
            },
            {
                "id":19,
                "name":"Securities: Category Maintenance",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/asset/category"
            },
            {
                "id":20,
                "name":"Securities: Class Maintenance",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/asset/class"
            },
            {
                "id":21,
                "name":"Securities: Sub Class Maintenance",
                "category": "page",
                "module":"Securities",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/security/asset/subclass"
            }
        ];
        return securitiesPages;
    }

    getAdministratorPages(){
        var administratorPages : IGlobalSearchResults[] = [
           {
                "id":22,
                "name":"Administrator: Administrator Dashboard",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/dashboard"
            },
            {
                "id":23,
                "name":"Administrator: All Teams",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/team/list"
            },
            {
                "id":24,
                "name":"Administrator: Team Details",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/team/view"
            },
            {
                "id":25,
                "name":"Administrator: All Users",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/user/list"
            },
            {
                "id":26,
                "name":"Administrator: User Details",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/user/view"
            },
            {
                "id":27,
                "name":"Administrator: All Roles",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/role/list"
            },
            {
                "id":28,
                "name":"Administrator: Role Details",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/role/view"
            },
            {
                "id":29,
                "name":"Administrator: Firm Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/firm"
            },
            {
                "id":30,
                "name":"Administrator: Custodian Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/custodian"
            },
            {
                "id":31,
                "name":"Administrator: Team Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/team"
            },
            {
                "id":32,
                "name":"Administrator: Model Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/model"
            },
            {
                "id":33,
                "name":"Administrator: Portfolio Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/portfolio"
            },
            {
                "id":34,
                "name":"Administrator: Account Settings",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/preferences/account"
            },
            {
                "id":35,
                "name":"Administrator: All Custodians",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/custodian/list"
            },
            {
                "id":36,
                "name":"Administrator: Custodian Details",
                "category": "page",
                "module":"Administrator",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/admin/custodian/view"
            }
        ];
        return administratorPages;
    }

    getTradePages(){
        var tradesPages : IGlobalSearchResults[] = [
            {
                "id":37,
                "name":"Trades: Trade Orders",
                "category": "page",
                "module":"Trades",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/tradeorder/list"
            },
            {
                "id":38,
                "name":"Trades: Awaiting Acceptance",
                "category": "page",
                "module":"Trades",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/tradeorder/awaiting"
            },
            {
                "id":39,
                "name":"Trades: Trade Files",
                "category": "page",
                "module":"Trades",
                "uiClass": "fa-sticky-note",
                "type": "page",
                "value": 0,
                "routeUrl":"/eclipse/tradeorder/tradefile"
            }
        ];

        return tradesPages;
    }

    getGlobalDataSearchResults(searchString: string, selectedOptions: string[]){
        let observableBatch = [];
        var searchResults : IGlobalSearchResults[] = [];//this.getGlobalSearchModulePageResults(searchString);

         // Also Get List of Pages of each module, filter them and add to results

         //Dashboard Pages
        var dashboardPageList = this.getDashboardPages();
        var dashboardModulePages = dashboardPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
        dashboardModulePages.forEach(modulePage => {
                searchResults.push(modulePage);
            });

        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Portfolios") != -1){
            //portfolio module
            var portfolioModule = [{
                "id": 1,
                "name": "Overview: Portfolio",
                "category": "module",
                "module": "Portfolio",
                "uiClass": "fa-suitcase",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/portfolio/dashboard"
            }];
            var portfolioModuleSearch = portfolioModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            portfolioModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Portfolio Pages
            var portfolioPageList = this.getPortfolioPages();
            var portoflioModulePages = portfolioPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            portoflioModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            // Portfolio Simple Search
            var portfolioSearch = this._httpClient.getData(this._portfolioSimpleEndPoint +'?includevalue=true&searchAccounts=true'+'&search=' + searchString)
            .map((response: Response)=> response.json());
            observableBatch.push(portfolioSearch);
        }
        
        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Accounts") != -1){
            //account module
            var accountModule = [{
                "id": 2,
                "name": "Overview: Accounts",
                "category": "module",
                "module": "Accounts",
                "uiClass": "fa-calculator",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/account/dashboard"
            }];

            var accountModuleSearch = accountModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            accountModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });
            
            //Account Pages
            var accountPageList = this.getAccountPages();
            var accountModulePages = accountPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            accountModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });
                
            // Account Simple Search
            var accountSearch = this._httpClient.getData(this._accountSimpleEndPoint + '?search=' + searchString)
            .map((response: Response)=> response.json());
            observableBatch.push(accountSearch);
        }
        
        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Holdings") != -1){
            //holdings module
            var holdingsModule = [{
                "id": 3,
                "name": "Overview: Holdings",
                "category": "module",
                "module": "Holdings",
                "uiClass": "fa-cogs",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/holding/dashboard"
            }];

            var holdingsModuleSearch = holdingsModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            holdingsModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Holdings Pages
            var holdingsPageList = this.getHoldingPages();
            var holdingsModulePages = holdingsPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            holdingsModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            // Holdings Simple Search
            var holdingSearch = this._httpClient.getData(this._holdingsEndPoint + '?search=' + searchString)
            .map((response: Response) => response.json());
            observableBatch.push(holdingSearch);
        }


        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Models") != -1){
            //model modules
            var modelModule = [{
                "id": 5,
                "name": "Overview: Model Maintenance",
                "category": "module",
                "module": "Model Maintenance",
                "uiClass": "fa-wrench",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/model/dashboard"
            },
            {
                "id": 6,
                "name": "Overview: Model Creation",
                "category": "module",
                "module": "Model Creation",
                "uiClass": "fa-edit",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/model/modelinfoadd"
            }];

            
            var modelModuleSearch = modelModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            modelModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Model Maintenance Pages
            var modelMaintenacePageList = this.getModelMaintenancePages();
            var modelModulePages = modelMaintenacePageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            modelModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Model Creation Pages
            var modelCreationPageList = this.getModelCreationPages();
            modelModulePages = modelCreationPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            modelModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Model Simple Search
            var modelSearch = this._httpClient.getData(this._modelEndPoint + '?search=' + searchString)
            .map((response: Response) => response.json());
            observableBatch.push(modelSearch);
        }

        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Administrator") != -1){
            //administrator module
            var administratorModule = [{
                "id": 7,
                "name": "Overview: Administrator",
                "category": "module",
                "module": "Administrator",
                "uiClass": "fa-user",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/admin/dashboard"
            }];
            var administratorModuleSearch = administratorModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            administratorModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });
            
            
            //Administrator Pages
            var administratorPageList = this.getAdministratorPages();
            var administratorModulePages = administratorPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            administratorModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Administrator search
            // var teamSearch = this._httpClient.getData(this._teamEndPoint + '?search=' + searchString)
            // .map((response: Response) => response.json());
            // observableBatch.push(teamSearch);
            // var roleSearch = this._httpClient.getData(this._rolesEndPoint + '?search=' + searchString)
            // .map((response: Response) => response.json());
            // observableBatch.push(roleSearch);
            // var userSearch = this._httpClient.getData(this._userEndPoint + "?search=" + searchString)
            // .map((response: Response) => response.json());
            // observableBatch.push(userSearch);
        }

        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Trades") != -1){
            //trades module
            var tradesModule = [{
                "id": 4,
                "name": "Overview: Trade Order",
                "category": "module",
                "module": "Trade Order",
                "uiClass": "fa-line-chart",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/tradeorder/list"
            }];
            var tradesModuleSearch = tradesModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            tradesModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Trades Pages
            var tradesPageList = this.getTradePages();
            var tradesModulePages = tradesPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            tradesModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });
        }

        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Securities") != -1){
            //securities module
            var securitiesModule = [{
                "id": 8,
                "name": "Overview: Securities",
                "category": "module",
                "module": "Securities",
                "uiClass": "fa-secure-dollar",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/security/dashboard"
            }];

            var securitiesModuleSearch = securitiesModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            securitiesModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //Securities Pages
            var securitiesPageList = this.getSecuritiesPages();
            var securityModulePages = securitiesPageList.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            securityModulePages.forEach(modulePage => {
                    searchResults.push(modulePage);
                });

            //security search
            // var securitySearch = this._httpClient.getData(this._securityEndPoint + "?search=" + searchString)
            // .map((response: Response) => response.json());
            // observableBatch.push(securitySearch);
        }

        if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Rebalancer") != -1){
            //rebalancer module
            var rebalancerModule = [{
                "id": 9,
                "name": "Overview: Rebalancer",
                "category": "module",
                "module": "Rebalancer",
                "uiClass": "fa-pie-chart",
                "type": "module",
                "value": 0,
                "routeUrl": "/eclipse/rebalance"
            }];

            var rebalancerModuleSearch = rebalancerModule.filter(element => {return element.name.toLowerCase().indexOf(searchString) > -1});
            rebalancerModuleSearch.forEach(modulePage => {
                    searchResults.push(modulePage);
                });
        }

        Observable.forkJoin(observableBatch).subscribe((data: any[]) => {
                var i = 0;
                if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Portfolios") != -1){
                    var portfolioSearchResults = <IPortfolioSimple[]>data[i];
                    portfolioSearchResults.forEach(result => {
                        var portfolioData = <IGlobalSearchResults>{
                            "id": result.id,
                            "name": result.name,
                            "category": "portfoliodata",
                            "module": "portfolio",
                            "uiClass": "fa-suitcase",
                            "type":"data",
                            "value": 0,
                            "routeUrl":'/eclipse/portfolio/search/'+result.id
                        };
                        searchResults.push(portfolioData);
                    });
                    i++;
                }
                
                if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Accounts") != -1){
                    var accountSearchResults = <IAccountSimple[]>data[i];
                    accountSearchResults.forEach(result => {
                        var accountData = <IGlobalSearchResults>{
                            "id": result.id,
                            "name": result.name,
                            "category": "accountdata",
                            "module": "account",
                            "uiClass": "fa-calculator",
                            "type":"data",
                            "value": 0,
                            "routeUrl":'/eclipse/account/search/'+result.id
                        };
                        searchResults.push(accountData);
                    });
                    i++;
                }
                
                if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Holdings") != -1){
                    var holdingSearchResults = <IHoldingWithReturnValue[]>data[i];
                    holdingSearchResults.forEach(result => {
                        var holdingData = <IGlobalSearchResults>{
                            "id":result.id,
                            "name": result.name,
                            "category": "holdingdata",
                            "module":"holding",
                            "uiClass": result.type == "account" ?"fa-calculator" : "fa-suitcase",
                            "type":result.type,
                            "value": result.value,
                            "routeUrl":'/eclipse/holding/filter/dashboard/'+ result.type + '/' + result.id
                        };
                        searchResults.push(holdingData);
                    });
                    i++;
                }

                if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Models") != -1){
                    var modelSearchResults = <IModel[]>data[i];
                    modelSearchResults.forEach(result => {
                        var modelData = <IGlobalSearchResults>{
                            "id":result.id,
                            "name": result.name,
                            "category": "modeldata",
                            "module":"models",
                            "uiClass": "fa-wrench",
                            "type":"data",
                            "value": 0,
                            "routeUrl":'/eclipse/model/search/' + result.id
                        };
                        searchResults.push(modelData);
                    });
                    i++;
                }

                // if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Administrator") != -1){
                //     var teamSearchResults = <ITeam[]>data[i];
                //     teamSearchResults.forEach(result => {
                //         var teamData = <IGlobalSearchResults>{
                //             "id":result.id,
                //             "name": result.name,
                //             "category": "teamdata",
                //             "module":"Administrator",
                //             "uiClass": "fa-user",
                //             "type":"data",
                //             "value": 0,
                //             "routeUrl":'/eclipse/admin/team/filter/' + result.id
                //         };
                //         searchResults.push(teamData);
                //     });
                //     i++;
                //     var roleSearchResults = <IRole[]>data[i];
                //     roleSearchResults.forEach(result => {
                //         var roleData = <IGlobalSearchResults>{
                //             "id":result.id,
                //             "name": result.name,
                //             "category": "roledata",
                //             "module":"Administrator",
                //             "uiClass": "fa-user",
                //             "type":"data",
                //             "value": 0,
                //             "routeUrl":'/eclipse/admin/role/filter/' + result.id
                //         };
                //         searchResults.push(roleData);
                //     });
                //     i++;
                //     var userSearchResults = <IUser[]>data[i];
                //     userSearchResults.forEach(result => {
                //         var userData = <IGlobalSearchResults>{
                //             "id":result.id,
                //             "name": result.name,
                //             "category": "userdata",
                //             "module":"Administrator",
                //             "uiClass": "fa-user",
                //             "type":"data",
                //             "value": 0,
                //             "routeUrl":'/eclipse/admin/user/filter/' + result.id
                //         };
                //         searchResults.push(userData);
                //     });
                //     i++;
                // }

                // if(selectedOptions.indexOf("All") != -1 || selectedOptions.indexOf("Securities") != -1){
                //     var securitySearchResults = <ISecurity[]>data[i];
                //     securitySearchResults.forEach(result => {
                //         var securityData = <IGlobalSearchResults>{
                //             "id":result.id,
                //             "name": result.name,
                //             "category": "securitydata",
                //             "module":"securities",
                //             "uiClass": "fa-secure-dollar",
                //             "type":"data",
                //             "value": 0,
                //             "routeUrl":'/eclipse/security/maintenance/search/' + result.id
                //         };
                //         searchResults.push(securityData);
                //     });
                //     i++;
                // }
            });

            return searchResults;
    }

}