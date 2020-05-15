import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {HeaderTitleService} from "../header-title.service";
import {State} from "../../reducers";
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {User} from "../../../../../wik-backend/src/openApi/model/user";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public user$: Observable<User>;

  @Output() public sidenavToggle = new EventEmitter();
  @Output() public sidenavSettingsToggle = new EventEmitter();

  constructor(
    private router: Router,
    public headerTitleService: HeaderTitleService,
    public store: Store<State>,
  ) {
  }

  ngOnInit() {
    this.user$ = this.store.pipe(select('user'))
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };

  public onToggleSettings = () => {
    this.sidenavSettingsToggle.emit();
  };

  public navigateBack() {
    const currentURL = this.router.url;
    this.router.navigateByUrl(currentURL.substring(0, currentURL.lastIndexOf('/')));
  }
}
