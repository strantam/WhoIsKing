import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import {environment} from '../../environments/environment';
import {User} from "../../../../wik-backend/src/openApi/model/user";
import {userReducer} from "./user/user";
import {gameStateReducer, GameState} from "./game/gameState/gameState";
import {gameReduce} from "./game/gameObj/gameObj";
import {pointsReducer} from "./points";
import {GameModel} from "../model/GameModel";

export interface State {
  user: User;
  gameState: GameState,
  game: GameModel,
  points: number
}


export const reducers: ActionReducerMap<State> = {
  user: userReducer,
  gameState: gameStateReducer,
  game: gameReduce,
  points: pointsReducer
};


export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state, 'action', action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [debug] : [];
