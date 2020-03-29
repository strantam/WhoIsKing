import {Component, Input, OnInit} from '@angular/core';
import {Statistics} from "../../../../wik-backend/src/openApi/model/statistics";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  @Input()
  public stats: Statistics;



  constructor() {
  }

  ngOnInit() {

  }
}
