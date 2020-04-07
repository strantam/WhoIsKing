import {createAction, createReducer, on, props} from "@ngrx/store";
import {Game} from "../../../../../../wik-backend/src/openApi/model/game";

export const loadNewGameSuccess = createAction('[Game] Load new game success', props<{ nextGame: Game }>());

const _gameReduce = createReducer(
  null,
  on(loadNewGameSuccess, ((state, {nextGame}) => (nextGame))),
);

export function gameReduce(state, action) {
  return _gameReduce(state, action);
}
