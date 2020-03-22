import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {GameResult} from "../../../../wik-backend/src/openApi/model/gameResult";

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss']
})
export class StatisticsPageComponent implements OnInit {

  public stats: Array<GameResult> = [];

  constructor(private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
    this.stats = await this.httpHandlerService.getStatistics();
  }

}
