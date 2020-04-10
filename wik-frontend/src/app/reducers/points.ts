import {createAction, createReducer, on, props} from "@ngrx/store";

export const setPoints = createAction('[Points] Set', props<{ points: number }>());

const _pointsReducer = createReducer(null,
  on(setPoints, ((state, {points}) => points)),
);

export function pointsReducer(state, action) {
  return _pointsReducer(state, action);
}
