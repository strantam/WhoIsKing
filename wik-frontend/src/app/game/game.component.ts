import {Component, OnInit} from '@angular/core';
import {GameService} from "./game.service";
import {GameState, sendSolution, sendGuess} from '../reducers/game/gameState/gameState';
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";
import {Game} from "../../../../wik-backend/src/openApi/model/game";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  GameState = GameState;

  public currentState: GameState;
  public game: Game;

  constructor(public gameService: GameService, public store: Store<State>) {
  }

  ngOnInit() {
    this.store.pipe(select('gameState')).subscribe(state => {
      this.currentState = state;
    });

    this.store.pipe(select('game')).subscribe(state => {
      this.game = state;
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


}
