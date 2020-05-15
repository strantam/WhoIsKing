import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";
import {State} from "../../reducers";

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();
  public user$: Observable<User>;

  constructor(public store: Store<State>) { }

  ngOnInit() {
    this.user$ = this.store.pipe(select('user'))
  }
  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }
}
