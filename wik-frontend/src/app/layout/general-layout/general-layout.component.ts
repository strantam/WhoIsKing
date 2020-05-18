import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {select, Store} from "@ngrx/store";
import {State} from "../../reducers";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  styleUrls: ['./general-layout.component.scss']
})
export class GeneralLayoutComponent implements OnInit, OnDestroy {
  public spinner: boolean;
  public unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private store: Store<State>) {
  }

  ngOnInit() {
    this.router.navigate([{outlets: {'footerinfo': ['loggedin']}}]);
    this.store.pipe(select('spinner'), takeUntil(this.unsubscribe$)).subscribe(spinnerState => this.spinner = spinnerState);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
