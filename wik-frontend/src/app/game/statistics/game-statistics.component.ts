import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {ResultAfterGame} from "../../../../../wik-backend/src/openApi/model/resultAfterGame";

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})
export class GameStatisticsComponent implements OnInit {

  public stats: ResultAfterGame;

  constructor(public gameService: GameService) {
  }

  async ngOnInit() {
    this.stats = await this.gameService.getStats();
  }

}
