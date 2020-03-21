import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-multiple-choice',
  templateUrl: './multiple-choice.component.html',
  styleUrls: ['./multiple-choice.component.scss']
})
export class MultipleChoiceComponent implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit() {
  }

}
