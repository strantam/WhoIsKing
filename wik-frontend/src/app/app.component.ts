import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {select, Store} from "@ngrx/store";
import {State} from "./reducers";
import {Observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wik';
  public spinner$: Observable<boolean>;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private store: Store<State>) {
    this.matIconRegistry.addSvgIcon(
      "google-logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/login/google.svg')
    );
    this.matIconRegistry.addSvgIcon(
      "facebook-logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/login/facebook.svg')
    );
  }

  ngOnInit(): void {
    this.spinner$ = this.store.pipe(select('spinner'));
  }


}
