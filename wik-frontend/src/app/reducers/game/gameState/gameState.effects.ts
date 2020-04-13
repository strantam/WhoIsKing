import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from, timer} from "rxjs";
import {
  gameLoaded,
  guessOver,
  resultReady,
  sendGuess,
  sendSolution,
  showQuestionForGuess, showQuestionForSolution,
  solutionOver
} from "./gameState";
import {noop} from "../../generic";
import {setPoints} from "../../points";
import {Store} from "@ngrx/store";
import {State} from "../../index";
import {loadNextGameSuccess} from "../gameObj/gameObj";
import {calculateTimes} from "../../../utils/gameState";


@Injectable()
export class GameStateEffects {

  postSolution$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(sendSolution),
        withLatestFrom(this.store),
        switchMap(([action, storeState]) =>
          from(this.httpHandlerService.postAnswer(action.answerId, storeState.game.uid))
            .pipe(
              map(() => ({type: noop.type})),
              catchError((msg) => {
                console.error("Error posting answer", msg);
                return EMPTY
              })
            )
        )
      )
    }
  );

  postGuess$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(sendGuess),
        withLatestFrom(this.store),
        switchMap(([action, storeState]) =>
          from(this.httpHandlerService.postGuess(action.answerId, storeState.game.uid))
            .pipe(
              map((point) => ({type: setPoints.type, points: point.points})),
              catchError((msg) => {
                console.error("Error posting guess", msg);
                return EMPTY
              })
            )
        )
      )
    }
  );

  calculateInitState$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(loadNextGameSuccess),
        map((action) => {
            const nextGame = action.nextGame;
            const times = calculateTimes(nextGame);
            const state = GameStateEffects.calculateState(times);
            return {type: state.nextAction.type};
          }
        ),
        catchError((msg) => {
          console.error("Error init game state", msg);
          return EMPTY
        })
      )
    }
  );

  calculateNextState$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(guessOver, showQuestionForGuess, solutionOver, showQuestionForSolution, gameLoaded),
        withLatestFrom(this.store),
        switchMap(([, storeState]) => {
            const times = calculateTimes(storeState.game);
            const nextState = GameStateEffects.calculateNextState(times);
            return timer(nextState.time).pipe(
              map(() => ({type: nextState.nextAction.type}))
            )
          }
        ),
        catchError((msg) => {
          console.error("Error switching game state", msg);
          return EMPTY
        })
      )
    }
  );

  constructor(
    private actions$: Actions,
    private httpHandlerService: HttpHandlerService,
    private store: Store<State>,
  ) {
  }


  private static calculateState(
    {
      remainingTimeToSum,
      remainingTimeToClose,
      remainingTimeToGuess,
      remainingTimeToCloseSolution,
      remainingTimeToOpenSolution
    }: {
      remainingTimeToSum: number,
      remainingTimeToClose: number,
      remainingTimeToGuess: number,
      remainingTimeToCloseSolution: number,
      remainingTimeToOpenSolution: number
    }): { nextAction } {
    if (remainingTimeToSum < 0) {
      return {nextAction: resultReady};
    }
    if (remainingTimeToClose < 0) {
      return {nextAction: guessOver};
    }
    if (remainingTimeToGuess < 0) {
      return {nextAction: showQuestionForGuess};
    }
    if (remainingTimeToCloseSolution < 0) {
      return {nextAction: solutionOver};

    }
    if (remainingTimeToOpenSolution < 0) {
      return {nextAction: showQuestionForSolution};
    }
    return {nextAction: gameLoaded};
  }

  private static calculateNextState(
    {
      remainingTimeToSum,
      remainingTimeToClose,
      remainingTimeToGuess,
      remainingTimeToCloseSolution,
      remainingTimeToOpenSolution
    }: {
      remainingTimeToSum: number,
      remainingTimeToClose: number,
      remainingTimeToGuess: number,
      remainingTimeToCloseSolution: number,
      remainingTimeToOpenSolution: number
    }): { nextAction, time: number } {

    const possibleActions: Array<{ nextAction, time: number }> = [
      {nextAction: resultReady, time: remainingTimeToSum},
      {nextAction: guessOver, time: remainingTimeToClose},
      {nextAction: showQuestionForGuess, time: remainingTimeToGuess},
      {nextAction: solutionOver, time: remainingTimeToCloseSolution},
      {nextAction: showQuestionForSolution, time: remainingTimeToOpenSolution},
      {nextAction: null, time: -1},
    ];

    const nextAction = possibleActions[possibleActions.findIndex(action => action.time < 0) - 1];
    return {nextAction: nextAction.nextAction, time: nextAction.time};
  }
}
