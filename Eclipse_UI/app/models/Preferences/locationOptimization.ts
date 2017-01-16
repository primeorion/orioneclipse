
export interface ILocationOptimization {
    id: number;
    name: string;
    buySetting: ILocationSettings;
    sellSetting: ILocationSettings;
}

export interface ILocationSettings {
    T: number;
    TD: number;
    TE: number;
}

/** Location Otimization Custom component properties */
export interface ILocationOptimizationCustom {
    level: string,
    recordId: number,
    id: number,
    preferenceId: number,
    categoryType: string,
    name: string,
    displayName: string,
    required: boolean,
    subClasses: any[],
    isInherited: boolean,
    inheritedValue: any,
    inheritedFrom: string,
    inheritedFromName: string,
    inheritedFromId: number,
    inheritedSubClasses: any[],
    componentType: string,
    componentName: string,
    helpText: string,
    watermarkText: string,
    symbol: string
}

/** Location Optimization Custom component properties */
export interface ILocationOptimizationCustomCompare {
    level: string,
    recordId: number,
    id: number,
    preferenceId: number,
    componentType: string,
    componentName: string,
    subClasses: any,
    inheritedSubClasses: any
}


/** Location Optimization Custom component properties */
export interface ILocationOptimizationSave {  
    id: number,
    preferenceId: number,
    subClasses: any[]
}
