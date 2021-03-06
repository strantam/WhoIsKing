import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {AngularFireAuth} from '@angular/fire/auth';

import {Observable, of} from 'rxjs';
import {switchMap} from "rxjs/operators";
import {auth} from 'firebase/app';
import {fetchUser, logout} from "../reducers/user/user";
import {select, Store} from "@ngrx/store";
import {State} from "../reducers";
import {User} from "../../../../wik-backend/src/openApi/model/user";


@Injectable({providedIn: 'root'})
export class AuthService {

  authUser: Observable<any>;
  private userDoc: User;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store<State>
  ) {
    this.store.pipe(select('user')).subscribe(user => this.userDoc = user);
    this.authUser = this.afAuth.authState.pipe(
      switchMap(user => {
        // Logged in
        if (user) {
          user.getIdToken()
            .then(token => {
              console.log('Auth service fetching user');
              localStorage.setItem("auth_token", token);
              if (!this.userDoc) {
                store.dispatch(fetchUser());
              }
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
    this.store.dispatch(logout());
    await this.router.navigate(['/game']);
    await this.router.navigate([{outlets: {'footerinfo': ['loggedout']}}])
  }
}
