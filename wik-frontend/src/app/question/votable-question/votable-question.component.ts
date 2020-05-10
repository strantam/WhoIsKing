import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {vote} from "../../reducers/user/user";
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-votable-question',
  templateUrl: './votable-question.component.html',
  styleUrls: ['./votable-question.component.css']
})
export class VotableQuestionComponent implements OnInit {
  public readonly topQuestions = environment.questionsPerDay;

  public allOwner: boolean = true;
  public questions: Array<Game> = [];
  public user: User;

  constructor(private httpHandlerService: HttpHandlerService, private store: Store<State>) {
  }

  ngOnInit(): void {
    this.store.pipe(select('user')).subscribe(user => {
      this.user = user;
    });
    this.getQuestions();
  }

  public async getQuestions() {
    if (this.allOwner) {
      this.questions = await this.httpHandlerService.getAllGames(false);
    } else {
      this.questions = await this.httpHandlerService.getOwnGames(false);
    }
  }

  public async changeOwner(event) {
    this.allOwner = event.index === 0;
    await this.getQuestions();
  }

  public async vote(questionId) {
    await this.httpHandlerService.postVote(questionId);
    this.store.dispatch(vote());
    await this.getQuestions();
  }
}
