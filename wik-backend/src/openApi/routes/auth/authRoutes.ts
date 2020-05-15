import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {Answer, Level, Question, User} from "../../../db/DatabaseMapping";
import admin from "firebase-admin";
import * as uuid from 'uuid';
import {User as ApiUser} from "../../../openApi/model/user"
import {Game} from "../../model/game";
import {getLevels, getUser, getUserPoints} from "../../../util/dbQuery";
import * as express from 'express';

const logger = getLogger(module.filename);
const router = express.Router();


async function userLevelChange(userId: string): Promise<void> {
    let levels: Array<Level>;
    let userPoints: number;
    let user: User;
    [levels, userPoints, user] = await Promise.all([getLevels(), getUserPoints(userId), getUser(userId)]);
    let userLevelIndex;
    if (userPoints >= levels[levels.length - 1].points) {
        userLevelIndex = levels.length - 1;
    } else {
        userLevelIndex = levels.findIndex(level => level.points > userPoints) - 1;
    }
    logger.debug("Level change check: " + userPoints + " " + userLevelIndex + " " + levels[userLevelIndex].points + " " + user.uid);

    if (levels[userLevelIndex].index > user.highestLevel) {
        try {
            logger.info("Level change for user " + userId + " to level " + userLevelIndex);
            await DB.getDb().pool.query(
                'UPDATE "User" SET "highestLevel" = $1, "votes" = "votes" + $2, "questions" = "questions" + $3 WHERE "uid"= $4',
                [levels[userLevelIndex].index, levels[userLevelIndex].plusVotes, levels[userLevelIndex].plusQuestions, userId]
            );
        } catch (err) {
            logger.error("Cannot do level change" + err.message);
            throw new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot do level change", HttpStatus.INTERNAL_SERVER);
        }
    }
}

router.post('/city', async (req, res, next) => {
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
});

router.delete('/user/me', async (req, res, next) => {
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
});

router.get('/user/me', async (req, res, next) => {
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
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Question not opened currently", HttpStatus.INTERNAL_SERVER);
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
        await DB.getDb().pool.query(
            'INSERT INTO "Guess" ("uid", "cityId", "answerId", "userId", "createdAt", "questionId", "points") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uuid.v4(), user.cityId, answerId, res.locals.userId, new Date(), gameId, points]
        );
        await userLevelChange(res.locals.userId);
        res.json({points: points});
    } catch (err) {
        logger.error("Error posting guess: " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error posting guess.", HttpStatus.INTERNAL_SERVER));
        }
    }
});


router.post('/game/:gameId/vote', async (req, res, next) => {
    const gameId = req.params.gameId;
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const user = (await dbClient.query('UPDATE "User" SET "votes" = "votes" - 1 WHERE "uid"= $1 AND "votes" > 0 RETURNING *', [res.locals.userId])).rows[0];
        if (!user) {
            throw new ErrorObject(ErrorCode.NO_VOTES, "No votes remaining", HttpStatus.INTERNAL_SERVER);
        }
        const question = (await dbClient.query('UPDATE "Question" SET "votes" = "votes" + 1 WHERE "uid"= $1 AND "openTime" IS NULL RETURNING *', [gameId])).rows[0];
        if (!question) {
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "No question matches", HttpStatus.INTERNAL_SERVER);
        }
        await dbClient.query('COMMIT');
        res.json({});
    } catch (err) {
        logger.error("Error on adding vote" + JSON.stringify(err.message));
        await dbClient.query('ROLLBACK');
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error posting vote.", HttpStatus.INTERNAL_SERVER));
        }
    } finally {
        dbClient.release();
    }
});

router.post('/game', async (req, res, next) => {
    const game: Game = req.body;
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const user = (await dbClient.query('UPDATE "User" SET "questions" = "questions" - 1 WHERE "uid"= $1 AND "questions" > 0 RETURNING *', [res.locals.userId])).rows[0];
        if (!user) {
            throw new ErrorObject(ErrorCode.NO_QUESTIONS, "No questions remaining", HttpStatus.INTERNAL_SERVER);
        }
        const questionId = (await dbClient.query('INSERT INTO "Question" ("uid", "question", "userId", "votes", "category", "createdAt") VALUES ($1, $2, $3, 0, $4, $5) RETURNING uid', [uuid.v4(), game.question, res.locals.userId, game.category, new Date()])).rows[0].uid;
        for (const answer of game.answers) {
            await dbClient.query('INSERT INTO "Answer" ("uid", "questionId", "answer", "votes", "createdAt") VALUES ($1, $2, $3, 0, $4)', [uuid.v4(), questionId, answer.answer, new Date()]);
        }
        await dbClient.query('COMMIT');
        res.json({});
    } catch (err) {
        logger.error("Error on adding game" + JSON.stringify(err.message));
        await dbClient.query('ROLLBACK');
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error posting vote.", HttpStatus.INTERNAL_SERVER));
        }
    } finally {
        dbClient.release();
    }
});

router.get('/game', async (req, res, next) => {
    try {
        const askedQuestion: boolean = req.query.askedQuestion ? req.query.askedQuestion : false;
        let questions: Array<Question>;
        if (askedQuestion) {
            questions = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NOT NULL AND "userId"=$1 AND "closeTime" < $2 ORDER BY "createdAt" DESC', [res.locals.userId, new Date()])).rows;
        } else {
            questions = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NULL AND "userId"=$1 ORDER BY "createdAt" DESC', [res.locals.userId])).rows;
        }
        const apiResult: Array<Game> = questions.map(question => ({
            question: question.question,
            uid: question.uid,
            category: question.category,
            votes: question.votes,
        }));
        res.json(apiResult);
    } catch (err) {
        logger.error("Cannot get questions for user " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get questions for user", HttpStatus.INTERNAL_SERVER));
        }
    }
});

export const authRouter = router;
