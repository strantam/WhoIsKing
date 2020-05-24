import * as express from 'express';
import {getAll} from "../controllers/level.controller";

const router = express.Router();

router.get('/', getAll);

export default router;
