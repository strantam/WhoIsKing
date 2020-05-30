import {getUserFromToken} from "../util/auth";
import {ErrorCode, ApiErrorObject, HttpStatus} from "../error/ApiErrorObject";
import {DB} from "../db";
import {getLogger} from "../log/logger";

const logger = getLogger(module.filename);

export default async (req, res, next) => {
    try {
        let firebaseUser;
        try {
            firebaseUser = await getUserFromToken(req.headers.authorization as string);
        } catch (err) {
            logger.error("Auth token not valid" + JSON.stringify(err));
            next(new ApiErrorObject(ErrorCode.FIREBASE_AUTH_ERROR, "Auth token not valid", HttpStatus.UNAUTHENTICATED));

        }
        logger.info(firebaseUser.uid);
        let user = await DB.getDb().pool.query('SELECT * FROM "User" WHERE "fireBaseId"=$1', [firebaseUser.uid]);
        if (user.rows && user.rows.length === 0) {
            user = await DB.getDb().pool.query('INSERT INTO "User" ("uid", "fireBaseId", "createdAt", "highestLevel", "nickName", "votes", "questions") VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING *', [uuid.v4(), firebaseUser.uid, new Date(), 1, "user" + new Date().toISOString()]);
        }
        if (!user || !user.rows || user.rows.length !== 1) {
            next(new ApiErrorObject(ErrorCode.DB_QUERY_ERROR, "DB user id cannot be resolved", HttpStatus.INTERNAL_SERVER));
        }
        res.locals.userId = user.rows[0].uid;
        next();
    } catch (err) {
        logger.error("Error on authentication " + JSON.stringify(err));
        next(err);
    }
}
