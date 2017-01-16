

export interface IPricerange{
    from:string,
    to:string,
    maxPriceDate:string
}

export interface IModalSummary{
    moduleName:string,
    total:number,
    warning:number

}

export interface IAnalysisSummary{
    lastImportedDate:string,
    warnings:number,
    errors:number,
    latestAvailableImport:string,
    totalAUM:number,
    changeInAum:number,
    lastImportPorcessTime:number,
    priceRange:IPricerange,
    isAutoImport:boolean
}

export interface IDashboardSummary{
    importanalysis:IAnalysisSummary,
    warningsummary:IModalSummary
}