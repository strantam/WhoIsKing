import {Component, OnInit} from '@angular/core';
import {AuthService} from "../authentication/auth.service";
import {AddCityComponent} from "../addcity/add-city.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {fetchUser} from "../reducers/user/user";
import {Store} from "@ngrx/store";
import {State} from "../reducers";
import {LoginComponent} from "../authentication/login/login.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public loggedIn: boolean = false;

  constructor(public authService: AuthService,
              private dialog: MatDialog,
              private httpHandlerService: HttpHandlerService,
              private store: Store<State>) {
  }

  ngOnInit() {
    this.store.select('user').subscribe(user => {
      this.loggedIn = !!user;
    })
  }

  async openChangeCity() {
    const dialogRef = this.dialog.open(AddCityComponent, {height: '90%', minWidth: '40%'});
    await dialogRef.afterClosed().toPromise();
    this.store.dispatch(fetchUser());
  }

  async deleteUser() {
    await this.httpHandlerService.removeUser();
    await this.authService.signOut();
  }

  login() {
    this.dialog.open(LoginComponent, {autoFocus: false});
  }
}
