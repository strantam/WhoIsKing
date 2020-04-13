import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {fetchUser, fetchUserSuccess} from "./user";
import {EMPTY, from} from "rxjs";
import {resultReady} from "../game/gameState/gameState";

@Injectable()
export class UserEffects {

  loadUser$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(fetchUser, resultReady),
        mergeMap(() =>
          from(this.httpHandlerService.getPersonalInfo())
            .pipe(
              map(user => ({type: fetchUserSuccess.type, user})),
              catchError((msg) => {
                console.error("Error on fetching user", msg);
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
