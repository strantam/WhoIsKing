import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {Answer, Question, User} from "../../../db/DatabaseMapping";
import admin from "firebase-admin";
import * as uuid from 'uuid';
import {User as ApiUser} from "../../../openApi/model/user"


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

router.delete('/user/me', async (req, res, next) => {
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const currentUser: User = (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [res.locals.userId])).rows[0];
        await DB.getDb().pool.query('UPDATE "User" SET "fireBaseId" = \'\', "cityId"= NULL, "nickName" = NULL WHERE "uid"=$1', [res.locals.userId])
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
});

router.get('/user/me', async (req, res, next) => {
    try {
        const currentUserCityName: ApiUser = (await DB.getDb().pool.query(
            'SELECT C."name" as cityName, U."nickName", U."votes", U."questions" ' +
            'FROM "User" as U ' +
            'LEFT JOIN "City" as C ' +
            'ON C."uid"= U."cityId" ' +
            'WHERE U."uid"=$1', [res.locals.userId])).rows[0];
        res.json(currentUserCityName);
    } catch (err) {
        logger.error("Error getting user with id: " + res.locals.userId + " " + JSON.stringify(err.message));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get user/me", HttpStatus.INTERNAL_SERVER));
    }

});

router.post('/game/:gameId/solution', async (req, res, next) => {
    const gameId = req.params.gameId;
    const answerId = req.body.answer;
    try {
        const question: Question = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "uid" = $1 AND "openTime" < $2 AND "changeToGuessTime" > $2', [gameId, new Date()])).rows[0];
        if (!question) {
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Solution not opened currently", HttpStatus.INTERNAL_SERVER);
        }
        const user: User = (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [res.locals.userId])).rows[0];
        const dbClient = await DB.getDb().pool.connect();
        try {
            await dbClient.query('BEGIN');
            await dbClient.query('INSERT INTO "Solution" ("uid", "cityId", "answerId", "userId", "createdAt", "questionId") VALUES ($1, $2, $3, $4, $5, $6)', [uuid.v4(), user.cityId, answerId, res.locals.userId, new Date(), gameId]);
            await dbClient.query('UPDATE "Answer" SET "votes" = "votes" + 1 WHERE "uid"= $1', [answerId]);
            await dbClient.query('COMMIT');
        } catch (err) {
            logger.error("Error on adding vote" + JSON.stringify(err.message));
            await dbClient.query('ROLLBACK');
            throw new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error on adding vote", HttpStatus.INTERNAL_SERVER);
        } finally {
            dbClient.release();
        }
        res.json({});
    } catch (err) {
        logger.error("Error posting answer: " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error posting answer.", HttpStatus.INTERNAL_SERVER));
        }
    }
});

router.post('/game/:gameId/guess', async (req, res, next) => {
    const gameId = req.params.gameId;
    const answerId = req.body.answer;
    try {
        const question: Question = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "uid" = $1 AND "changeToGuessTime" < $2 AND "closeTime" > $2', [gameId, new Date()])).rows[0];
        if (!question) {
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Guess not opened currently", HttpStatus.INTERNAL_SERVER);
        }
        const user: User = (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [res.locals.userId])).rows[0];
        const answers: Array<Answer> = (await DB.getDb().pool.query('SELECT * FROM "Answer" WHERE "questionId"=$1', [gameId])).rows;
        const allVotes = answers.reduce<number>((previousValue, currentValue) => {
            // @ts-ignore
            return previousValue + parseInt(currentValue.votes)
        }, 0);
        const userAnswer = answers.find(answer => answer.uid === answerId);
        console.log(userAnswer, allVotes);
        const points = Math.round(userAnswer.votes / allVotes * 10000) / 100;
        await DB.getDb().pool.query('INSERT INTO "Guess" ("uid", "cityId", "answerId", "userId", "createdAt", "questionId", "points") VALUES ($1, $2, $3, $4, $5, $6, $7)', [uuid.v4(), user.cityId, answerId, res.locals.userId, new Date(), gameId, points]);
        res.json({points: points});
    } catch (err) {
        logger.error("Error posting answer: " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error posting answer.", HttpStatus.INTERNAL_SERVER));
        }
    }
});

export const authRouter = router;