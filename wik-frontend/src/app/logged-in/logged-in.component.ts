import {Component, OnInit} from '@angular/core';
import {AddCityComponent} from "../addcity/add-city.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {User} from "../../../../wik-backend/src/openApi/model/user";
import {Level} from "../../../../wik-backend/src/openApi/model/level";
import {State} from "../reducers";
import {select, Store} from "@ngrx/store";
import {fetchUser} from "../reducers/user/user";

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss']
})
export class LoggedInComponent implements OnInit {

  public user: User;
  public levels: Array<Level> = [];

  constructor(private dialog: MatDialog, private httpHandlerService: HttpHandlerService, private store: Store<State>) {
  }

  async ngOnInit() {
    this.store.pipe(select('user')).subscribe(user => {
      this.user = user;
    });
    this.levels = await this.httpHandlerService.getLevels();
  }

  async openAddCity() {
    const dialogRef = this.dialog.open(AddCityComponent, {height: '90%', minWidth: '40%'});
    await dialogRef.afterClosed().toPromise();
    console.log("Fetching user after adding city");
    this.store.dispatch(fetchUser());
  }

  public getNextLevel(levelIndex: number): Level {
    return this.levels[this.levels.findIndex(level => level.index === levelIndex) + 1];
  }

}
