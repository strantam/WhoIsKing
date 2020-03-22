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
  private static tabDate: Map<number, string> = new Map([
    [0, "1D"],
    [1, "1W"],
    [2, "1M"],
    [3, "ALL"],
  ]);

  constructor(private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
    this.stats = await this.httpHandlerService.getStatistics("1D");
  }

  public async changeTab(event) {
    this.stats = await this.httpHandlerService.getStatistics(StatisticsPageComponent.tabDate.get(event.index));
  }

}
