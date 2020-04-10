import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType, ROOT_EFFECTS_INIT} from '@ngrx/effects';
import {catchError, map, mergeMap, withLatestFrom} from 'rxjs/operators';
import {HttpHandlerService} from "../../../http-service/http-handler.service";
import {EMPTY, from} from "rxjs";
import {loadNewGame, loadNewGameSuccess} from "./gameObj";
import {showQuestionForSolution} from "../gameState/gameState";
import {Store} from "@ngrx/store";
import {State} from "../../index";

@Injectable()
export class GameObjEffects {

  loadNextGame$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(loadNewGame, ROOT_EFFECTS_INIT),
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
        withLatestFrom(this.store),
        mergeMap(([, storeState]) =>
          from(this.httpHandlerService.getQuestion(storeState.game.uid))
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
    private httpHandlerService: HttpHandlerService,
    private store: Store<State>
  ) {
  }
}
