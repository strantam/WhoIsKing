import {Component, OnInit} from '@angular/core';
import {AddCityComponent} from "../addcity/add-city.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {User} from "../../../../wik-backend/src/openApi/model/user";
import {Level} from "../../../../wik-backend/src/openApi/model/level";

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss']
})
export class LoggedInComponent implements OnInit {

  public user: User;
  public levels: Array<Level> = [];

  constructor(private dialog: MatDialog, private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
    this.refreshUser();
    this.levels = await this.httpHandlerService.getLevels();
  }

  async openAddCity() {
    const dialogRef = this.dialog.open(AddCityComponent);
    await dialogRef.afterClosed().toPromise();
    this.refreshUser();
  }

  async refreshUser() {
    this.user = await this.httpHandlerService.getPersonalInfo();

  }

  public getNextLevel(levelIndex: number): Level {
    return this.levels[this.levels.findIndex(level => level.index === levelIndex) + 1];
  }

}
