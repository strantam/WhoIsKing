import {Component, OnInit} from '@angular/core';
import {AuthService} from "../authentication/auth.service";
import {AddCityComponent} from "../addcity/add-city.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(public authService: AuthService, private dialog: MatDialog, private httpHandlerService: HttpHandlerService) {
  }

  ngOnInit() {
  }

  async openChangeCity() {
    const dialogRef = this.dialog.open(AddCityComponent);
    await dialogRef.afterClosed().toPromise();
    location.reload();
  }

  async deleteUser() {
    await this.httpHandlerService.removeUser();
    await this.authService.signOut();
  }

}
