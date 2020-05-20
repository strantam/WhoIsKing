import {finalize} from 'rxjs/operators';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {State} from "../../reducers";
import {addSpinner, removeSpinner} from "../../reducers/spinner/spinner";
import {Injectable} from "@angular/core";
import Timer = NodeJS.Timer;

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  private count = 0;
  private addSpinnerTimeout: Timer;

  constructor(private store: Store<State>) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.count++;
    if (this.count === 1) {
      this.addSpinnerTimeout = setTimeout(() => {
        this.store.dispatch(addSpinner());
      }, 600)
    }
    return next.handle(req)
      .pipe(finalize(() => {
          this.count--;
          if (this.count === 0) {
            if (this.addSpinnerTimeout) {
              clearTimeout(this.addSpinnerTimeout);
              this.addSpinnerTimeout = null;
            }
            this.store.dispatch(removeSpinner());
          }
        })
      );
  }
}
