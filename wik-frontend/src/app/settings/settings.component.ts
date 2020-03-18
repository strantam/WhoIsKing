import {Component, OnInit} from '@angular/core';
import {HeaderTitleService} from "../navigation/header-title.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private headerTitleService: HeaderTitleService) {
    this.headerTitleService.subtitle = "Kis lépések alapítvány";

  }

  ngOnInit() {
  }

}
