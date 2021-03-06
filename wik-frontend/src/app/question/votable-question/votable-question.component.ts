import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {vote} from "../../reducers/user/user";
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {environment} from "../../../environments/environment";
import {Observable, Subject} from "rxjs";
import {pairwise, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-votable-question',
  templateUrl: './votable-question.component.html',
  styleUrls: ['./votable-question.component.css']
})
export class VotableQuestionComponent implements OnInit, OnDestroy {
  private scrolledDown$: Subject<void> = new Subject<void>();
  private section: number = 0;
  private lastSection: boolean = false;

  public readonly topQuestions = environment.questionsPerDay;

  public allOwner: boolean = true;
  public questions: Array<Game> = [];
  public user$: Observable<User>;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
    this.scrolledDown$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.getQuestions(++this.section);
    });
  }

  async ngOnInit(): Promise<void> {
    this.user$ = this.store.pipe(select('user'));
    this.store.pipe(select('user'), pairwise<User>(), takeUntil(this.unsubscribe$)).subscribe(([prevUser, currentUser]) => {
      if (!prevUser || !currentUser) {
        return;
      }
      if (prevUser.questions !== currentUser.questions) {
        this.getQuestions(0, true);
      }
    });
    await this.getQuestions(0, true);
  }

  public async getQuestions(section: number, newList: boolean = false) {
    this.lastSection = !newList && this.lastSection;
    if (this.lastSection) {
      return;
    }
    let newQuestions;
    if (this.allOwner) {
      newQuestions = await this.httpHandlerService.getAllGames(false, section);
    } else {
      newQuestions = await this.httpHandlerService.getOwnGames(false, section);
    }
    if (newQuestions.length < environment.questionGetLimit) {
      this.lastSection = true;
    }
    if (newList) {
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

  public async vote(questionId) {
    await this.httpHandlerService.postVote(questionId);
    this.store.dispatch(vote());
    this.questions.find(question => question.uid === questionId).votes++;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
