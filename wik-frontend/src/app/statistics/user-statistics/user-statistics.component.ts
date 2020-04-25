import {Component, Input, OnInit} from '@angular/core';
import {UserResult} from "../../../../../wik-backend/src/openApi/model/userResult";

@Component({
  selector: 'app-user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.css']
})
export class UserStatisticsComponent implements OnInit {

  private _stats: Array<UserResult> = [];


  @Input()
  public set stats(stats: Array<UserResult>) {
    this._stats = stats;
    this._stats = stats ? stats : [];
    this.sortStats();
  }

  public userScoreChartOptions = {
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

  public userScore: { labels: Array<string>, results: Array<number> } = {
    labels: [],
    results: []
  };

  constructor() {
  }

  ngOnInit(): void {
  }

  sortStats() {
    const userSuccesslist = this._stats.sort((a, b) => b.points - a.points);
    this.userScore.labels = userSuccesslist.slice(0, Math.min(userSuccesslist.length, 10)).map(user => user.nickName);
    this.userScore.results = userSuccesslist.slice(0, Math.min(userSuccesslist.length, 10)).map(user => user.points);
  }

}
