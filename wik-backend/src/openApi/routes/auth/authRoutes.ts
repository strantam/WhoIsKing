import {getLogger} from "../../../log/logger";


const logger = getLogger(module.filename);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const router = express.Router();

router.post('/', async (req, res, next) => {
});


export const authRouter = router;