export interface IExceptionHandler {
    call(exception: any, stackTrace?: any, reason?: string): void;
}

export class CustomExceptionHandler implements IExceptionHandler {
    call(exception: any, stackTrace: any, reason: string): void {
        //alert(exception);
        console.log(exception);
    }
}
