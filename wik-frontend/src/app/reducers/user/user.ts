import {createAction, createReducer, on, props} from "@ngrx/store";
import {User} from "../../../../../wik-backend/src/openApi/model/user";

export const fetchUser = createAction('[User] Fetch');
export const logout = createAction('[User] Logout');
export const fetchUserSuccess = createAction('[User] Fetch Success', props<{ user: User }>());
export const vote = createAction('[User] Vote');
export const askQuestion = createAction('[User] Ask Question');

const _userReducer = createReducer(null,
  on(fetchUserSuccess, (state, {user}) => (user)),
  on(vote, (user: User) => ({...user, votes: user.votes - 1})),
  on(askQuestion, (user: User) => ({...user, questions: user.questions - 1})),
  on(logout, (() => null))
);

export function userReducer(state, action) {
  return _userReducer(state, action);
}
