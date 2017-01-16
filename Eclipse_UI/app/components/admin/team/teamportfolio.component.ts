import { Component, HostListener} from '@angular/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import { BaseComponent } from '../../../core/base.component';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Response } from '@angular/http';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { ITeamPortfolio} from  '../../../models/team';
import { TeamService } from '../../../services/team.service';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
    selector: 'eclipse-admin-teamportfolio',
    templateUrl: './app/components/admin/team/teamportfolio.component.html',
    directives: [AgGridNg2, AutoComplete, Button, Dialog]
})

export class TeamPortfolioComponent1 extends BaseComponent {
    public gridOptions: GridOptions;
    private showGrid: boolean;
    public teamPortfolio: ITeamPortfolio[] = [];
    public columnDefs: ColDef[];
    selectedPortfolio: any;
    FilteredProtfolioresults: ITeamPortfolio[] = [];
    private displayConfirm: boolean;
    private selectedportfoliotoDelete: number;
    private teamId: number;
     btnDisablePortfolio: boolean = true;
    isViewPortfolio: boolean = false;

    constructor(private _teamService: TeamService, private _portfolioService: PortfolioService) {
        super();
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.showGrid = true;
        this.FilteredProtfolioresults = [];
    }

    /** To load team portfolios details while add */
    loadAddMode() {
        this.resetForm();
    }

    /** To load team portfolios details while editing */
    loadEditMode(teamId: number) {
        this.teamId = teamId;
        this.onTeamPortfolioLoad(teamId);
    }

    resetForm() {
        this.teamPortfolio = [];
    }

    // ngOnInit() {
    //     //this.onTeamPortfolioLoad();
    // }

    /** default method for on load */
    onTeamPortfolioLoad(teamId: number) {
        //this.teamPortfolio = this._teamService.getTeamPortfolios();
        this._teamService.getTeamPortfolios(teamId)
            .map((response: Response) => <ITeamPortfolio[]>response.json())
            //.do(data => console.log('team portfolios: ', JSON.stringify(data)))
            .subscribe(teamPortfolio => {
                //console.log('team portfolios data: ', teamPortfolio)
                this.teamPortfolio = teamPortfolio.filter(a => a.isDeleted == 0);
            });
    }

    /**Create column definitions for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Portfolio ID", field: "id", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Portfolio Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Source", field: "source", width: 125 },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 110, cellClass: 'text-center', cellRenderer: this.dateRenderer },
            <ColDef>{ headerName: "", field: "option", width: 110, cellRenderer: this.optionRenderer, cellClass: 'text-center' }
        ];
    }

    /*** renders options for row data */
    private optionRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.displayConfirm = true;
            this.selectedportfoliotoDelete = targetElement.id;
        }
    }

    /** method to display module updates on console */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /** * AutoComplete Search by Portfolio Name */
    portfolioSearch(event) {
        this._portfolioService.getPortfolioSearch(event.query)
            .map((response: Response) => <ITeamPortfolio[]>response.json())
            .subscribe(teamPortfolio => {
                this.FilteredProtfolioresults = teamPortfolio;
                this.teamPortfolio.forEach(element => {
                    this.FilteredProtfolioresults = this.FilteredProtfolioresults.filter(record => record.id != element.id);
                });
            });
    }

    /**Enable add button only after selection of portfolio from auto search */
    handleselectedPortfolio(portfolioitem) {
        if (portfolioitem.name) {
            this.btnDisablePortfolio = false;
        }
        else
            this.btnDisablePortfolio = true;
    }

    /** * Add selected Portfolio to grid*/
    addPortfolio(item) {
        if (item != undefined || item != "") {
            item.createdOn = new Date();
            this.teamPortfolio.push(item);
            this.gridOptions.api.setRowData(this.teamPortfolio);
            this.selectedPortfolio = undefined;
            this.btnDisablePortfolio = true;
        }

    }

    /** * function to pass record index value to delete and make dialog to close*/
    deleterPortfolio() {
        this.RemoveRecord(this.selectedportfoliotoDelete)
        this.displayConfirm = false;
    }

    /*** function removes the record from grid after confirming*/
    private RemoveRecord(indexval) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == indexval), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

}
