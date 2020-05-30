import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameState, sendSolution, sendGuess} from '../reducers/game/gameState/gameState';
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";
import {Game} from "../../../../wik-backend/src/openApi/model/game";
import {calculateTimes} from "../utils/gameState";
import {AnimationOptions} from "ngx-lottie";
import {animate, style, transition, trigger} from "@angular/animations";

const PROGRESS_BAR_REFRESH_MS = 25;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({opacity: '0', transform: 'translateY(5%)'}),
        animate('500ms ease-in', style({opacity: '1', transform: 'translateY(0%)'}))
      ])
    ])
  ]
})
export class GameComponent implements OnInit, OnDestroy {
  public lottieConfig: AnimationOptions = {
    path: '/assets/animations/stopwatch.json',
    renderer: 'canvas',
    autoplay: true,
    loop: true
  };

  GameState = GameState;

  public currentState: GameState;
  public game: Game;

  public remainingTimeToOpenSolution: number;
  public remainingTimeToCloseSolution: number;
  public remainingTimeToClose: number;

  private countBack;

  public solutionProgress: number = 0;
  public solutionTime: number = 0;
  public guessTime: number = 0;
  public guessProgress: number = 0;


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
      this.solutionTime = this.remainingTimeToCloseSolution - this.remainingTimeToOpenSolution;
      this.guessTime = this.remainingTimeToClose - times.remainingTimeToGuess;
      this.countBack = setInterval(() => {
        this.solutionProgress = Math.max(Math.min((this.solutionTime - this.remainingTimeToCloseSolution) / this.solutionTime * 100, 100), 0);
        this.guessProgress = Math.max(Math.min((this.guessTime - this.remainingTimeToClose) / this.guessTime * 100, 100), 0);
        this.remainingTimeToClose -= PROGRESS_BAR_REFRESH_MS;
        this.remainingTimeToCloseSolution -= PROGRESS_BAR_REFRESH_MS;
        this.remainingTimeToOpenSolution -= PROGRESS_BAR_REFRESH_MS;
      }, PROGRESS_BAR_REFRESH_MS);
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
