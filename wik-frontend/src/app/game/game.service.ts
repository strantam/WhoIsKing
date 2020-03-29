import {Injectable} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {BehaviorSubject} from "rxjs";
import {Game} from "../../../../wik-backend/src/openApi/model/game";
import {ResultAfterGame} from "../../../../wik-backend/src/openApi/model/resultAfterGame";

const second = 1000;
const delay = 1000;

export enum GameState {
  BEFORE_GAME,
  IN_GAME_SOLUTION_NOTSENT,
  IN_GAME_SOLUTION_SENT,
  IN_GAME_WAITING_FOR_GUESS,
  IN_GAME_GUESS_NOTSENT,
  IN_GAME_GUESS_SENT,
  AFTER_GAME_WAITING_FOR_RESULT,
  AFTE_GAME_GOT_RESULT
}

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

  get state(): BehaviorSubject<GameState> {
    return this._state;
  }

  private _uid: string;
  private countBack;

  private _remainingTimeToOpenSolution: number;
  private _remainingTimeToCloseSolution: number;
  private _remainingTimeToGuess: number;
  private _remainingTimeToClose: number;
  private _remainingTimeToSum: number;
  private _state: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.BEFORE_GAME);
  private _game: Game;
  private _gameOptions: any;
  private _points: number;

  constructor(private httpHandlerService: HttpHandlerService) {
    this.init()
  }

  async init() {
    await this.getNextGame();
    this._state.subscribe(async (state) => {
      if (state === GameState.IN_GAME_SOLUTION_NOTSENT) {
        this._game = await this.httpHandlerService.getQuestion(this.uid);
        //     this._gameOptions = JSON.parse(this._game.options);
      }
    })
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

  async getNextGame() {
    this.reset();
    const nextGame = await this.httpHandlerService.getNextGame();
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
    console.log(this.remainingTimeToOpenSolution);
    if (this._remainingTimeToSum < 0) {
      if (this._state.getValue() !== GameState.AFTE_GAME_GOT_RESULT) {
        this._state.next(GameState.AFTE_GAME_GOT_RESULT);
      }
      return;
    }
    if (this._remainingTimeToClose < 0) {
      if (this._state.getValue() !== GameState.AFTER_GAME_WAITING_FOR_RESULT) {
        this._state.next(GameState.AFTER_GAME_WAITING_FOR_RESULT);
      }
      return;
    }
    if (this._remainingTimeToGuess < 0) {
      if (this._state.getValue() !== GameState.IN_GAME_GUESS_NOTSENT && this._state.getValue() !== GameState.IN_GAME_GUESS_SENT) {
        this._state.next(GameState.IN_GAME_GUESS_NOTSENT);
      }
      return;
    }
    if (this._remainingTimeToCloseSolution < 0) {
      if (this._state.getValue() !== GameState.IN_GAME_WAITING_FOR_GUESS) {
        this._state.next(GameState.IN_GAME_WAITING_FOR_GUESS);
      }
      return;
    }
    if (this._remainingTimeToOpenSolution < 0) {
      if (this._state.getValue() !== GameState.IN_GAME_SOLUTION_NOTSENT && this._state.getValue() !== GameState.IN_GAME_SOLUTION_SENT) {
        this._state.next(GameState.IN_GAME_SOLUTION_NOTSENT);
      }
      return;
    }
    if (this._state.getValue() !== GameState.BEFORE_GAME) {
      this._state.next(GameState.BEFORE_GAME);
    }
  }

  public async sendAnswer(answerId: string): Promise<void> {
    if (this._state.getValue() === GameState.IN_GAME_SOLUTION_NOTSENT) {
      this._state.next(GameState.IN_GAME_SOLUTION_SENT);
      await this.httpHandlerService.postAnswer(answerId, this.uid);
    }
  }

  public async sendGuess(answerId: string): Promise<void> {
    if (this._state.getValue() === GameState.IN_GAME_GUESS_NOTSENT) {
      this._state.next(GameState.IN_GAME_GUESS_SENT);
      const result = await this.httpHandlerService.postGuess(answerId, this.uid);
      this._points = result.points;
    }
  }

  public finishRound() {
    this.getNextGame();
  }

  public async getStats(): Promise<ResultAfterGame> {
    return this.httpHandlerService.getGameResults(this.uid);
  }

}
