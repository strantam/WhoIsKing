import {createAction, createReducer, on} from "@ngrx/store";

export const addSpinner = createAction('[Spinner] On');
export const removeSpinner = createAction('[Spinner] Off');

const _spinnerReducer = createReducer(false,
  on(addSpinner, () => true),
  on(removeSpinner, () => false),
);

export function spinnerReducer(state, action) {
  return _spinnerReducer(state, action);
}
