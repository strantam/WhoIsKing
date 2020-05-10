// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import winston, {format, Logger, TransformableInfo} from "winston";
import * as path from "path";
import {AsyncHookHandler} from "./AsyncHookHandler";

const hookHandler = AsyncHookHandler.getAsyncHookHandler();

const addTransactionIdFormatter = format((info): TransformableInfo => {
    const transId = hookHandler.getTransactionId();
    if (transId) {
        info.transId = transId;
    }
    return info;
});


export function getLogger(fileNameWithPath: string): Logger {
    const fileName = fileNameWithPath.substr(fileNameWithPath.lastIndexOf(path.sep) + 1);
    return winston.createLogger({
        level: 'debug',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            addTransactionIdFormatter(),
        ),
        defaultMeta: {fileName: fileName},
        transports: [
            new winston.transports.Console({
                format: format.combine(format.colorize(), format.simple()),
            })
        ]
    });
}
