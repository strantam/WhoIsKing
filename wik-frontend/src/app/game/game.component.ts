import {Component, OnInit} from '@angular/core';
import {GameService, GameState} from "./game.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  GameState = GameState;

  constructor(public gameService: GameService) {
  }

  ngOnInit() {
  }


}
