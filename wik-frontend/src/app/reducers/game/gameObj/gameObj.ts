import {createAction, createReducer, on, props} from "@ngrx/store";
import {GameModel} from "../../../model/GameModel";

export const loadNextGameSuccess = createAction('[Game] Load next game success', props<{ nextGame: GameModel }>());
export const loadCurrentGameSuccess = createAction('[Game] Load current game success', props<{ nextGame: GameModel }>());

export const loadNewGame = createAction('[Game] Load new game');


const _gameReduce = createReducer(
  null,
  on(loadNextGameSuccess, loadCurrentGameSuccess, ((state, {nextGame}) => (nextGame))),
);

export function gameReduce(state, action) {
  return _gameReduce(state, action);
}
