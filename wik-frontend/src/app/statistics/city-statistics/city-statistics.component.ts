import {Component, Input, OnInit} from '@angular/core';
import {CityResult} from "../../../../../wik-backend/src/openApi/model/cityResult";

@Component({
  selector: 'app-city-statistics',
  templateUrl: './city-statistics.component.html',
  styleUrls: ['./city-statistics.component.scss']
})
export class CityStatisticsComponent implements OnInit {

  private _stats: Array<CityResult> = [];

  @Input()
  public set stats(stats: Array<CityResult>) {
    this._stats = stats;
    this._stats = stats ? stats : [];
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
