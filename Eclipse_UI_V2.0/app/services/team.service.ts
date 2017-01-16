import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { ITeam } from '../models/team';

@Injectable()
export class TeamService {
    private _teamEndPoint = 'admin/teams';
    private _advisorPoint = 'admin/Advisors';

    constructor(private _httpClient: HttpClient) { }

    /** Get team counts summary */
    getTeamSummary() {
        return this._httpClient.getData(this._teamEndPoint + "/summary");
    }

    /** Get teams */
    getTeamData() {
        return this._httpClient.getData(this._teamEndPoint)
    }

    /** Get team details by id */
    getTeamById(teamId: number) {
        return this._httpClient.getData(this._teamEndPoint + "/" + teamId);
    }

    /** Reassigns old Team to new Team */
    reassignTeamToNewTeam(teamIds: any) {
        return this._httpClient.postData(this._teamEndPoint + '/Action/ReassignTeam', teamIds);
    }

    /** Create team */
    createTeam(team: ITeam) {
        return this._httpClient.postData(this._teamEndPoint, team);
    }

    /** Update team */
    updateTeam(team: ITeam) {
        return this._httpClient.updateData(this._teamEndPoint + "/" + team.id, team);
    }

    /** Delete team */
    deleteTeam(teamId: number) {
        return this._httpClient.deleteData(this._teamEndPoint + "/" + teamId);
    }

    /** Get team users data */
    getTeamUsers(teamId: number) {
        return this._httpClient.getData(this._teamEndPoint + '/' + teamId + '/users');
    }

    /** Get team portfolio data */
    getTeamPortfolios(teamId: number) {
        return this._httpClient.getData(this._teamEndPoint + '/' + teamId + '/portfolios');
    }

    /** Get team advisor static data */
    getTeamAdvisors(teamId: number) {
        return this._httpClient.getData(this._teamEndPoint + '/' + teamId + '/advisors');
    }

    /** Get team model static data */
    getTeamModels(teamId: number) {
        return this._httpClient.getData(this._teamEndPoint + '/' + teamId + '/models');
    }

    searchAdvisors(searString: string) {
        return this._httpClient.getData(this._advisorPoint + '?search=' + searString);
    }

    /** To get teams by team name */
    searchTeams(searchString: string) {
        return this._httpClient.getData(this._teamEndPoint + '?search=' + searchString);
    }

    saveTeamUsers(teamId: number, userIds: any) {
        return this._httpClient.postData(this._teamEndPoint + "/" + teamId + "/Users", (userIds));
    }

    saveTeamPortfolios(teamId: number, portfolioIds: any) {
        return this._httpClient.postData(this._teamEndPoint + "/" + teamId + "/Portfolios", (portfolioIds));
    }

    saveTeamAdvisors(teamId: number, AdvisorIds: any) {
        return this._httpClient.postData(this._teamEndPoint + "/" + teamId + "/Advisors", (AdvisorIds));
    }

    saveTeamModels(teamId: number, ModelIds: any) {
        return this._httpClient.postData(this._teamEndPoint + "/" + teamId + "/Models", (ModelIds));
    }

    /** Update team users */
    updateTeamUsers(teamId: number, userIds: any) {
        return this._httpClient.updateData(this._teamEndPoint + "/" + teamId + "/Users", userIds);
    }

    /** Update team portfolios */
    updateTeamPortfolios(teamId: number, portfolioIds: any) {
        return this._httpClient.updateData(this._teamEndPoint + "/" + teamId + "/Portfolios", portfolioIds);
    }

    /** Update team advisors */
    updateTeamAdvisors(teamId: number, AdvisorIds: any) {
        return this._httpClient.updateData(this._teamEndPoint + "/" + teamId + "/Advisors", AdvisorIds);
    }

    /** Update team models */
    updateTeamModels(teamId: number, ModelIds: any) {
        return this._httpClient.updateData(this._teamEndPoint + "/" + teamId + "/Models", ModelIds);
    }

    /** Get static role types */
    getTeamStatus() {
        return [
            { typeId: 1, typeName: "Active" },
            { typeId: 0, typeName: "In Active" }
        ];
    }

    /** To get Portfolios by team id(check for primary team) */
    getPortfoliosByTeamId(teamId:number){
          return this._httpClient.getData(this._teamEndPoint + '/' + teamId + '/primaryPortfolios');
    }


}
