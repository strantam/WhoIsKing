import {Component, OnInit} from '@angular/core';
import {AddCityComponent} from "../addcity/add-city.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss']
})
export class LoggedInComponent implements OnInit {

  public city;

  constructor(private dialog: MatDialog, private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
    this.city = (await this.httpHandlerService.getPersonalInfo()).cityName;
  }

  async openAddCity() {
    const dialogRef = this.dialog.open(AddCityComponent);
    await dialogRef.afterClosed().toPromise();
    this.city = (await this.httpHandlerService.getPersonalInfo()).cityName;
  }

}
