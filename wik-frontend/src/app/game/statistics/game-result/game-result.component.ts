import {Component, Input, OnInit} from '@angular/core';
import {GameResult} from "../../../../../../wik-backend/src/openApi/model/gameResult";

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.scss']
})
export class GameResultComponent implements OnInit {

  @Input()
  public gameResult: GameResult;

  constructor() { }

  ngOnInit() {
  }

}
