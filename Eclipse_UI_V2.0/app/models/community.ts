/* Defines the Community Strategist entity */
export interface ICommunityStrategist {
    id: number,
    name: string,
    status: string,
    salesContact: string,
    salesPhone: string,
    legalAgreement: string,
    salesEmail: string,
    supportEmail: string,
    supportContact: string,
    supportPhone: string,
    strategyCommentary: string,
    advertisementMessage: string,
    createdDate: Date,
    editedDate: Date,
    createdBy: number,
    editedBy: number
}

/* Defines the Community model entity */
export interface ICommunityModel {
    id: number,
    name: string,
    status: string,
    targetRiskLower: string,
    targetRiskUpper: string,
    currentRisk: string,
    minimumAmount: number,
    strategistId: number,
    style: string,
    tickersWithTargetInPercentage: number,
    lowerUpperToleranceInPercentage: number,
    requireCash: number,
    advisorFee: number,
    weightedAvgNetExpense: number,
    isDeleted: string,
    createdDate: Date,
    createdBy: Date,
    editedDate: Date,
    editedBy: Date
}

/* Defines the Approved Community Strategist entity */
export interface IApprovedCommunityStrategist {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}

/* Defines the Approved Community Model entity */
export interface IApprovedCommunityModel {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}
