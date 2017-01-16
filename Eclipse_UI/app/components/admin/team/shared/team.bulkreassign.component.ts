import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import * as Util from '../../../../core/functions';
import { ITeam } from '../../../../models/team';
import { TeamService } from '../../../../services/team.service';

@Component({
    selector: 'eclipse-team-reassign',
    templateUrl: './app/components/admin/team/shared/team.bulkreassign.component.html',
})

export class TeamReassignComponent {
    selectedTeamData: ITeam;
    teamData: ITeam[] = [];
    teamId: number;
    selectedTeam: any;
    showErrorMessage: boolean = false;
    errorMessage: string = '';
    @Output() reassigned = new EventEmitter();
    teamValidation: boolean = false;
    constructor(private _teamService: TeamService) {
        this.selectedTeamData = <ITeam>{};
    }

    /*** loads current team details */
    loadReassignTeams(teamId: number) {
        this.teamValidation = false;
        this.hideError();
        this.selectedTeam = {};
        this.teamId = teamId;
        this._teamService.getTeamById(teamId).map((response: Response) => response.json())
            .do(data => console.log('Team details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.selectedTeamData = model;
                this.loadTeamsToDropDown(model.id);
            })
    }

    /**
     * Reassign team to new Team(s)
     */
    reassignToNewTeam() {
        this.hideError();
        if (this.selectedTeam == null || this.selectedTeam.id <= 0 || this.selectedTeam.id == undefined) {
            this.teamValidation = true;
            return;
        }
        this.teamValidation = false;
        let teamIds = { oldId: this.teamId, newId: this.selectedTeam.id };
        console.log("team ids", JSON.stringify(teamIds));
        this._teamService.reassignTeamToNewTeam(teamIds)
            .map((response: Response) => response.json())
            .do(data => console.log('Team details :' + JSON.stringify(data)))
            .subscribe(model => {
                this.reassigned.emit("Team reassigned");
            },
            error => {
                this.showErrorMessage = true;
                console.log('error: ' + JSON.stringify(error));
                this.errorMessage = JSON.parse(error._body).message;
            });
    }

    /**
     * load teams drop down with team name to reassign
     */
    private loadTeamsToDropDown(teamId: number) {
        Util.responseToObjects<ITeam>(this._teamService.getTeamData())
            .subscribe(model => {
                this.teamData = [];
                model.forEach(element => {
                    if (element.id != teamId && element.status == 1)
                        this.teamData.push(element);
                });
                this.teamData = Util.sortBy(this.teamData);
            });
    }

    /**
     * bind the selected team details from teams drop down
     */
    private dropDownChange(teamid) {
        this.teamValidation = false;
        this.selectedTeam = null;
        for (var i = 0; i < this.teamData.length; i++) {
            if (this.teamData[i].id == teamid) {
                this.selectedTeam = this.teamData[i];
                console.log('newly selected team data', this.selectedTeam);
            }
        }
    }

    /**To hide error message */
    private hideError() {
        this.showErrorMessage = false;
        this.errorMessage = '';
    }
}

