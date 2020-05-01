import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {State} from "../reducers";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {Level} from "../../../../wik-backend/src/openApi/model/level";

@Component({
  selector: 'app-level-change',
  templateUrl: './level-change.component.html',
  styleUrls: ['./level-change.component.css']
})
export class LevelChangeComponent implements OnInit {
  public userLevel: number;
  private levels: Array<Level>;
  public selectedLevel: Level;

  constructor(private store: Store<State>, private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit(): Promise<void> {
    this.levels = await this.httpHandlerService.getLevels();
    this.store.select('user').subscribe(user => {
      this.userLevel = user.currentLevel;
      this.selectedLevel = this.levels.find(level => level.index === this.userLevel);
    })
  }

}
