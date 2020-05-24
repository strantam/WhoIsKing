import {ErrorCode, ErrorObject, HttpStatus} from "../error/ErrorObject";
import {getLogger} from "../log/logger";
import {DB} from "../db";
import {Statistics} from "../openApi/model/statistics";
import {Answer, Level, Question, User} from "../db/DatabaseMapping";
import {Game} from "../openApi/model/game";
import {ResultAfterGame} from "../openApi/model/resultAfterGame";
import {getLevels, getUser, getUserPoints} from "../util/dbQuery";
import * as uuid from 'uuid';

const logger = getLogger(module.filename);

export async function nextGame(req, res, next) {
    try {
        const nextQuestion = (await DB.getDb().pool.query('SELECT "uid", "openTime", "closeTime", "changeToGuessTime" FROM "Question" WHERE "closeTime" > $1 ORDER BY "openTime" LIMIT 1', [new Date()])).rows[0];
        res.json({
            uid: nextQuestion.uid,
            openTime: nextQuestion.openTime.toISOString(),
            closeTime: nextQuestion.closeTime.toISOString(),
            changeToGuessTime: nextQuestion.changeToGuessTime.toISOString(),
            currentTime: new Date().toISOString()
        });
    } catch (err) {
        logger.error("Cannot get next question " + JSON.stringify(err.message));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get next question", HttpStatus.INTERNAL_SERVER));
    }
}


export async function getAggregatedResults(req, res, next) {
    try {
        const datePicker: string = req.query.datePicker ? req.query.datePicker : 'ALL';
        let fromDate = new Date();
        switch (datePicker) {
            case "1D":
                fromDate.setDate(fromDate.getDate() - 1);
                break;
            case "1W":
                fromDate.setDate(fromDate.getDate() - 7);
                break;
            case "1M":
                fromDate.setMonth(fromDate.getMonth() - 1);
                break;
            default:
                fromDate = new Date(0, 0, 0);
        }

        const cityResults = (await DB.getDb().pool.query(
            'SELECT  "cityId", AVG(G."points") as avgpoint, COUNT(*) as allresponders, "name", "zip", "lng", "lat" ' +
            'FROM "Guess" as G ' +
            'INNER JOIN "City" as C ' +
            'ON C."uid"=G."cityId" ' +
            'WHERE G."createdAt" > $1 ' +
            'GROUP BY "cityId", "name", "zip", "lng", "lat"', [fromDate])).rows;


        const userResults = (await DB.getDb().pool.query(
            'SELECT  SUM(G."points") as sumpoint, "nickName" ' +
            'FROM "Guess" as G ' +
            'INNER JOIN "User" as U ' +
            'ON G."userId" = U."uid" ' +
            'WHERE G."createdAt" > $1 ' +
            'GROUP BY "userId", "nickName"', [fromDate])).rows;

        const apiResult: Statistics = {
            cityResult: cityResults.map(cityResult => {
                return {
                    allResponders: cityResult.allresponders, avgPoint: cityResult.avgpoint, city: {
                        uid: cityResult.cityId,
                        name: cityResult.name,
                        zip: cityResult.zip,
                        lng: cityResult.lng,
                        lat: cityResult.lat
                    }
                }
            }),
            userResult: userResults.map(userResult => {
                return {nickName: userResult.nickName, points: userResult.sumpoint}
            })
        };
        res.json(apiResult);
    } catch (err) {
        logger.error("Cannot get aggregated results " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get aggregated results ", HttpStatus.INTERNAL_SERVER));
        }
    }
}

export async function getOne(req, res, next) {
    try {
        const gameId = req.params.gameId;
        const currentTime = new Date();
        const questions: Array<Question & Answer> = (await DB.getDb().pool.query(
            'SELECT * ' +
            'FROM "Question" as Q ' +
            'INNER JOIN "Answer" as A ' +
            'ON Q."uid" = A."questionId" ' +
            'WHERE Q."uid" = $1 AND Q."openTime" < $2', [gameId, currentTime])).rows;
        if (!questions || !questions.length) {
            next(new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Question not opened currently", HttpStatus.INTERNAL_SERVER));
        }
        const resQuestion: Game = {
            uid: questions[0].questionId,
            question: questions[0].question,
            // @ts-ignore
            openTime: questions[0].openTime.toISOString(),
            // @ts-ignore
            closeTime: questions[0].closeTime.toISOString(),
            // @ts-ignore
            changeToGuessTime: questions[0].changeToGuessTime.toISOString(),
            // @ts-ignore
            currentTime: new Date().toISOString(),
            answers: questions.map(question => {
                return {answer: question.answer, uid: question.uid}
            })
        };
        res.json(resQuestion);
    } catch (err) {
        logger.error("Cannot get question " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get question", HttpStatus.INTERNAL_SERVER));
        }
    }
}

export async function getResultForGame(req, res, next) {
    try {
        const gameId = req.params.gameId;
        const cityResults = (await DB.getDb().pool.query(
            'SELECT  "cityId", AVG(G."points") as avgpoint, COUNT(*) as allresponders, "name", "zip", "lng", "lat" ' +
            'FROM "Guess" as G ' +
            'INNER JOIN "City" as C ' +
            'ON C."uid"=G."cityId" ' +
            'WHERE G."questionId" = $1 ' +
            'GROUP BY "cityId", "name", "zip", "lng", "lat"', [gameId])).rows;

        const answerResults: Array<Answer> = (await DB.getDb().pool.query('SELECT * FROM "Answer" WHERE "questionId" = $1', [gameId])).rows;

        // @ts-ignore
        const allVotes = answerResults.reduce<number>((previousValue, currentValue) => previousValue + parseInt(currentValue.votes), 0);

        const apiResult: ResultAfterGame = {
            cityResult: cityResults.map(cityResult => {
                return {
                    allResponders: cityResult.allresponders, avgPoint: cityResult.avgpoint, city: {
                        uid: cityResult.cityId,
                        name: cityResult.name,
                        zip: cityResult.zip,
                        lng: cityResult.lng,
                        lat: cityResult.lat
                    }
                }
            }),

            gameResult: {
                answers: answerResults.map(answer => {
                    return {
                        uid: answer.uid,
                        answer: answer.answer,
                        ratio: Math.round(answer.votes / allVotes * 10000) / 100
                    }
                })
            }
        };
        res.json(apiResult);
    } catch (err) {
        logger.error("Cannot get result for question " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get result for question", HttpStatus.INTERNAL_SERVER));
        }
    }
}

export async function getAll(req, res, next) {
    try {
        const askedQuestion: boolean = req.query.askedQuestion ? req.query.askedQuestion : false;
        let questions: Array<Question>;
        if (askedQuestion) {
            questions = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NOT NULL AND "closeTime" < $1 ORDER BY "closeTime" DESC', [new Date()])).rows;
        } else {
            questions = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NULL ORDER BY "votes" DESC')).rows;
        }
        const apiResult: Array<Game> = questions.map(question => ({
            question: question.question,
            uid: question.uid,
            category: question.category,
            votes: question.votes,
        }));
        res.json(apiResult);
    } catch (err) {
        logger.error("Cannot get questions " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get questions", HttpStatus.INTERNAL_SERVER));
        }
    }
}

export async function getAllForUser(req, res, next) {
    try {
        const askedQuestion: boolean = req.query.askedQuestion ? req.query.askedQuestion : false;
        let questions: Array<Question>;
        if (askedQuestion) {
            questions = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NOT NULL AND "userId"=$1 AND "closeTime" < $2 ORDER BY "closeTime" DESC', [res.locals.userId, new Date()])).rows;
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
}

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


export async function postSolution(req, res, next) {
    const gameId = req.params.gameId;
    const answerId = req.body.answer;
    try {
        const question: Question = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "uid" = $1 AND "openTime" < $2 AND "changeToGuessTime" > $2', [gameId, new Date()])).rows[0];
        if (!question) {
            next(new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Solution not opened currently", HttpStatus.INTERNAL_SERVER));
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
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Error on adding vote", HttpStatus.INTERNAL_SERVER));
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
}

export async function postGuess(req, res, next) {
    const gameId = req.params.gameId;
    const answerId = req.body.answer;
    try {
        const question: Question = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "uid" = $1 AND "changeToGuessTime" < $2 AND "closeTime" > $2', [gameId, new Date()])).rows[0];
        if (!question) {
            next(new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Question not opened currently", HttpStatus.INTERNAL_SERVER));
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
}


export async function postVote(req, res, next) {
    const gameId = req.params.gameId;
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const user = (await dbClient.query('UPDATE "User" SET "votes" = "votes" - 1 WHERE "uid"= $1 AND "votes" > 0 RETURNING *', [res.locals.userId])).rows[0];
        if (!user) {
            next(new ErrorObject(ErrorCode.NO_VOTES, "No votes remaining", HttpStatus.INTERNAL_SERVER));
        }
        const question = (await dbClient.query('UPDATE "Question" SET "votes" = "votes" + 1 WHERE "uid"= $1 AND "openTime" IS NULL RETURNING *', [gameId])).rows[0];
        if (!question) {
            next(new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "No question matches", HttpStatus.INTERNAL_SERVER));
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
}

export async function create(req, res, next) {
    const game: Game = req.body;
    const dbClient = await DB.getDb().pool.connect();
    try {
        await dbClient.query('BEGIN');
        const user = (await dbClient.query('UPDATE "User" SET "questions" = "questions" - 1 WHERE "uid"= $1 AND "questions" > 0 RETURNING *', [res.locals.userId])).rows[0];
        if (!user) {
            next(new ErrorObject(ErrorCode.NO_QUESTIONS, "No questions remaining", HttpStatus.INTERNAL_SERVER));
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
}

