import {Injectable} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, map, mergeMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class HeaderTitleService {


  private _navigationOff: boolean;
  private _hideBack: boolean;
  private _subtitle: string;

  constructor(private router: Router, public titleService: Title, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data))
      .subscribe((event) => {
        this.titleService.setTitle(event['title']);
        this._navigationOff = event['navigationOff'];
        this._hideBack = event['hideBack'];
      });
  }

  get title() {
    return this.titleService.getTitle()
  }

  set subtitle(newSubtitle: string) {
    this._subtitle = newSubtitle;
  }

  get subtitle() {
    return this._subtitle;
  }

  get navigationOff(): boolean {
    return this._navigationOff;
  }

  get hideBack(): boolean {
    return this._hideBack;
  }
}
