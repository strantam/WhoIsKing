import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {sendGuess, sendSolution} from "./gameState";
import {noop} from "../../generic";
import {setPoints} from "../../points";

@Injectable()
export class GameStateEffects {

  postSolution$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(sendSolution),
        mergeMap((solution) =>
          from(this.httpHandlerService.postAnswer(solution.answerId, solution.gameId))
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
        mergeMap((solution) =>
          from(this.httpHandlerService.postGuess(solution.answerId, solution.gameId))
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
    private httpHandlerService: HttpHandlerService
  ) {
  }
}
