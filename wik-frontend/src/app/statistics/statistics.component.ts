import {Component, Input, OnInit} from '@angular/core';
import {GameResult} from "../../../../wik-backend/src/openApi/model/gameResult";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  private _stats: Array<GameResult> = [];

  @Input()
  public set stats(stats: Array<GameResult>) {
    this._stats = stats;
    this.sortStats();
  }

  public citySuccessList: Array<{ name: string, avgScore: number }> = [];
  public cityParticipantsList: Array<{ name: string, participants: number }> = [];


  constructor() {
  }

  ngOnInit() {

  }

  sortStats() {
    this.citySuccessList = this._stats.sort((a, b) => b.avgPoint - a.avgPoint).map(city => {
      return {avgScore: city.avgPoint, name: city.city.name}
    });
    this.cityParticipantsList = this._stats.sort((a, b) => b.allResponders - a.allResponders).map(city => {
      return {participants: city.allResponders, name: city.city.name}
    });
  }

}
