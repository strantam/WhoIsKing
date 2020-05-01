import {Component, Input, OnInit} from '@angular/core';
import {CityResult} from "../../../../../wik-backend/src/openApi/model/cityResult";
import {ChartOptions} from "chart.js";
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-city-statistics',
  templateUrl: './city-statistics.component.html',
  styleUrls: ['./city-statistics.component.scss']
})
export class CityStatisticsComponent implements OnInit {

  public lottieConfig: AnimationOptions = {
    path: '/assets/animations/sad-emoji.json',
    renderer: 'canvas',
    autoplay: true,
    loop: true
  };

  private _stats: Array<CityResult> = [];

  public cityScoreChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          display: true,
          max: 100,
          min: 0
        }
      }]
    }
  };

  public cityParticipantsChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    labels: {
      display: true
    },
    scales: {
      xAxes: [{
        ticks: {
          display: true,
          min: 0,
          precision: 0
        }
      }]
    }
  };

  public cityScore: { cityLabels: Array<string>, cityResults: Array<number> } = {cityLabels: [], cityResults: []};
  public cityParticipants: { cityLabels: Array<string>, cityResults: Array<number> } = {
    cityLabels: [],
    cityResults: []
  };

  @Input()
  public set stats(stats: Array<CityResult>) {
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
    this.cityScore.cityLabels = this.citySuccessList.slice(0, Math.min(this.citySuccessList.length, 10)).map(city => city.name);
    this.cityScore.cityResults = this.citySuccessList.slice(0, Math.min(this.citySuccessList.length, 10)).map(city => city.avgScore);
    this.cityParticipantsList = this._stats.sort((a, b) => b.allResponders - a.allResponders).map(city => {
      return {participants: city.allResponders, name: city.city.name}
    });
    this.cityParticipants.cityLabels = this.cityParticipantsList.slice(0, Math.min(this.cityParticipantsList.length, 10)).map(city => city.name);
    this.cityParticipants.cityResults = this.cityParticipantsList.slice(0, Math.min(this.cityParticipantsList.length, 10)).map(city => city.participants);
  }

}
