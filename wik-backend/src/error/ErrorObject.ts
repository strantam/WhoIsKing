export enum ErrorCode {
    DB_QUERY_ERROR = "DB_QUERY_ERROR",
    FIREBASE_AUTH_ERROR = "FIREBASE_AUTH_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED"
}

export enum HttpStatus {
    UNAUTHENTICATED = 401,
    UNAUTHORIZED = 403,
    INTERNAL_SERVER = 500
}

export class ErrorObject {
    public get ownErrorObject(): boolean {
        return true
    }

    constructor(public errorCode: ErrorCode, public message: string, public httpStatus?: number) {
    }
}