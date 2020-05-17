import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {LoginComponent} from "../../authentication/login/login.component";
import {MatDialog} from "@angular/material/dialog";
import {AskQuestionComponent} from "../ask-question/ask-question.component";
import {HttpHandlerService} from "../../http-service/http-handler.service";
import {Game} from "../../../../../wik-backend/src/openApi/model/game";
import {addSpinner, removeSpinner} from "../../reducers/spinner/spinner";
import {askQuestion} from "../../reducers/user/user";

@Component({
  selector: 'app-footer',
  templateUrl: './question-footer.component.html',
  styleUrls: ['./question-footer.component.css']
})
export class QuestionFooterComponent implements OnInit {
  public user$: Observable<User>;

  constructor(private store: Store<State>, private dialog: MatDialog, private httpHandlerService: HttpHandlerService) {
  }

  ngOnInit(): void {
    this.user$ = this.store.pipe(select('user'))
  }

  async login() {
    this.dialog.open(LoginComponent, {autoFocus: false});
  }

  async askQuestion() {
    const dialogRef = this.dialog.open(AskQuestionComponent, {autoFocus: false});
    const result = await dialogRef.afterClosed().toPromise();
    this.store.dispatch(addSpinner());
    const question: Game = {
      question: result.question,
      answers: result.answers.map((answer: string) => ({answer: answer}))
    };
    await this.httpHandlerService.postQuestion(question);
    this.store.dispatch(askQuestion());
    this.store.dispatch(removeSpinner());

  }

}
