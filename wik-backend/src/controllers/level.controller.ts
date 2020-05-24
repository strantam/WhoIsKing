import {Level} from "../openApi/model/level";
import {getLevels} from "../util/dbQuery";
import {ErrorCode, ErrorObject, HttpStatus} from "../error/ErrorObject";
import {getLogger} from "../log/logger";
const logger = getLogger(module.filename);

export async function getAll (req, res, next) {
    try {
        const levels: Array<Level> = await getLevels();
        res.json(levels);
    } catch (err) {
        logger.error("Cannot get levels " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get levels", HttpStatus.INTERNAL_SERVER));
        }
    }
}
