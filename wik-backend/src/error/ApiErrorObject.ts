export enum ErrorCode {
    DB_QUERY_ERROR = "DB_QUERY_ERROR",
    FIREBASE_AUTH_ERROR = "FIREBASE_AUTH_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    UNAUTHENTICATED = "UNAUTHENTICATED",
    NO_OPEN_QUESTION = "NO_OPEN_QUESTION",
    UNKNOWN_QUESTION_TYPE = "UNKNOWN_QUESTION_TYPE",
    NO_CITY = "NO_CITY",
    NO_VOTES = "NO_VOTES",
    NO_QUESTIONS = "NO_QUESTIONS",
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    BAD_REQUEST = 'BAD_REQUEST'
}

export enum HttpStatus {
    BAD_REQUEST = 400,
    UNAUTHENTICATED = 401,
    UNAUTHORIZED = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
}

const errorCodeToStatus: Map<ErrorCode, HttpStatus> = new Map([
    [ErrorCode.NO_CITY, HttpStatus.NOT_FOUND],
    [ErrorCode.NO_VOTES, HttpStatus.NOT_FOUND],
    [ErrorCode.NO_QUESTIONS, HttpStatus.NOT_FOUND],
    [ErrorCode.NO_OPEN_QUESTION, HttpStatus.NOT_FOUND],
    [ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER],
    [ErrorCode.DB_QUERY_ERROR, HttpStatus.INTERNAL_SERVER],
    [ErrorCode.UNKNOWN_QUESTION_TYPE, HttpStatus.BAD_REQUEST],
    [ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST],
    [ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED],
    [ErrorCode.FIREBASE_AUTH_ERROR, HttpStatus.UNAUTHORIZED],
    [ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHENTICATED]
]);

export class ApiErrorObject {
    public get ownErrorObject(): boolean {
        return true
    }

    constructor(public errorCode: ErrorCode, public message: string, public httpStatus: HttpStatus = errorCodeToStatus.get(errorCode)) {
    }
}
