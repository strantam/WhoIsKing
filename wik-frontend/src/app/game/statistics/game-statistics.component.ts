import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {GameResult} from "../../../../../wik-backend/src/openApi/model/gameResult";

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})
export class GameStatisticsComponent implements OnInit {

  public citySuccessList: Array<{ name: string, avgScore: number }> = [];
  public cityParticipantsList: Array<{ name: string, participants: number }> = [];

  public stats: Array<GameResult> = [];

  constructor(public gameService: GameService) {
  }

  async ngOnInit() {
    this.stats = await this.gameService.getStats();
  }

}
