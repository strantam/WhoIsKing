import * as express from 'express';
import {getCurrentUser, remove, setCity} from "../controllers/user.controller";

const router = express.Router();

router.post('/me/city', setCity);
router.delete('/me', remove);
router.get('/me', getCurrentUser);

export default router;
