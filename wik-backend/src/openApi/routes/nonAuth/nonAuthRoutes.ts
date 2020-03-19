import {getLogger} from "../../../log/logger";
import {DB} from "../../../db";
import {City} from "../../../db/DatabaseMapping";
import {City as ApiCity} from "../../../openApi/model/city";


const logger = getLogger(module.filename);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const router = express.Router();

router.get('/city', async (req, res, next) => {
    const cities: Array<City> = (await DB.getDb().pool.query('SELECT * FROM "City" ORDER BY "name"')).rows;
    const apiCities: Array<ApiCity> = cities;
    res.json(apiCities);
});


export const nonAuthRouter = router;