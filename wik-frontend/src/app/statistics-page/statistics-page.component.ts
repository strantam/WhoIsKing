import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {Statistics} from "../../../../wik-backend/src/openApi/model/statistics";

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss']
})
export class StatisticsPageComponent implements OnInit {
  public spinner: boolean = false;

  public stats: Statistics;
  public userSelected: boolean = true;

  private selectedDateTabUser = 0;
  private selectedDateTabCity = 0;
  private static tabDate: Map<number, string> = new Map([
    [0, "1D"],
    [1, "1W"],
    [2, "1M"],
    [3, "ALL"],
  ]);

  constructor(private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
    this.spinner = true;
    this.stats = await this.httpHandlerService.getStatistics("1D");
    this.spinner = false;
  }

  public async changeType(event) {
    this.spinner = true;
    this.userSelected = event.index === 0;
    this.stats = await this.httpHandlerService.getStatistics(StatisticsPageComponent.tabDate.get(this.userSelected ? this.selectedDateTabUser : this.selectedDateTabCity));
    this.spinner = false;

  }

  public async changeDate(event) {
    this.spinner = true;
    this.userSelected ? this.selectedDateTabUser = event.index : this.selectedDateTabCity = event.index;
    this.stats = await this.httpHandlerService.getStatistics(StatisticsPageComponent.tabDate.get(event.index));
    this.spinner = false;

  }

}
