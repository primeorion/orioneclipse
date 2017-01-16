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