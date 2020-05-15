import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {select, Store} from "@ngrx/store";
import { Subject} from "rxjs";
import {State} from "../reducers";
import {takeUntil} from "rxjs/operators";


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();
  public asked: boolean = false;

  constructor(private router: Router, private store: Store<State>) {
  }

  ngOnInit(): void {
    this.router.navigate([{outlets: {'footerinfo': ['question']}}]);
    this.store.pipe(select('user'), takeUntil(this.unsubscribe$)).subscribe(() => {
      this.router.navigate([{outlets: {'footerinfo': ['question']}}]);
    })
  }

  public async changeAsked(event) {
    this.asked = event.index !== 0;
  }

  async ngOnDestroy(): Promise<void> {
    setTimeout(() => {
      this.router.navigate([{outlets: {'footerinfo': ['loggedin']}}]);
    });
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
