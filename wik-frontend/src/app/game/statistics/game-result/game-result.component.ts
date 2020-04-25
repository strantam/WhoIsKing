import {Component, Input, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {State} from "../../../reducers";
import {GameModel} from "../../../model/GameModel";
import {GameAnswers} from "../../../../../../wik-backend/src/openApi/model/gameAnswers";
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
  private answers: Array<GameAnswers> = [];

  @Input()
  set gameResult(gameResult: Array<GameResultAnswers>) {
    this._gameResult = gameResult;
    this.calculateAnswers();
  };

  public visibleResult: Array<string> = [];

  constructor(private store: Store<State>) {
  }

  ngOnInit() {
    this.store.select('game').subscribe((game: GameModel) => {
      this.answers = game.answers;
      this.calculateAnswers();
    })
  }

  public calculateAnswers() {
    this.visibleResult = [];
    let i = 1;
    for (const result of this._gameResult) {
      const answer = this.answers.find(answer => {
        return answer.uid === result.uid;
      });
      this.visibleResult.push(i + ' ' + answer.answer);
      this.answersData.labels.push(i.toString());
      i++;
      this.answersData.results.push(result.ratio);
    }
  }

}
