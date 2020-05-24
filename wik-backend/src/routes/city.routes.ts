import * as express from 'express';
import {getAll, getRegistrations} from "../controllers/city.controller";

const router = express.Router();

router.get('/', getAll);
router.get('/registrations', getRegistrations);

export default router;
