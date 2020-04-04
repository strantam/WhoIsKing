import {Component, OnInit} from '@angular/core';
import {GameService} from "./game.service";
import {GameState} from '../reducers/gameState/gameState';
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  GameState = GameState;

  public currentState: GameState;

  constructor(public gameService: GameService, public store: Store<State>) {
  }

  ngOnInit() {
    this.store.pipe(select('gameState')).subscribe(state => {
      this.currentState = state;
    })
  }


}
