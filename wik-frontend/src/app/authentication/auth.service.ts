import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {AngularFireAuth} from '@angular/fire/auth';

import {Observable, of} from 'rxjs';
import {switchMap} from "rxjs/operators";
import {auth} from 'firebase/app';
import {fetchUser} from "../reducers/user/user";
import {Store} from "@ngrx/store";
import {State} from "../reducers";


@Injectable({providedIn: 'root'})
export class AuthService {

  user: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store<State>
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        // Logged in
        if (user) {
          user.getIdToken()
            .then(token => {
              localStorage.setItem("auth_token", token);
              store.dispatch(fetchUser());
            })
            .catch(err => {
              console.log("Error getting id token", err)
            });
          return of(user);
        } else {
          localStorage.removeItem("auth_token");
          return of(null);
        }
      })
    )
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return credential.user;
  }

  async fbSignin() {
    const provider = new auth.FacebookAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return credential.user;
  }

  async signOut() {
    await this.afAuth.signOut();
    localStorage.removeItem("auth_token");
    await this.router.navigate(['/game']);
    await this.router.navigate([{outlets: {'footerinfo': ['loggedout']}}])
  }
}
