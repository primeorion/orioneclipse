import { Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { SessionHelper }       from './session.helper';
import { IRolePrivilege } from '../models/user.models';
import { ITabNav } from '../viewmodels/tabnav';

/**
 * Checks for presence of token and that token hasn't expired.
 * For use with the @CanActivate router decorator and NgIf
 */
export function tokenNotExpired(): boolean {
    let sessionHelper = new SessionHelper();

    return !sessionHelper.isTokenExpired();
}

/**
 * Returns the current route name from Router.url
 * @url is current url from router. ex: Router.url
 * @defaultRoute is optional parameter which current application default route name. ex: dashboard
 */
export function activeRoute(activatedRoute: ActivatedRoute): string {
    let routeName;
    activatedRoute.url.subscribe(route => {
        routeName = route.length > 0 ? route[0].path : undefined;
    });
    return routeName;
}

/**
 * Returns the given param value from URL querystring
 * @activatedRoute is instance of the ActivatedRoute
 * @param is optional parameter which is the name of the querystring parameters, default is 'id'
 */
export function getRouteParam<T>(activatedRoute: ActivatedRoute, param: string = 'id'): T {
    let value: T;
    activatedRoute.params.subscribe(params => {
        if (params[param] != undefined) value = <T>params[param];
    });
    return value;
}

/**
 * Converts the IRolePrivilege to ITabNav object and retuns its instance.
 * @permission is instance of IRolePrivilege object
 */
export function convertToTabNav(permission: IRolePrivilege): ITabNav {
    let tabNav = <ITabNav>{};
    if (permission == undefined) return tabNav;
    tabNav.canRead = permission.canRead;
    tabNav.canAdd = permission.canAdd;
    tabNav.canUpdate = permission.canUpdate;
    tabNav.canDelete = permission.canDelete;
    return tabNav;
}

/**
 * Get the IRolePrivilege object from session
 * @privilegeCode is string type of privilege code
 */
export function getPermission(privilegeCode: string = '') {
    let sessionHelper = new SessionHelper();
    if (!isNull(privilegeCode)) {
        return sessionHelper.getPermission(privilegeCode);
    }
    return <IRolePrivilege>{};
}

/**
 * Get the IRolePrivilege object from session
 * @privilegeCode is string type of privilege code
 */
export function getPrefsPermission() {
    let sessionHelper = new SessionHelper();
    let privileges = sessionHelper.getPrivileges(true, "PREF");
    return !isNull(privileges) ? privileges[0] : <IRolePrivilege>{};
}

export function isNull(value: any) {
    // console.log('typeof(value): ', typeof (value));
    // console.log('value == undefined: ', value == undefined);
    if (value == undefined) return true;
    if (typeof (value) == 'number')
        return value == 0;
    else if (typeof (value) == 'string')
        return value == null || value == '';
    else if (typeof (value) == 'object')
        return value == null;
    else if (typeof (value) == 'array')
        return value.length <= 0;
}

/** 
 * Sort the array of objects by given field name
 * @arrayList is array of objects type T
 * @fieldName is field of name type T
 */
export function sortBy<T>(arrayList: Array<T>, fieldName: string = 'name') {
    if (isNull(arrayList)) return arrayList;
    arrayList.sort((a, b) => {
        if (typeof (a[fieldName]) == 'number' && a[fieldName] > b[fieldName]) return 1;
        if (typeof (a[fieldName]) == 'string' && a[fieldName].trim() > b[fieldName].trim()) return 1;
        if (typeof (a[fieldName]) == 'number' && a[fieldName] < b[fieldName]) return -1;
        if (typeof (a[fieldName]) == 'string' && a[fieldName].trim() < b[fieldName].trim()) return -1;
        return 0;
    });
    return arrayList;
}

export function responseToObject<T>(_response: Observable<Response>) {
    return _response.map((response: Response) => <T>response.json());
}

export function responseToObjects<T>(_response: Observable<Response>) {
    return _response.map((response: Response) => <T[]>response.json());
}

/*** date formate MM/dd/yyyy */
export function dateRenderer(params) {
    if (params.value == "0000-00-00 00:00:00")
        return '';
    return new DatePipe().transform(params.value, 'MM/dd/yyyy');
}

/** convert Enum values to strings */
export function convertEnumValuesToString(obj) {
    Object.keys(obj).forEach(function (key) {
        if (isNaN(+key)) {
            Object.defineProperty(obj, key, {
                value: key,
                enumerable: true
            });
        }
    });
    return obj;
}


/** Convert the string/s to integer/s if any within Number array*/
export function toPrimitiveInt(selectedIds: number[]) {
    let result: number[] = [];
    for (var i = 0; i < selectedIds.length; i++) {
        result[i] = parseInt(selectedIds[i].toString());
    }
    return result;
}
/** Convert the string/s to integer/s if any within Number array return NULL if length is zero */
export function toPrimitiveIntNull(selectedIds: number[]) {
    let result: number[] = [];
    if (selectedIds.length > 0) {
        for (var i = 0; i < selectedIds.length; i++) {
            result[i] = parseInt(selectedIds[i].toString());
        }
    }
    else {
        result = null;
    }
    return result;
}
/** Compare and remove the duplicate records from objectArrays */
export function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
 }
