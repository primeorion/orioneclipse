import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import * as Util from '../../core/functions';
import { IPortfolio, IPortfolioCustomView, IPortfolioSimple, IPortfolioViewModel, IAccount, IPortfolioFilters, IAddAccounts } from '../../models/portfolio';
import { IAccountSimple } from '../../models/account';
import { PortfolioService } from '../../services/portfolio.service';
import { AccountService } from '../../services/account.service';

@Component({
    selector: 'eclipse-assign-accounts-portfolio',
    templateUrl: './app/shared/accounts/assign.accounts.html',
    providers: [PortfolioService]
})
export class Accounts {
    @Output() parentCallback = new EventEmitter();
    @Input() accountModel: IAccountSimple;
    @Input() portfolioModel: IPortfolio;
    @Input() householdModel: IPortfolioCustomView;
    @Input() showAssignPopup: boolean;

    private accountGridOptions: GridOptions;
    private accountsColumnDefs: ColDef[];
    private accounts: IAccount[] = [];
    private portfolioGridOptions: GridOptions;
    private portfolioColumnDefs: ColDef[];
    private portfolios: IPortfolio[] = [];
    private household: IPortfolioCustomView;
    private accountsSuggestions: IAccountSimple[] = [];
    private portfolioSuggestions: IPortfolioSimple[] = []
    private householdSuggestions: IPortfolioCustomView[] = [];
    accountFilterId: number = 0;
    portfolioFilterId: number = 0;
    accountType: number = 0;
    accountSearch: boolean = true;
    portfolioSearch: boolean = true;
    householdSearch: boolean;
    searchAccountString: string;
    searchPorfolioString: string;
    searchHouseHoldString: string;
    shwPortfolioMsg: boolean;
    displayConfirm: boolean;

    constructor(private _router: Router,
        private _portfolioService: PortfolioService, private _accountService: AccountService) {
        this.accountGridOptions = <GridOptions>{};
        this.portfolioGridOptions = <GridOptions>{};
        this.initAccountsColumnDefs();
        this.initPortfolioColumnDefs();
    }

    /** Get portfolios by type */
    getPortfoliosByType(portfolioTypeId: number) {

        if (portfolioTypeId == 0) {
            Util.responseToObjects<IPortfolio>(this._portfolioService.getPortfolios(+portfolioTypeId))
                .subscribe(model => {
                    this.portfolios = model;
                    console.log("All Portfolios: ", this.portfolios);
                },
                error => {
                    throw error;
                });
        }
        else if (portfolioTypeId == 1) {
            Util.responseToObject<IPortfolio[]>(this._portfolioService.getNewPortfolios())
                .subscribe(newmodel => {
                    this.portfolios = newmodel;
                },
                error => {
                    throw error;
                });
        }
    }

    /** Search by Portfolio Name */
    autoPortfolioSearch(event) {
        Util.responseToObjects<IPortfolioSimple>(this._portfolioService.searchPortfolio(event.query.toLowerCase()))
            .subscribe(model => {
                //this.portfolioSuggestions = model;
                this.portfolioSuggestions = model.filter(a => a.isDeleted == 0);
                this.portfolios.forEach(element => {
                    this.portfolioSuggestions = this.portfolioSuggestions.filter(record => record.id != element.id);
                });

                console.log("Serach Accounts: ", this.portfolioSuggestions);
            });
    }

    /** Search by HouseHold ID's */
    autoHouseholdSearch(event) {
        Util.responseToObjects<IPortfolioCustomView>(this._portfolioService.searchHousehold(event.query.toLowerCase()))
            .subscribe(model => {
                this.householdSuggestions = model;
                console.log("Serach HouseHold: ", this.householdSuggestions);
            });
    }

    /** Conformation for Re-Assign Portfolio/Account */
    assignConformation() {
        this.enableAssignButton();
        this.accounts = [];
        this.portfolios = [];
        let accountIds = this.accountGridOptions.api.getSelectedRows().map(element => element.id);
        let selectedPortfolios = this.portfolioGridOptions.api.getSelectedRows();
        if (Util.isNull(accountIds) || Util.isNull(selectedPortfolios)) return;
        let addAccountids = <IAddAccounts>{ accountIds: accountIds };
        this._portfolioService.assignAccounts(selectedPortfolios[0].id, addAccountids)
            .subscribe(data => {
                this.showAssignPopup = false;
                this.parentCallback.emit("Parent callback event fired");
            }, error => {
                console.log(error);
                throw error;
            });
        if (Util.isNull(accountIds) || Util.isNull(selectedPortfolios) || accountIds.length == 0 || selectedPortfolios.length == 0) return;
        // let addAccountids = <IAddAccounts>{ accountIds: accountIds };
        console.log("assignAccountsToPortfolio: ", addAccountids);
        this._portfolioService.assignAccounts(selectedPortfolios[0].id, addAccountids)
            .subscribe(data => {
                this.showAssignPopup = false;
                this.resetAssignPopup();
            }, error => {
                console.log(error);
                throw error;
            });

        this.displayConfirm = false;
    }

    /** Assign Portfolio popup */
    assignAccountsToPortfolio() {
        this.displayConfirm = true;
    }

    /** clear selected accounts and portfolio's */
    resetAssignPopup() {
        this.accountFilterId = 0;
        this.portfolioFilterId = 0;
        this.accountSearch = true;
        this.portfolioSearch = true;
        this.householdSearch = false;
        this.accounts = [];
        this.portfolios = [];
        this.searchAccountString = '';
        this.searchPorfolioString = '';
        this.searchHouseHoldString = '';
        this.accountGridOptions.api.deselectAll();
        this.portfolioGridOptions.api.deselectAll();
        if (!this.showAssignPopup) this.showAssignPopup = false;
        console.log("resetAssignPopup: ", this.showAssignPopup);
        this.parentCallback.emit("Parent callback event fired");
    }


    /** Assign Portfolio  */
    onPortfolioRowClicked(event) {
    }
    onRowSelect(event) {
        this.enableAssignButton();
    }

    /** Account DropDown selection */
    onAccountTypeChange(param) {
        this.accounts = [];
        this.accountSearch = (param == 0);
        if (param > 0) {
            this.getAccountsByType(param);
        }
    }

    /** Portfolio DropDown Selection */
    onPortfolioTypeChange(param) {
        this.portfolios = [];
        this.householdSearch = (param == 2);
        this.portfolioSearch = !(param == 1 || param == 2);
        //this.householdSearch = !(param == 0 || param == 1);
        if (param > 0)
            this.getPortfoliosByType(+param);
        console.log("onPortfolioTypeChange: ", param);

    }


    /** selected item display in grid for accounts */
    onAccountSelect(params: any) {
        this.searchAccountString = '';
        this.accounts.push(params);
        this.accountGridOptions.api.setRowData(this.accounts);
        this.accountGridOptions.api.selectAll();
        this.enableAssignButton();
    }

    /** selected item disabled in grid for portfolio */
    onPortfolioSelect(params: any) {
        this.searchPorfolioString = '';
        this.portfolios.push(params)
        this.portfolioGridOptions.api.setRowData(this.portfolios);
        this.enableAssignButton();
    }

    /** selected item disabled in grid for HouseHold */
    onHouseHoldSelect(params: any) {
        this.searchHouseHoldString = '';
        this.portfolios.push(params)
        this.portfolioGridOptions.api.setRowData(this.portfolios);
        this.enableAssignButton();
    }

    /** initialize Accounts Grid options */
    private initAccountsColumnDefs() {
        this.accountsColumnDefs = [
            <ColDef>{ headerName: "", field: "chck", width: 30, checkboxSelection: true, filter: 'number' },
            <ColDef>{ headerName: "ID", field: "id", width: 100, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Name", field: "name", width: 140, filter: 'text' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 140, filter: 'number' },
            <ColDef>{ headerName: "Type", field: "accountType", width: 90, cellClass: 'text-center', filter: 'text' }
        ];
    }

    /** initialize Portfolio Grid options */
    private initPortfolioColumnDefs() {
        this.portfolioColumnDefs = [
            <ColDef>{ headerName: "Id", field: "id", width: 100, cellClass: "text-center", filter: 'number' },
            <ColDef>{ headerName: "Name", field: "name", width: 140, filter: 'text' },
            <ColDef>{ headerName: "Team", field: "team", width: 140, filter: 'text' },
            <ColDef>{ headerName: "Model", field: "model", width: 140, filter: 'text' },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 140, filter: 'number' },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 140, filter: 'number' },
            <ColDef>{ headerName: "Cash", field: "cash", width: 140, filter: 'number' },
            <ColDef>{ headerName: "Cash Reserve", field: "cashReserve", width: 140, filter: 'number' }
        ];
    }

    /** Search by Account Name */
    autoAccountSearch(event) {
        Util.responseToObjects<IAccountSimple>(this._accountService.searchAccounts(event.query.toLowerCase()))
            .subscribe(model => {
                this.accountsSuggestions = model;
                this.accounts.forEach(element => {
                    this.accountsSuggestions = this.accountsSuggestions.filter(record => record.id != element.id);
                    console.log("Accounts Search :" ,this.accountsSuggestions);
                });
            });
    }

    /** Selected Account Name append to Assign Portfolio Grid*/
    initFromAccount(account) {
        this.accounts = <IAccount[]>[];
        if (account != undefined)
            this.accounts = account;//.filter(m=>m.id != undefined);
        this.showAssignPopup = true;

    }

    /** selected Portfolio Name to Assign Portfolio Grid */
    initFromPortfolio(portfolio) {
        this.portfolios = <IPortfolio[]>[];
        // this.portfolios.push(this.portfolioModel);
        if (portfolio != undefined)
            this.portfolios = portfolio;
        this.showAssignPopup = true;
    }

    /** Get All Accounts in AssginPorfolio */
    getAccountsByType(accountTypeId) {
        if (accountTypeId > 0) {
            Util.responseToObjects<IAccount>(this._accountService.getAccounts(+accountTypeId))
                .subscribe(model => {
                    this.accounts = model;
                    console.log("All Accounts: ", this.accounts);
                },
                error => {
                    throw error;
                });
        }
        // else if(accountTypeId == 5)
        // {
        //      Util.responseToObjects<IAccount>(this._accountService.getNoportfolioAccounts())
        //         .subscribe(model => {
        //             this.accounts = model;
        //             console.log("All getNoportfolioAccounts: ", this.accounts);
        //         },
        //         error => {
        //             throw error;
        //         });
        // }
    }

    onBeforeHide() {
        this.resetAssignPopup();
    }

    /**Enable add button only after selection of User from auto search */
    enableAssignButton() {
        let selectedAccounts = this.accountGridOptions.api.getSelectedRows();
        let selectedPortfolios = this.portfolioGridOptions.api.getSelectedRows();

        if (selectedAccounts.length > 0 && selectedPortfolios.length > 0)
            return true;
        else
            return false;

    }

}
