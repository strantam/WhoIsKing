import {Component, OnDestroy, OnInit} from '@angular/core';
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {GameResultAnswers} from "../../../../../wik-backend/src/openApi/model/gameResultAnswers";
import {Observable, Subject} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {takeUntil} from "rxjs/operators";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-asked-question',
  templateUrl: './asked-question.component.html',
  styleUrls: ['./asked-question.component.css']
})
export class AskedQuestionComponent implements OnInit, OnDestroy {
  private scrolledDown$: Subject<void> = new Subject<void>();

  private section: number = 0;
  private lastSection: boolean = false;

  private unsubscribe$: Subject<void> = new Subject<void>();

  private allOwner: boolean = true;
  public questions: Array<Game> = [];
  public user$: Observable<User>;

  public questionSpinner: boolean = false;

  public results: Map<string, Array<GameResultAnswers>> = new Map();

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
    this.scrolledDown$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.getQuestions(++this.section);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getQuestions(0, true);
    this.user$ = this.store.pipe(select('user'))
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public async getQuestions(section: number, newList: boolean = false) {
    this.lastSection = !newList && this.lastSection;
    if (this.lastSection){
      return;
    }
    let newQuestions;
    if (this.allOwner) {
      newQuestions = await this.httpHandlerService.getAllGames(true, section);
    } else {
      newQuestions = await this.httpHandlerService.getOwnGames(true, section);
    }
    if (newQuestions.length < environment.questionGetLimit){
      this.lastSection = true;
    }
    if (newList){
      this.questions = newQuestions;
    } else {
      this.questions = this.questions.concat(newQuestions);
    }
  }

  public scrolledDown() {
    this.scrolledDown$.next();
  }

  public async changeOwner(event) {
    this.allOwner = event.index === 0;
    this.section = 0;
    await this.getQuestions(0, true);
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
