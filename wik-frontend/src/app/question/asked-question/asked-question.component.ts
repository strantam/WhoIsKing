import {Component, OnInit} from '@angular/core';
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {GameResultAnswers} from "../../../../../wik-backend/src/openApi/model/gameResultAnswers";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";

@Component({
  selector: 'app-asked-question',
  templateUrl: './asked-question.component.html',
  styleUrls: ['./asked-question.component.css']
})
export class AskedQuestionComponent implements OnInit {
  private allOwner: boolean = true;
  public questions: Array<Game> = [];
  public user$: Observable<User>;


  public results: Map<string, Array<GameResultAnswers>> = new Map();

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
  }

  ngOnInit(): void {
    this.getQuestions();
    this.user$ = this.store.pipe(select('user'))
  }

  public async getQuestions() {
    if (this.allOwner) {
      this.questions = await this.httpHandlerService.getAllGames(true);
    } else {
      this.questions = await this.httpHandlerService.getOwnGames(true);
    }
  }

  public async changeOwner(event) {
    this.allOwner = event.index === 0;
    await this.getQuestions();
  }

  public async openQuestionPanel(gameId: string): Promise<void> {
    if (!this.results.has(gameId)) {
      this.results.set(gameId, []);
      const currentGameResults = await this.httpHandlerService.getGameResults(gameId);
      console.log(currentGameResults);
      this.results.set(gameId, currentGameResults.gameResult.answers);
    }
  }
}
