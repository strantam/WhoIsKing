import {Component, Input, OnInit} from '@angular/core';
import {GameResultAnswers} from "../../../../../../wik-backend/src/openApi/model/gameResultAnswers";

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {

  public answersChartOptions = {
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

  public answersData: { labels: Array<string>, results: Array<number> } = {
    labels: [],
    results: []
  };

  private _gameResult: Array<GameResultAnswers> = [];

  @Input()
  set gameResult(gameResult: Array<GameResultAnswers>) {
    this._gameResult = gameResult;
    this.calculateAnswers();
  };

  public visibleResult: Array<{ index: number, answer: string }> = [];

  constructor() {
  }

  ngOnInit() {
  }

  public calculateAnswers() {
    this.visibleResult = [];
    for (let i = 1; i <= this._gameResult.length; i++) {
      this.visibleResult.push({index: i, answer: this._gameResult[i - 1].answer});
      this.answersData.labels.push(i.toString());
      this.answersData.results.push(this._gameResult[i - 1].ratio);
    }
  }

}
