
/* Defines the team entity */
export interface ITeam {
    id: number,
    name: string;
    createdOn: Date,
    numberOfUsers: number,
    numberOfPortfolios: number,
    numberOfAdvisors: number,
    numberOfModels: number,
    status: number,
    isDeleted: boolean,
    userId: any[],
    advisorId: any[],
    modelId: any[],
    portfolioId: any[],
    portfolioAccess: number,
    modelAccess: number
}


/* Defines the team users entity */
export interface ITeamUser {
    userId: number,
    id: number,
    teamId: number,
    name: string,
    firstName: string,
    lastName: string,
    createdOn: Date,
    isDeleted: number
}

/* Defines the team portfolios entity */
export interface ITeamPortfolio {
    portfolioId: number,
    id: number,
    name: string,
    teamId: number,
    source: string,
    createdOn: Date,
    isDeleted: number
}

/* Defines the team advisor entity */
export interface ITeamAdvisor {
    advisorId: number,
    id: number,
    name: string,
    teamId: number,
    createdOn: Date,
    isDeleted: number
}

/* Defines the team model entity */
export interface ITeamModel {
    modelId: number,
    id: number,
    teamId: number,
    name: string,
    source: string,
    status: number,
    createdOn: Date,
    isDeleted: number
}

/*Defines Portfolio entity for primary team */
export interface IPortfolioPrimary {
    id: number,
    name: string,  
    createdOn: Date,
    editedOn: Date,
    createdBy: number,  
    editedBy: number
}