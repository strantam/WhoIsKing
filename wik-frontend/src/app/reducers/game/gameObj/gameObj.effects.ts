import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {loadNewGameSuccess} from "./gameObj";
import {waitForGame} from "../game";

@Injectable()
export class GameObjEffects {

  loadGame$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(waitForGame),
        mergeMap(() =>
          from(this.httpHandlerService.getNextGame())
            .pipe(
              map(nextGame => ({type: loadNewGameSuccess.type, nextGame})),
              catchError((msg) => {
                console.error("Error on fetching next gameState", msg);
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
