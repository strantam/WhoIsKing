import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {loadNewGame, loadNewGameSuccess} from "./game";

@Injectable()
export class GameEffects {

  loadGame$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(loadNewGame),
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
