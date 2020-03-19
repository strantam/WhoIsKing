import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {City} from "../../../db/DatabaseMapping";
import {City as ApiCity} from "../../../openApi/model/city";
import {ErrorCode, ErrorObject, HttpStatus} from "../../../error/ErrorObject";
import {CityWithRegs} from "../../model/cityWithRegs";


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
            'SELECT C."name", C."zip", C."uid", Count(*) as regs ' +
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
        const nextQuestion = (await DB.getDb().pool.query('SELECT "uid", "openTime", "closeTime" FROM "Question" WHERE "openTime" > $1 ORDER BY "openTime" LIMIT 1', [new Date()])).rows[0];
        console.log(nextQuestion.openTime.toISOString());
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


export const nonAuthRouter = router;