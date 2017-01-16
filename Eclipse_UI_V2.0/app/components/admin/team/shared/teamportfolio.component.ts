import { Component, HostListener} from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
// import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
// import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../../core/functions';
import { ITeamPortfolio } from  '../../../../models/team';
import { TeamService } from '../../../../services/team.service';
import { PortfolioService } from '../../../../services/portfolio.service';

@Component({
    selector: 'eclipse-admin-teamportfolios',
    templateUrl: './app/components/admin/team/shared/teamportfolio.component.html',
    //directives: [AgGridNg2, AutoComplete, Dialog] 
        
})

export class TeamPortfoliosComponent {
    public gridOptions: GridOptions;
    public columnDefs: ColDef[];
    public teamPortfolios: ITeamPortfolio[] = [];
    portfolioSuggestions: ITeamPortfolio[] = [];
    selectedPortfolio: any;
    private selectedPortfolioId: number;
    private displayConfirm: boolean;
    disableButton: boolean = true;
    action: string = VIEWA;
    //subscription: any;

    constructor(private _teamService: TeamService, private _portfolioService: PortfolioService) {
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        console.log('constructor action: ', this.action);
        
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    //     console.log("portfolio destroyed");
    // }

    /** To load team portfolios details while editing */
    initTeamPortfolios(action: string = VIEWA, teamId: number = 0) {
        this.action = action;
        console.log("portfolio Actions", this.action);
        if (teamId > 0) {
            // reset the column defs based on action (view, add and edit)
            if (this.action == VIEWV) this.createColumnDefs(true);
            this.loadTeamPortfolios(teamId);              
        }
    }

    /** default method for on load */
    loadTeamPortfolios(teamId: number) {
        Util.responseToObjects<ITeamPortfolio>(this._teamService.getTeamPortfolios(teamId))
            .subscribe(models => {
                console.log("portfolios: ", models);
                this.teamPortfolios = models.filter(a => a.isDeleted == 0);
                this.gridOptions.api.sizeColumnsToFit();                
            });
    }

    /** Create column definitions for agGrid */
    private createColumnDefs(resetGrid: boolean = false) {
        this.columnDefs = [
            <ColDef>{ headerName: "Portfolio ID", field: "id", width: 125, cellClass: 'text-center',filter:'number' },
            <ColDef>{ headerName: "Portfolio Name", field: "name", width: 125, filter:'text' },
            <ColDef>{ headerName: "Source", field: "source", width: 125, filter:'text' },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 110, cellClass: 'text-center', cellRenderer: Util.dateRenderer, filter:'text' }
        ];
        if (this.action != VIEWV)
            this.columnDefs.push(<ColDef>{ headerName: "", field: "isDeleted", width: 110, cellRenderer: this.optionRenderer, cellClass: 'text-center', suppressMenu: true });
        console.log('columnDefs of portfolio: ', this.columnDefs);
        if (resetGrid)
            this.gridOptions.api.setColumnDefs(this.columnDefs);
    }

    /** renders options for row data */
    private optionRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result + '</span>';
    }

    /** method to display module updates on console */
    private onModelUpdated() {
        console.log('onModelUpdated');
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.selectedPortfolioId = +targetElement.id;
            this.displayConfirm = true;
        }
    }

    /** Delete and make dialog to close*/
    deletePortfolio() {
        this.RemoveRecord(this.selectedPortfolioId)
        this.displayConfirm = false;
    }

    /** Removes the record from grid after confirming */
    private RemoveRecord(portfolioId) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == portfolioId), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /** AutoComplete Search by Portfolio Name */
    portfolioSearch(event) {
        Util.responseToObjects<ITeamPortfolio>(this._portfolioService.getPortfolioSearch(event.query))
            .subscribe(models => {
                let teamPortfolioIds = this.teamPortfolios.map(m => m.id);
                this.portfolioSuggestions = models.filter(m => teamPortfolioIds.indexOf(m.id) < 0);
                // this.teamPortfolios.forEach(element => {
                //     this.portfolioSuggestions = this.portfolioSuggestions.filter(record => record.id != element.id);
                // });
            });
    }

    /** Enable add button only after selection of portfolio from auto search */
    selectPortfolio(item) {
        this.disableButton = (typeof (item) == 'string');
    }

    /** Add selected Portfolio to grid*/
    addPortfolio(item) {
        if (item != undefined) {
            item.createdOn = new Date();
            this.teamPortfolios.push(item);
            this.gridOptions.api.setRowData(this.teamPortfolios);
            this.selectedPortfolio = undefined;
            this.disableButton = true;
        }
    }

}
