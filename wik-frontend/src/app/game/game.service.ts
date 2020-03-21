import {Injectable} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import Timer = NodeJS.Timer;
import {BehaviorSubject} from "rxjs";

const second = 1000;

export enum GameState {
  BEFORE_GAME,
  IN_GAME,
  AFTER_GAME
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
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
  private _state: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.BEFORE_GAME);

  constructor(private httpHandlerService: HttpHandlerService) {
    this.init()
  }

  async init() {
    await this.getNextGame();
    this._state.subscribe(state => {
      if (state === GameState.AFTER_GAME) {
        this.getNextGame();
      }
    })
  }

  async getNextGame() {
    if (this.countBack) {
      clearInterval(this.countBack);
    }
    const nextGame = await this.httpHandlerService.getNextGame();
    this._uid = nextGame.uid;
    this._remainingTimeToOpen = nextGame.openTime.getTime() - nextGame.currentTime.getTime();
    this._remainingTimeToClose = nextGame.closeTime.getTime() - nextGame.currentTime.getTime();
    this.calculateState();
    this.countBack = setInterval(() => {
      this.handleTick();
    }, second);
  }

  private handleTick() {
    this._remainingTimeToClose -= second;
    this._remainingTimeToOpen -= second;
    this.calculateState();
  }

  private calculateState() {
    if (this._remainingTimeToClose < 0) {
      if (this._state.getValue() !== GameState.AFTER_GAME) {
        this._state.next(GameState.AFTER_GAME);
      }
      return;
    }
    if (this._remainingTimeToOpen < 0) {
      if (this._state.getValue() !== GameState.IN_GAME) {
        this._state.next(GameState.IN_GAME);
      }
      return;
    }
    if (this._state.getValue() !== GameState.BEFORE_GAME) {
      this._state.next(GameState.BEFORE_GAME);
    }
  }

}
