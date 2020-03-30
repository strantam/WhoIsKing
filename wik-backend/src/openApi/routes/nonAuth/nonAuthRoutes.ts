import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {Answer, City, Question} from "../../../db/DatabaseMapping";
import {City as ApiCity} from "../../../openApi/model/city";
import {Game} from "../../model/game"
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {CityWithRegs} from "../../model/cityWithRegs";
import {Statistics} from "../../model/statistics";
import {ResultAfterGame} from "../../model/resultAfterGame";


const logger = getLogger(module.filename);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const router = express.Router();

router.get('/city', async (req, res, next) => {
    try {
        const cities: Array<City> = (await DB.getDb().pool.query('SELECT * FROM "City" ORDER BY "name"')).rows;
        const apiCities: Array<ApiCity> = cities;
        res.json(apiCities);
    } catch (err) {
        logger.error("Cannot get cities " + JSON.stringify(err));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get cities", HttpStatus.INTERNAL_SERVER));
    }
});

router.get('/city/registrations', async (req, res, next) => {
    try {
        const cities: Array<any> = (await DB.getDb().pool.query(
            'SELECT C."name", C."zip", C."uid", C."lat", C."lng", Count(*) as regs ' +
            'FROM "City" as C ' +
            'INNER JOIN "User" as U ' +
            'ON C."uid"=U."cityId" ' +
            'GROUP BY C."uid"')).rows;
        const apiCitiesWithRegs: Array<CityWithRegs> = cities.map((city): CityWithRegs => {
            return {
                registrations: city.regs,
                city: {
                    name: city.name,
                    zip: city.zip,
                    uid: city.uid,
                    lat: city.lat,
                    lng: city.lng
                }
            }
        });
        res.json(apiCitiesWithRegs);
    } catch (err) {
        logger.error("Cannot get cities with regs " + JSON.stringify(err.message));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get cities with regs", HttpStatus.INTERNAL_SERVER));

    }
});

router.get('/nextGame', async (req, res, next) => {
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
});


router.get('/game/result', async (req, res, next) => {
    try {
        const datePicker: string = req.query.datePicker ? req.query.datePicker : 'ALL';
        let fromDate = new Date();
        console.log(datePicker);
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
});

router.get('/game/:gameId', async (req, res, next) => {
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
            throw new ErrorObject(ErrorCode.NO_OPEN_QUESTION, "Question not opened currently", HttpStatus.INTERNAL_SERVER);
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
});

router.get('/game/:gameId/result', async (req, res, next) => {
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
                    return {uid: answer.uid, ratio: Math.round(answer.votes / allVotes * 10000) / 100}
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
});

router.get('/level', async (req, res, next) => {
    try {
        const levels = (await DB.getDb().pool.query('SELECT * FROM "Level" ORDER BY "index"')).rows;
        console.log(levels);
        res.json(levels);
    } catch (err) {
        logger.error("Cannot get levels " + JSON.stringify(err.message));
        if (err.ownErrorObject) {
            next(err);
        } else {
            next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get levels", HttpStatus.INTERNAL_SERVER));
        }
    }
});

export const nonAuthRouter = router;