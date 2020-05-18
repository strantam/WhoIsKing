import {finalize} from 'rxjs/operators';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {State} from "../../reducers";
import {addSpinner, removeSpinner} from "../../reducers/spinner/spinner";
import {Injectable} from "@angular/core";

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  count = 0;

  constructor(private store: Store<State>) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.store.dispatch(addSpinner());

    this.count++;

    return next.handle(req)

      .pipe(finalize(() => {
          this.count--;
          if (this.count == 0) {
            this.store.dispatch(removeSpinner());
          }
        })
      );
  }
}
