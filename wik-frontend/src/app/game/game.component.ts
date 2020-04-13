import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameState, sendSolution, sendGuess} from '../reducers/game/gameState/gameState';
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";
import {Game} from "../../../../wik-backend/src/openApi/model/game";
import {calculateTimes} from "../utils/gameState";

const SECOND = 1000;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  GameState = GameState;

  public currentState: GameState;
  public game: Game;

  public remainingTimeToOpenSolution: number;
  public remainingTimeToCloseSolution: number;
  public remainingTimeToClose: number;

  private countBack;


  constructor(public store: Store<State>) {
  }

  ngOnInit() {
    this.store.pipe(select('gameState')).subscribe(state => {
      this.currentState = state;
    });

    this.store.pipe(select('game')).subscribe(game => {
      if (!game) {
        return;
      }
      this.game = game;
      if (this.countBack) {
        clearInterval(this.countBack);
      }
      const times = calculateTimes(game);
      this.remainingTimeToClose = times.remainingTimeToClose;
      this.remainingTimeToCloseSolution = times.remainingTimeToCloseSolution;
      this.remainingTimeToOpenSolution = times.remainingTimeToOpenSolution;


      this.countBack = setInterval(() => {
        this.remainingTimeToClose -= SECOND;
        this.remainingTimeToCloseSolution -= SECOND;
        this.remainingTimeToOpenSolution -= SECOND;
      }, SECOND);
    });
  }


  public async sendAnswer(answerId: string): Promise<void> {
    if (this.currentState === GameState.IN_GAME_SOLUTION_NOTSENT) {
      this.store.dispatch(sendSolution({answerId: answerId}));
    }
  }

  public async sendGuess(answerId: string): Promise<void> {
    if (this.currentState === GameState.IN_GAME_GUESS_NOTSENT) {
      this.store.dispatch(sendGuess({answerId: answerId}));
    }
  }

  ngOnDestroy(): void {
    if (this.countBack) {
      clearInterval(this.countBack);
    }
  }


}
