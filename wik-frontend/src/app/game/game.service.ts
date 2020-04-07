import {Injectable} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {Game} from "../../../../wik-backend/src/openApi/model/game";
import {ResultAfterGame} from "../../../../wik-backend/src/openApi/model/resultAfterGame";
import {State} from "../reducers";
import {select, Store} from "@ngrx/store";
import {
  GameState,
  guessOver,
  resultReady, sendGuess, sendSolution,
  showQuestionForGuess,
  showQuestionForSolution,
  solutionOver
} from "../reducers/game/gameState/gameState";
import {waitForGame} from "../reducers/game/game";

const second = 1000;
const delay = 1000;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  get remainingTimeToCloseSolution(): number {
    return this._remainingTimeToCloseSolution;
  }

  get gameOptions(): any {
    return this._gameOptions;
  }

  get points(): number {
    return this._points;
  }

  get game(): Game {
    return this._game;
  }

  get uid(): string {
    return this._uid;
  }

  get remainingTimeToOpenSolution(): number {
    return this._remainingTimeToOpenSolution;
  }

  get remainingTimeToClose(): number {
    return this._remainingTimeToClose;
  }

  private _uid: string;
  private countBack;

  private _remainingTimeToOpenSolution: number;
  private _remainingTimeToCloseSolution: number;
  private _remainingTimeToGuess: number;
  private _remainingTimeToClose: number;
  private _remainingTimeToSum: number;
  private _game: Game;
  private _gameOptions: any;
  private _points: number;

  private currentState: GameState;

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
    this.store.pipe(select('gameState')).subscribe(async (state) => {
      this.currentState = state;
      if (state === GameState.IN_GAME_SOLUTION_NOTSENT) {
        this._game = await this.httpHandlerService.getQuestion(this.uid);
        //     this._gameOptions = JSON.parse(this._game.options);
      }
    });

    this.store.pipe(select('game')).subscribe(nextGame => {
      if (!nextGame) {
        return;
      }
      this._uid = nextGame.uid;
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

    this.store.dispatch(waitForGame());
  }


  public reset(): void {
    this._uid = null;
    this._game = null;
    this._gameOptions = null;
    this._points = null;
    if (this.countBack) {
      clearInterval(this.countBack);
    }
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
      this.store.dispatch(waitForGame());
    }
  }

  public async sendAnswer(answerId: string): Promise<void> {
    if (this.currentState === GameState.IN_GAME_SOLUTION_NOTSENT) {
      this.store.dispatch(sendSolution());
      await this.httpHandlerService.postAnswer(answerId, this.uid);
    }
  }

  public async sendGuess(answerId: string): Promise<void> {
    if (this.currentState === GameState.IN_GAME_GUESS_NOTSENT) {
      this.store.dispatch(sendGuess());
      const result = await this.httpHandlerService.postGuess(answerId, this.uid);
      this._points = result.points;
    }
  }

  public finishRound(){
    this.reset();
    this.store.dispatch(waitForGame());
  }

  public async getStats(): Promise<ResultAfterGame> {
    return this.httpHandlerService.getGameResults(this.uid);
  }

}
