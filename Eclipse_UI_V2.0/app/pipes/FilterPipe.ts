import { Component,Pipe,Injectable,PipeTransform}  from '@angular/core';

@Pipe({
    name: 'itemfilter'
})
@Injectable()
export class FilterPipe implements PipeTransform {
    transform(items: any[], field : string, value : string): any[] {          
        if (!items) return [];           
        let rt =      items.filter(it => it[field] == value);
        return items.filter(it => it[field] == value).sort((a, b) => a.displayOrder - b.displayOrder);
    }
}


@Pipe({
    name: 'itemSort'
})
@Injectable()
export class SortPipe implements PipeTransform {
    transform(items: any[]): any[] {          
        if (!items) return [];
        return items.sort((a, b) => a.order - b.order);
    }
}

@Pipe({name: 'orderBy'})
@Injectable()
export class OrderBy implements PipeTransform {
    transform(obj: any, orderField: string): any {
            var orderType = 'ASC';

           /* if (orderField[0] === '-') {
                orderField = orderField.substring(1);
                orderType = 'DESC';
            }*/

            obj.sort(function(a, b) {
                if (orderType === 'ASC') {
                    if (a[orderField] < b[orderField]) return -1;
                    if (a[orderField] > b[orderField]) return 1;
                    return 0;
                } else {
                    if (a[orderField] < b[orderField]) return 1;
                    if (a[orderField] > b[orderField]) return -1;
                    return 0;
                }
             });
        return obj;
    }
}

const PADDING = "000000";
const CURRENCY = "$";

@Pipe({
    name: 'currencyMillionfilter'
})
@Injectable()
export class CurrencyMillionPipe implements PipeTransform {
    private DECIMAL_SEPARATOR: string;
    private THOUSANDS_SEPARATOR: string;

    constructor() {
        // TODO comes from configuration settings
        this.DECIMAL_SEPARATOR = ".";
        this.THOUSANDS_SEPARATOR = ",";
    }

    transform(value : number, fractionSize: number = 2): string { 
        var result : number = value;
        var amount : string = "";

        var sign = "";
        if(result < 0) {
            sign = "-";
            result *= -1;
        }
        var amount : string = "";
        if(result >= 1000){
            amount = "THOU"
            if (result >= 1000000){
                result = result/1000000;
                if(result >= 1000){
                    result = result/1000;
                    amount = "BILL";
                }
                else{
                    amount = "MILL";
                }
            }
        }
        
        if(result || result == 0)
            result = +(result.toFixed(fractionSize));

        if(amount == "THOU"){
            if(result >= 1000000)
                result = result/1000000;
        }
        else if(amount == "MILL"){
            if(result >= 1000){
                result = result/1000;
            }
        }

         let [ integer, fraction = "" ] = (result || "0").toString()
        .split(this.DECIMAL_SEPARATOR);

        fraction = fractionSize > 0 
        ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize) 
        : "";

        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);

        return sign + CURRENCY + integer + fraction; //+ ' ' + amount;
    }
}

@Pipe({
    name: 'currencyAmountfilter'
})
@Injectable()
export class CurrencyAmountPipe implements PipeTransform {

    transform(value : number): string {   
        var result : number = value;      
        if(result < 0) result *= -1; 
        var amount : string = "";

        if(result >= 1000){
            amount = "THOU"
            if (result >= 1000000){
                result = result/1000000;
                if(result >= 1000){
                    result = result/1000;
                    amount = "Bill";
                }
                else{
                    amount = "Mill";
                }
            }
        }

        
        
        if(result || result == 0)
            result = +(result.toFixed(2));
        if(amount == "THOU"){
            if(result >= 1000000){
                amount = "Mill";
                result = result/1000000;
            }
        }
        else if(amount == "Mill"){
            if(result >= 1000){
                result = result/1000;
                amount = "Bill";
            }
        }

        if(amount == "THOU")
            amount = "";

        return amount;
    }
}