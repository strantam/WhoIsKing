import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {Answer, City, Question} from "../../../db/DatabaseMapping";
import {City as ApiCity} from "../../../openApi/model/city";
import {Game} from "../../../openApi/model/game"
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {CityWithRegs} from "../../model/cityWithRegs";
import {GameResult} from "../../model/gameResult";


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

/* INSERT INTO public."Question"(
    uid, type, params, question, points, "openTime", "closeTime")
VALUES ('ee0999dc-4c6f-4d1e-a29a-0247acb6606d', 'MULTIPLE_CHOICE', '{}', 'Where are you?', 1, '2020-05-19 10:30:00', '2020-05-19 10:35:00'); */

router.get('/nextGame', async (req, res, next) => {
    try {
        const nextQuestion = (await DB.getDb().pool.query('SELECT "uid", "openTime", "closeTime" FROM "Question" WHERE "closeTime" > $1 ORDER BY "openTime" LIMIT 1', [new Date()])).rows[0];
        res.json({
            uid: nextQuestion.uid,
            openTime: nextQuestion.openTime.toISOString(),
            closeTime: nextQuestion.closeTime.toISOString(),
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
        console.log(fromDate);
        const results = (await DB.getDb().pool.query('SELECT  "cityId", AVG("points") as avgpoint, COUNT(*) as allresponders, "name", "zip" ' +
            'FROM "Solution" as Sol ' +
            'INNER JOIN "City" as C ' +
            'ON C."uid"=Sol."cityId" ' +
            'WHERE Sol."createdAt" > $1 ' +
            'GROUP BY "cityId", "name", "zip"', [fromDate])).rows;
        const apiResult: Array<GameResult> = results.map((result): GameResult => {
            return {
                allResponders: result.allresponders,
                avgPoint: result.avgpoint,
                city: {
                    uid: result.cityId,
                    name: result.name,
                    zip: result.zip,
                }
            }
        });
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
        const results = (await DB.getDb().pool.query(
            'SELECT  "cityId", AVG("points") as avgpoint, COUNT(*) as allresponders, "name", "zip" ' +
            'FROM "Solution" as Sol ' +
            'INNER JOIN "City" as C ' +
            'ON C."uid"=Sol."cityId" ' +
            'WHERE Sol."questionId" = $1 ' +
            'GROUP BY "cityId", "name", "zip"', [gameId])).rows;
        const apiResult: Array<GameResult> = results.map((result): GameResult => {
            return {
                allResponders: result.allresponders,
                avgPoint: result.avgpoint,
                city: {
                    uid: result.cityId,
                    name: result.name,
                    zip: result.zip,
                }
            }
        });
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

export const nonAuthRouter = router;