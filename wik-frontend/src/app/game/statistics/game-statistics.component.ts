import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})
export class GameStatisticsComponent implements OnInit {

  public citySuccessList: Array<{ name: string, avgScore: number }> = [];
  public cityParticipantsList: Array<{ name: string, participants: number }> = [];

  constructor(public gameService: GameService) {
  }

  async ngOnInit() {
    const stats = await this.gameService.getStats();
    this.citySuccessList = stats.sort(a => -a.avgPoint).map(city => {
      return {avgScore: city.avgPoint, name: city.city.name}
    });
    this.cityParticipantsList = stats.sort(a => -a.allResponders).map(city => {
      return {participants: city.allResponders, name: city.city.name}
    });
  }

}
