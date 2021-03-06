import {Component, OnInit} from '@angular/core';
import {ResultAfterGame} from "../../../../../wik-backend/src/openApi/model/resultAfterGame";
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {Store} from "@ngrx/store";
import {State} from "../../reducers";
import {Observable} from "rxjs";
import {loadNewGame} from "../../reducers/game/gameObj/gameObj";

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})
export class GameStatisticsComponent implements OnInit {

  public stats: ResultAfterGame = {gameResult: {answers: []}, cityResult: []};
  public points$: Observable<number>;

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
    this.points$ = store.select("points");
  }

  async ngOnInit() {
    this.store.select('game').subscribe(async game => {
      this.stats = await this.httpHandlerService.getGameResults(game.uid);
    })
  }

  public finishRound() {
    this.store.dispatch(loadNewGame());
  }
}
