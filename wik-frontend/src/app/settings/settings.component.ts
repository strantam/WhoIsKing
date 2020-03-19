import {Component, OnInit} from '@angular/core';
import {HeaderTitleService} from "../navigation/header-title.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private headerTitleService: HeaderTitleService, private httpClient: HttpClient) {
    this.headerTitleService.subtitle = "Kis lépések alapítvány";

  }

  ngOnInit() {
    console.log(this.httpClient.get(environment.apiUrl).toPromise());
  }

}
