import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {fetchUser, fetchUserSuccess} from "./user";
import {EMPTY, from} from "rxjs";
import {resultReady} from "../game/gameState/gameState";
import {MatDialog} from "@angular/material/dialog";
import {LevelChangeComponent} from "../../level-change/level-change.component";

@Injectable()
export class UserEffects {
  private highestLevel: number;

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

  userLoaded$ = createEffect((): any => {
      return this.actions$.pipe(
        ofType(fetchUserSuccess),
        switchMap((user) => {
          if (!this.highestLevel){
            this.highestLevel = user.user.highestLevel;
          }
          if (this.highestLevel < user.user.currentLevel){
            this.dialog.open(LevelChangeComponent, {autoFocus: false});
          }
          return EMPTY;
        }),
        catchError((msg) => {
          console.error("Error on fetching user", msg);
          return EMPTY
        })
      )
    }
  );

  constructor(
    private actions$: Actions,
    private httpHandlerService: HttpHandlerService,
    private dialog: MatDialog
  ) {
  }
}
