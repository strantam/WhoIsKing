import {DB} from "../db";
import {ErrorCode, ErrorObject, HttpStatus} from "../error/ErrorObject";
import {getLogger} from "../log/logger";
import {Level, User} from "../db/DatabaseMapping";
import admin from "firebase-admin";
import {getLevels, getUserPoints} from "../util/dbQuery";
import {User as ApiUser} from "../openApi/model/user";
const logger = getLogger(module.filename);


export async function setCity(req, res, next) {
    const cityId = req.body.cityId;
    const userId = res.locals.userId;
    try {
        // TODO modify this if there are more other type of perks to a generic solution
        await DB.getDb().pool.query('UPDATE "User" SET "cityId" = $1 WHERE "uid"= $2 AND "highestLevel" > 1', [cityId, userId]);
        res.json({});
    } catch (err) {
        logger.error("Cannot set city for user", JSON.stringify(err));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot set city for user", HttpStatus.INTERNAL_SERVER));
    }
}


export async function remove(req, res, next) {
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const currentUser: User = (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [res.locals.userId])).rows[0];
        await DB.getDb().pool.query('UPDATE "User" SET "fireBaseId" = \'\', "cityId"= NULL, "nickName" = NULL WHERE "uid"=$1', [res.locals.userId]);
        await admin.auth().deleteUser(currentUser.fireBaseId);
        await dbClient.query('COMMIT');
        res.json({});
    } catch (err) {
        await dbClient.query('ROLLBACK');

        logger.error("Error deleting user with id: " + res.locals.userId + " " + JSON.stringify(err.message));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot delete user/me", HttpStatus.INTERNAL_SERVER));
    } finally {
        dbClient.release()
    }
}

export async function getCurrentUser(req, res, next) {
    try {
        const currentUserCityName: { cityName, nickName, votes, questions, highestLevel } = (await DB.getDb().pool.query(
            'SELECT C."name" as "cityName", U."nickName", U."votes", U."questions", U."highestLevel", U."uid" ' +
            'FROM "User" as U ' +
            'LEFT JOIN "City" as C ' +
            'ON C."uid"= U."cityId" ' +
            'WHERE U."uid"=$1', [res.locals.userId])).rows[0];
        const userPoints = await getUserPoints(res.locals.userId);
        const levels = await getLevels();
        let userLevel: Level;
        if (userPoints >= levels[levels.length - 1].points) {
            userLevel = levels[levels.length - 1]
        } else {
            userLevel = levels[levels.findIndex(level => level.points > userPoints) - 1];
        }

        const resultUser: ApiUser = {...currentUserCityName, points: userPoints, currentLevel: userLevel.index};
        res.json(resultUser);
    } catch (err) {
        logger.error("Error getting user with id: " + res.locals.userId + " " + JSON.stringify(err.message));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get user/me", HttpStatus.INTERNAL_SERVER));
    }
}
