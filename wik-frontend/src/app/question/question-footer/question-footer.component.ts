import { Component, OnInit } from '@angular/core';
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {LoginComponent} from "../../authentication/login/login.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-footer',
  templateUrl: './question-footer.component.html',
  styleUrls: ['./question-footer.component.css']
})
export class QuestionFooterComponent implements OnInit {
  public user$: Observable<User>;

  constructor(private store: Store<State>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.user$ = this.store.pipe(select('user'))
  }

  async login() {
    this.dialog.open(LoginComponent, {autoFocus: false});
  }

  async askQuestion() {
    console.log('add question');
  }

}
