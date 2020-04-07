import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {loadNewGameSuccess} from "./gameObj";
import {waitForGame} from "../game";
import {showQuestionForSolution} from "../gameState/gameState";

@Injectable()
export class GameObjEffects {

  loadNextGame$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(waitForGame),
        mergeMap(() =>
          from(this.httpHandlerService.getNextGame())
            .pipe(
              map(nextGame => ({type: loadNewGameSuccess.type, nextGame})),
              catchError((msg) => {
                console.error("Error on fetching next game", msg);
                return EMPTY
              })
            )
        )
      )
    }
  );


  loadGame$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(showQuestionForSolution),
        mergeMap((game) =>
          from(this.httpHandlerService.getQuestion(game.uid))
            .pipe(
              map(nextGame => ({type: loadNewGameSuccess.type, nextGame})),
              catchError((msg) => {
                console.error("Error on fetching current game", msg);
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
