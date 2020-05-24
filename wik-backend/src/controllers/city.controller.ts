import {City} from "../db/DatabaseMapping";
import {DB} from "../db";
import {City as ApiCity} from "../openApi/model/city";
import {ErrorCode, ErrorObject, HttpStatus} from "../error/ErrorObject";
import {CityWithRegs} from "../openApi/model/cityWithRegs";
import {getLogger} from "../log/logger";
const logger = getLogger(module.filename);

export async function getAll(req, res, next) {
    try {
        const cities: Array<City> = (await DB.getDb().pool.query('SELECT * FROM "City" ORDER BY "name"')).rows;
        const apiCities: Array<ApiCity> = cities;
        res.json(apiCities);
    } catch (err) {
        logger.error("Cannot get cities " + JSON.stringify(err));
        next(new ErrorObject(ErrorCode.DB_QUERY_ERROR, "Cannot get cities", HttpStatus.INTERNAL_SERVER));
    }
}

export async function getRegistrations(req, res, next) {
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
}
