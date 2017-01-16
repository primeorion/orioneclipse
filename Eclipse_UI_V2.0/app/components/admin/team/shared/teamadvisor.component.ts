import { Component, HostListener} from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
// import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
// import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../../core/functions';
import { ITeamAdvisor } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';

@Component({
    selector: 'eclipse-admin-teamadvisors',
    templateUrl: './app/components/admin/team/shared/teamadvisor.component.html',
    //directives: [AgGridNg2, AutoComplete, Dialog],
    providers: [TeamService]
})

export class TeamAdvisorsComponent {
    public gridOptions: GridOptions;
    public columnDefs: ColDef[];
    public teamAdvisors: ITeamAdvisor[] = [];
    advisorSuggestions: any[] = [];
    selectedAdvisor: any;
    private displayConfirm: boolean;
    private selectedAdvisorId: number;
    disableButton: boolean = true;
    action: string = VIEWA;
    //subscription:any;

    /** Contructor */
    constructor(private _teamService: TeamService) {
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        console.log('constructor action: ', this.action);
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    //     console.log("advisor destroyed");
    // }

    /** Team advisors initialize method */
    initTeamAdvisors(action: string = VIEWA, teamId: number = 0) {
        this.action = action;
        if (teamId > 0) {
            // reset the column defs based on action (view, add and edit)
            if (this.action == VIEWV) this.createColumnDefs(true);
            this.loadTeamAdvisors(teamId);
        }
    }

    /** Get team advisors */
    loadTeamAdvisors(teamId: number) {
        Util.responseToObjects<ITeamAdvisor>(this._teamService.getTeamAdvisors(teamId))
            .subscribe(models => {
                 console.log("advisor: ", models);
                this.teamAdvisors = models.filter(a => a.isDeleted == 0);
                this.gridOptions.api.sizeColumnsToFit();  
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** Create column headers for ag-grid */
    private createColumnDefs(resetGrid: boolean = false) {
        this.columnDefs = [
            <ColDef>{ headerName: "Advisor ID", field: "id", width: 125, cellClass: 'text-center', filter:'number' },
            <ColDef>{ headerName: "Advisor Name", field: "name", width: 125, filter:'text' },
          <ColDef>{ headerName: "Added On", field: "createdOn", width: 110, cellRenderer: Util.dateRenderer, cellClass: 'text-center', filter:'text' }
        ];
        if (this.action != VIEWV)
            this.columnDefs.push(<ColDef>{ headerName: "", field: "isDeleted", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ', suppressMenu: true });
        if (resetGrid)
            this.gridOptions.api.setColumnDefs(this.columnDefs);
    }

    /** function to render cross image in the options column of ag-grid */
    private deleteCellRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result + '</span>';
    }

    /** Display context menu on ag-grid */
    private getContextMenuItems(params) {
        var result = [
            { name: 'View Details' },
            { name: 'Edit' },
            'separator',
            { name: 'Delete', shortcut: 'Alt + W' }
        ];
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.selectedAdvisorId = +targetElement.id;
            this.displayConfirm = true;
        }
    }

    /** Delete advisor and close dialog */
    deleterAdvisor() {
        this.RemoveRecord(this.selectedAdvisorId)
        this.displayConfirm = false;
    }

    /** Removes the record from grid after confirming */
    private RemoveRecord(advisorId) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == advisorId), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /* AutoComplete Search by AdvisorName */
    autoAdvisorSearch(event) {
        Util.responseToObjects<ITeamAdvisor>(this._teamService.searchAdvisors(event.query))
            .subscribe(models => {
                let teamAdvisorIds = this.teamAdvisors.map(m => m.id);
                this.advisorSuggestions = models.filter(m => teamAdvisorIds.indexOf(m.id) < 0);;
                // this.teamAdvisors.forEach(element => {
                //     this.advisorSuggestions = this.advisorSuggestions.filter(record => record.id != element.id);
                // });
            });
    }

    /** Enable add button only after selection of Advisor from auto search */
    selectAdvisor(item) {
        this.disableButton = (typeof (item) == 'string');
    }

    /** Add Advisor */
    addAdvisor(item) {
        if (item != undefined) {
            item.createdOn = new Date();
            this.teamAdvisors.push(item);
            this.gridOptions.api.setRowData(this.teamAdvisors);
            this.selectedAdvisor = undefined;
            this.disableButton = true;
        }
    }

}
