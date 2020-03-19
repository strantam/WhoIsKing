import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";


const logger = getLogger(module.filename);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const router = express.Router();

router.post('/city', async (req, res, next) => {
    const cityId = req.body.cityId;
    const userId = res.locals.userId;
    try {
        await DB.getDb().pool.query('UPDATE "User" SET "cityId" = $1 WHERE "uid"= $2', [cityId, userId]);
        res.json({});
    } catch (err) {
        logger.error("Cannot set city for user", JSON.stringify(err));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot set city for user", HttpStatus.INTERNAL_SERVER));
    }
});


export const authRouter = router;