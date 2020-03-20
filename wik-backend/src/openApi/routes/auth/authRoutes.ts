import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {Question, User} from "../../../db/DatabaseMapping";
import admin from "firebase-admin";
import * as uuid from 'uuid';


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

        const currentUser: User = (await DB.getDb().pool.query('DELETE FROM "User" WHERE "uid"=$1 RETURNING *', [res.locals.userId])).rows[0];
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

router.post('/game/:gameId', async (req, res, next) => {
    const gameId = req.params.gameId;
    const answer = req.body.answer;
    try {
        const question: Question = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "uid" = $1 AND "openTime" < $2', [gameId, new Date()])).rows[0];
        if (!question) {
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Question not opened currently", HttpStatus.INTERNAL_SERVER);
        }

        let points: number = 0;
        switch (question.questionType) {
            case "ESTIMATION":
                const answerNum = parseFloat(answer);
                const goodAnswerNum = parseFloat(question.response);
                console.log(answerNum, goodAnswerNum, ((Math.abs(goodAnswerNum) - Math.abs(answerNum - goodAnswerNum)) / Math.abs(goodAnswerNum)));
                points = Math.round(((Math.abs(goodAnswerNum) - Math.abs(answerNum - goodAnswerNum)) / Math.abs(goodAnswerNum)) * question.points * 100) / 100;
                break;
            case "MULTIPLE_CHOICE":
                if (question.response === answer) {
                    points = question.points;
                }
                break;
            default:
                throw new ErrorObject(ErrorCode.UNKNOWN_QUESTION_TYPE, "Question type not known", HttpStatus.INTERNAL_SERVER);
        }
        const user: User = (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [res.locals.userId])).rows[0];
        await DB.getDb().pool.query('INSERT INTO "Solution" ("uid", "answer", "points", "userId", "questionId", "cityId") VALUES ($1, $2, $3, $4, $5, $6)', [uuid.v4(), answer, points, res.locals.userId, gameId, user.cityId]);

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