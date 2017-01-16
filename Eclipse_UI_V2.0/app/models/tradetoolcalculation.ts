/**Defines spend cash calculation methods */
export interface ITradeToolCalculationMethods {
    methods: ICalculationMethod[],
    selectedMethodId: number
}

/**Defines spend cash methods */
export interface ICalculationMethod {
    id: number,
    name: string
}