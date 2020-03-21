import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";

@Component({
  selector: 'app-estimation',
  templateUrl: './estimation.component.html',
  styleUrls: ['./estimation.component.scss']
})
export class EstimationComponent implements OnInit {
  constructor(public gameService: GameService) { }

  ngOnInit() {
  }

}
