import {Injectable} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {State} from "../reducers";
import {select, Store} from "@ngrx/store";
import {
  gameLoaded,
  GameState,
  guessOver,
  resultReady,
  showQuestionForGuess,
  showQuestionForSolution,
  solutionOver
} from "../reducers/game/gameState/gameState";
import {fetchUser} from "../reducers/user/user";

const second = 1000;
const delay = 1000;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  get remainingTimeToCloseSolution(): number {
    return this._remainingTimeToCloseSolution;
  }

  get remainingTimeToOpenSolution(): number {
    return this._remainingTimeToOpenSolution;
  }

  get remainingTimeToClose(): number {
    return this._remainingTimeToClose;
  }

  private countBack;

  private _remainingTimeToOpenSolution: number;
  private _remainingTimeToCloseSolution: number;
  private _remainingTimeToGuess: number;
  private _remainingTimeToClose: number;
  private _remainingTimeToSum: number;

  private currentState: GameState;

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
    this.store.pipe(select('gameState')).subscribe(async (state) => {
      this.currentState = state;
    });

    this.store.pipe(select('game')).subscribe(nextGame => {
      if (!nextGame) {
        return;
      }
      if (this.countBack) {
        clearInterval(this.countBack);
      }
      this._remainingTimeToOpenSolution = (nextGame.openTime.getTime() - nextGame.currentTime.getTime()) + delay;
      this._remainingTimeToCloseSolution = (nextGame.changeToGuessTime.getTime() - nextGame.currentTime.getTime()) - delay;
      this._remainingTimeToGuess = (nextGame.changeToGuessTime.getTime() - nextGame.currentTime.getTime()) + delay;
      this._remainingTimeToClose = (nextGame.closeTime.getTime() - nextGame.currentTime.getTime()) - delay;
      this._remainingTimeToSum = (nextGame.closeTime.getTime() - nextGame.currentTime.getTime()) + delay;
      this.calculateState();
      this.countBack = setInterval(() => {
        this.handleTick();
      }, second);
    });
  }

  private handleTick() {
    this._remainingTimeToClose -= second;
    this._remainingTimeToOpenSolution -= second;
    this._remainingTimeToCloseSolution -= second;
    this._remainingTimeToGuess -= second;
    this._remainingTimeToSum -= second;
    this.calculateState();
  }

  private calculateState() {
    if (this._remainingTimeToSum < 0) {
      if (this.currentState !== GameState.AFTE_GAME_GOT_RESULT) {
        this.store.dispatch(resultReady());
        this.store.dispatch(fetchUser());
      }
      return;
    }
    if (this._remainingTimeToClose < 0) {
      if (this.currentState !== GameState.AFTER_GAME_WAITING_FOR_RESULT) {
        this.store.dispatch(guessOver());
      }
      return;
    }
    if (this._remainingTimeToGuess < 0) {
      if (this.currentState !== GameState.IN_GAME_GUESS_NOTSENT && this.currentState !== GameState.IN_GAME_GUESS_SENT) {
        this.store.dispatch(showQuestionForGuess());

      }
      return;
    }
    if (this._remainingTimeToCloseSolution < 0) {
      if (this.currentState !== GameState.IN_GAME_WAITING_FOR_GUESS) {
        this.store.dispatch(solutionOver());
      }
      return;
    }
    if (this._remainingTimeToOpenSolution < 0) {
      if (this.currentState !== GameState.IN_GAME_SOLUTION_NOTSENT && this.currentState !== GameState.IN_GAME_SOLUTION_SENT) {
        this.store.dispatch(showQuestionForSolution());
      }
      return;
    }
    if (this.currentState !== GameState.BEFORE_GAME) {
      this.store.dispatch(gameLoaded());
    }
  }

}
