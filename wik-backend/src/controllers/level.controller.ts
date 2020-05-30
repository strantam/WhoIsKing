import {Level} from "../openApi/model/level";
import {getLevels} from "../util/dbQuery";
import {ErrorCode, ApiErrorObject, HttpStatus} from "../error/ApiErrorObject";
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
            next(new ApiErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get levels", HttpStatus.INTERNAL_SERVER));
        }
    }
}
