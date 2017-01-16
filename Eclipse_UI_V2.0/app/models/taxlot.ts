export interface ITaxlot {
    id: number,
    accountId: number,
    accountNumber: string,
    accountType : string,
    quantity: number,
    price: number,
    marketvalue: number,
    priceDate: Date,
    isDeleted: number
}