import { Component, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Response } from '@angular/http';
import { TeamService } from '../../../services/team.service';
import { BaseComponent } from '../../../core/base.component';
import {  ITeamAdvisor } from '../../../models/team';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';


@Component({
    selector: 'eclipse-admin-teamadvisor',
    templateUrl: './app/components/admin/team/teamadvisor.component.html',
    directives: [AgGridNg2, AutoComplete, Button, Dialog],
    providers: [TeamService]
})

export class TeamAdvisorComponent1 extends BaseComponent {

    public gridAdvisorOptions: GridOptions;
    private showAdvisorGrid: boolean;
    public teamAdvisors: ITeamAdvisor[] = [];
    public columnAdvisorDefs: ColDef[];

    autocompleteadvisorResults: ITeamAdvisor[] = [];
    selectedadvisor: any;
    FilteredAdvisorresults: any[] = [];
    errorMessage: string;
    private displayConfirm: boolean;
    private selectedadvisortoDelete: number;
    private teamId: number;
    btnDisableAdvisor: boolean = true;
    isViewAdvisor: boolean = false;

    /**
    * Contructor
    */
    constructor(private _router: Router, private _teamService: TeamService) {
        super();
        this.gridAdvisorOptions = <GridOptions>{};
        this.showAdvisorGrid = true;
        this.createColumnDefs();
        this.autocompleteadvisorResults = [];
        this.FilteredAdvisorresults = [''];
    }

    /** To load team advisors details on add */
    loadAddMode() {
        this.resetForm();
    }

    /** To load team advisors details on edit */
    loadEditMode(teamId: number) {
        this.teamId = teamId;
        this.onTeamAdvisorsLoad(this.teamId);
    }

    /** To rest form */
    resetForm() {
        this.teamAdvisors = [];
    }

    // ngOnInit() {
    //     this.onLoad();
    // }

    /** default method for on load */
    onTeamAdvisorsLoad(teamId: number) {
        this.errorMessage = '';
        //this.teamAdvisors = this._teamService.getTeamAdvisorData();
        this.ResponseToObjects<ITeamAdvisor>(this._teamService.getTeamAdvisors(this.teamId))
            .subscribe(model => {
                this.teamAdvisors = model.filter(a => a.isDeleted == 0);
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /**     
     * create column headers for agGrid
     */
    private createColumnDefs() {
        this.columnAdvisorDefs = [
            <ColDef>{ headerName: "Advisor ID", field: "id", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Advisor Name", field: "name", width: 125 },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 110, cellRenderer: this.dateRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "", field: "delete", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' },
        ];
    }

    /** function to render cross image in the options column of ag-grid*/
    private deleteCellRenderer(params) {
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
            this.selectedadvisortoDelete = targetElement.id;
        }
    }

    /**
     * method to display context menu on agGrid
     */
    private getContextMenuItems(params) {
        var result = [
            {
                name: 'View Details ',
            },
            {
                name: 'Edit',
            },
            'separator',
            {
                name: 'Delete',
                shortcut: 'Alt + W',
            }
        ];
        return result;
    }


    /**
     * function to pass record index value to delete and make dialog to close
     */
    deleterAdvisor() {
        this.RemoveRecord(this.selectedadvisortoDelete)
        this.displayConfirm = false;
    }

    /**
     * function removes the record from grid after confirming
     */
    private RemoveRecord(indexval) {
        // one index splice
        this.gridAdvisorOptions.rowData.splice(this.gridAdvisorOptions.rowData.findIndex(x => x.id == indexval), 1);
        // overwrite row data
        this.gridAdvisorOptions.api.setRowData(this.gridAdvisorOptions.rowData);
    }

    /* AutoComplete Search by AdvisorName */

    autoAdvisorSearch(event) {
        this.autocompleteadvisorResults = [];
        this._teamService.searchAdvisors(event.query)
            .map((response: Response) => <ITeamAdvisor[]>response.json())
            .subscribe(advisorSearch => {
                this.FilteredAdvisorresults = advisorSearch;
                this.teamAdvisors.forEach(element => {
                    this.FilteredAdvisorresults = this.FilteredAdvisorresults.filter(record => record.id != element.id);
                });
            });


    }

    /* * To filter Advisors by Advisor Name */
    filterAdvisors(query, advisorlist: any[]): any[] {
        let filtered: any[] = [];
        for (let i = 0; i < advisorlist.length; i++) {
            let advisor = advisorlist[i];
            if (advisor.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(advisor);
            }
        }
        return filtered;
    }

    /**Add Advisor */
    addAdvisor(item) {
        if (item != undefined || item != "") {

            item.createdOn = new Date();
            this.teamAdvisors.push(item);
            this.gridAdvisorOptions.api.setRowData(this.teamAdvisors);
            this.selectedadvisor = undefined;
            this.btnDisableAdvisor = true;
        }
    }

    /**Enable add button only after selection of Advisor from auto search */
    handleselectedAdvisor(advisoritem) {
        if (advisoritem.name) {
            this.btnDisableAdvisor = false;
        }
        else
            this.btnDisableAdvisor = true;
    }

}
