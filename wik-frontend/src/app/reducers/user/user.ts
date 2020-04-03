import {createAction, createReducer, on, props} from "@ngrx/store";
import {User} from "../../../../../wik-backend/src/openApi/model/user";

export const fetchUser = createAction('[User] Fetch');
export const logout = createAction('[User] Logout');
export const fetchUserSuccess = createAction('[User] Fetch Success', props<{ user: User }>());

const _userReducer = createReducer(null,
  on(fetchUserSuccess, ((state, {user}) => (user))),
  on(logout, (() => null))
);

export function userReducer(state, action) {
  return _userReducer(state, action);
}
