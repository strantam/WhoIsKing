import {Component, OnInit} from '@angular/core';
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {GameResultAnswers} from "../../../../../wik-backend/src/openApi/model/gameResultAnswers";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {addSpinner, removeSpinner} from "../../reducers/spinner/spinner";

@Component({
  selector: 'app-asked-question',
  templateUrl: './asked-question.component.html',
  styleUrls: ['./asked-question.component.css']
})
export class AskedQuestionComponent implements OnInit {
  private allOwner: boolean = true;
  public questions: Array<Game> = [];
  public user$: Observable<User>;

  public questionSpinner: boolean = false;

  public results: Map<string, Array<GameResultAnswers>> = new Map();

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
  }

  async ngOnInit(): Promise<void> {
    await this.getQuestions();
    this.user$ = this.store.pipe(select('user'))
  }

  public async getQuestions() {
    this.store.dispatch(addSpinner());
    if (this.allOwner) {
      this.questions = await this.httpHandlerService.getAllGames(true);
    } else {
      this.questions = await this.httpHandlerService.getOwnGames(true);
    }
    this.store.dispatch(removeSpinner());
  }

  public async changeOwner(event) {
    this.allOwner = event.index === 0;
    await this.getQuestions();
  }

  public async openQuestionPanel(gameId: string): Promise<void> {
    if (!this.results.has(gameId)) {
      this.questionSpinner = true;
      this.results.set(gameId, []);
      const currentGameResults = await this.httpHandlerService.getGameResults(gameId);
      if (currentGameResults && currentGameResults.gameResult) {
        this.results.set(gameId, currentGameResults.gameResult.answers);
      }
      this.questionSpinner = false;
    }
  }
}
