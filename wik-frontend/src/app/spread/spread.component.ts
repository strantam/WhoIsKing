import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {CityWithRegs} from "../../../../wik-backend/src/openApi/model/cityWithRegs";

@Component({
  selector: 'app-spread',
  templateUrl: './spread.component.html',
  styleUrls: ['./spread.component.scss']
})
export class SpreadComponent implements OnInit {
  public allRegs: number;
  public registrations: Array<CityWithRegs> = [];
  private map = null;
  private heatmap = null;

  constructor(private httpHandlerService: HttpHandlerService) {
  }

  async ngOnInit() {
  }

  async getRegistrations() {
    this.registrations = await this.httpHandlerService.getRegistrations();
    this.allRegs = this.registrations.reduce<number>((prev, current) => {
      return prev + current.registrations;
    }, 0)
  }

  public async onMapLoad(mapInstance) {
    this.map = mapInstance;
    await this.getRegistrations();

    const coords: Array<any> = this.getLatLng();
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: coords
    });
  }

  public getLatLng() {
    const resLatLng = [];
    for (const registration of this.registrations) {
      resLatLng.push({
        location: new google.maps.LatLng(registration.city.lat, registration.city.lng),
        weight: registration.registrations
      });
    }
    return resLatLng;
  }

}
