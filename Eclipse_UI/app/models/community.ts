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
    supportContact:string,
    supportPhone: string,
    strategyCommentary: string,
    advertisementMessage: string,
    createdDate: Date,
    editedDate: Date,
    createdBy: number,
    editedBy: number
}


export interface ICommunityModel
{
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


