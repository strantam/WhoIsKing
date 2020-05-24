import * as express from 'express';
import {
    create,
    getAggregatedResults,
    getAll,
    getAllForUser,
    getOne,
    getResultForGame,
    nextGame, postGuess, postSolution, postVote
} from "../controllers/game.controller";
import auth from "../middleware/auth";

const router = express.Router();

router.get('/next', nextGame);
router.get('/result', getAggregatedResults);
router.get('/own', auth, getAllForUser);
router.get('/:gameId', getOne);
router.get('/:gameId/result', getResultForGame);
router.post('/:gameId/solution', auth, postSolution);
router.post('/:gameId/guess', auth, postGuess);
router.post('/:gameId/vote', auth, postVote);
router.post('/', auth, create);
router.get('/', getAll);

export default router;
