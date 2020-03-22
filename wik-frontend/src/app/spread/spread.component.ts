import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {CityWithRegs} from "../../../../wik-backend/src/openApi/model/cityWithRegs";
import WeightedLocation = google.maps.visualization.WeightedLocation;
declare var google: any;

@Component({
  selector: 'app-spread',
  templateUrl: './spread.component.html',
  styleUrls: ['./spread.component.scss']
})
export class SpreadComponent implements OnInit {
  public allRegs: number;
  public registrations: Array<CityWithRegs> = [];
  private map: google.maps.Map = null;
  private heatmap: google.maps.visualization.HeatmapLayer = null;

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

  public async onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    await this.getRegistrations();

    const coords: Array<WeightedLocation> = this.getLatLng();
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: coords
    });
  }

  public getLatLng(): Array<WeightedLocation> {
    const resLatLng: Array<WeightedLocation> = [];
    for (const registration of this.registrations) {
      resLatLng.push({
        location: new google.maps.LatLng(registration.city.lat, registration.city.lng),
        weight: registration.registrations
      });
    }
    return resLatLng;
  }

}
