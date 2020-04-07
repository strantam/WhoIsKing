import {createAction, createReducer, on} from "@ngrx/store";
import {waitForGame} from "../game";

export enum GameState {
  BEFORE_GAME,
  IN_GAME_SOLUTION_NOTSENT,
  IN_GAME_SOLUTION_SENT,
  IN_GAME_WAITING_FOR_GUESS,
  IN_GAME_GUESS_NOTSENT,
  IN_GAME_GUESS_SENT,
  AFTER_GAME_WAITING_FOR_RESULT,
  AFTE_GAME_GOT_RESULT
}

export const showQuestionForSolution = createAction('[Game] Solution');
export const sendSolution = createAction('[Game] Send Solution');
export const solutionOver = createAction('[Game] Solution Over');
export const showQuestionForGuess = createAction('[Game] Guess');
export const sendGuess = createAction('[Game] Send Guess');
export const guessOver = createAction('[Game] Guess Over');
export const resultReady = createAction('[Game] Result');

const _gameStateReducer = createReducer(
  GameState.BEFORE_GAME,
  on(waitForGame, (() => GameState.BEFORE_GAME)),
  on(showQuestionForSolution, (() => GameState.IN_GAME_SOLUTION_NOTSENT)),
  on(sendSolution, (() => GameState.IN_GAME_SOLUTION_SENT)),
  on(solutionOver, (() => GameState.IN_GAME_WAITING_FOR_GUESS)),
  on(showQuestionForGuess, (() => GameState.IN_GAME_GUESS_NOTSENT)),
  on(sendGuess, (() => GameState.IN_GAME_GUESS_SENT)),
  on(guessOver, (() => GameState.AFTER_GAME_WAITING_FOR_RESULT)),
  on(resultReady, (() => GameState.AFTE_GAME_GOT_RESULT))
);

export function gameStateReducer(state, action) {
  return _gameStateReducer(state, action);
}
