import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, withLatestFrom} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {sendGuess, sendSolution} from "./gameState";
import {noop} from "../../generic";
import {setPoints} from "../../points";
import {Store} from "@ngrx/store";
import {State} from "../../index";

@Injectable()
export class GameStateEffects {

  postSolution$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(sendSolution),
        withLatestFrom(this.store),
        mergeMap(([action, storeState]) =>
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
        mergeMap(([action, storeState]) =>
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


  constructor(
    private actions$: Actions,
    private httpHandlerService: HttpHandlerService,
    private store: Store<State>,
  ) {
  }
}
