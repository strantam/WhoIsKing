import {Injectable} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import Timer = NodeJS.Timer;
import {BehaviorSubject} from "rxjs";
import {Game} from "../../../../wik-backend/src/openApi/model/game";

const second = 1000;
const delay = 5000;

export enum GameState {
  BEFORE_GAME,
  IN_GAME_NOTSENT,
  IN_GAME_SENT,
  AFTER_GAME_WAITING_FOR_RESULT,
  AFTE_GAME_GOT_RESULT
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
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

  get remainingTimeToOpen(): number {
    return this._remainingTimeToOpen;
  }

  get remainingTimeToClose(): number {
    return this._remainingTimeToClose;
  }

  get state(): BehaviorSubject<GameState> {
    return this._state;
  }

  private _uid: string;
  private countBack: Timer;

  private _remainingTimeToOpen: number;
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
      if (state === GameState.IN_GAME_NOTSENT) {
        this._game = await this.httpHandlerService.getQuestion(this.uid);
        this._gameOptions = JSON.parse(this._game.options);
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
    this._remainingTimeToOpen = (nextGame.openTime.getTime() - nextGame.currentTime.getTime()) + delay;
    this._remainingTimeToClose = (nextGame.closeTime.getTime() - nextGame.currentTime.getTime()) - delay;
    this._remainingTimeToSum = (nextGame.closeTime.getTime() - nextGame.currentTime.getTime()) + delay;
    this.calculateState();
    this.countBack = setInterval(() => {
      this.handleTick();
    }, second);
  }

  private handleTick() {
    this._remainingTimeToClose -= second;
    this._remainingTimeToOpen -= second;
    this._remainingTimeToSum -= second;
    this.calculateState();
  }

  private calculateState() {
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
    if (this._remainingTimeToOpen < 0) {
      if (this._state.getValue() !== GameState.IN_GAME_NOTSENT && this._state.getValue() !== GameState.IN_GAME_SENT) {
        this._state.next(GameState.IN_GAME_NOTSENT);
      }
      return;
    }
    if (this._state.getValue() !== GameState.BEFORE_GAME) {
      this._state.next(GameState.BEFORE_GAME);
    }
  }

  public async sendAnswer(answer: string): Promise<void> {
    if (this._state.getValue() === GameState.IN_GAME_NOTSENT) {
      this._state.next(GameState.IN_GAME_SENT);
      const result = await this.httpHandlerService.postAnswer(answer, this.uid);
      this._points = result.points;
    }
  }

  public finishRound() {
    this.getNextGame();
  }

}
