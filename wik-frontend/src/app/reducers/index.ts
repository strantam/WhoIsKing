import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import {environment} from '../../environments/environment';
import {User} from "../../../../wik-backend/src/openApi/model/user";
import {userReducer} from "./user/user";

export interface State {
  user: User;

}


export const reducers: ActionReducerMap<State> = {
  user: userReducer
};


export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state', state);
    console.log('action', action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [debug] : [];
