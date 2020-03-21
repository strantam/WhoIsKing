import {Component, Inject, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {City} from "../../../../wik-backend/src/openApi/model/city";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import * as latinize from "latinize";
import {FormControl} from "@angular/forms";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-addcity',
  templateUrl: './add-city.component.html',
  styleUrls: ['./add-city.component.scss']
})
export class AddCityComponent implements OnInit {

  private cities: Array<City> = [];

  public filteredCitiesTop: Array<City> = [];

  public cityPickerCtrl = new FormControl();
  private selectedCityId: string;

  constructor(
    public dialogRef: MatDialogRef<AddCityComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private httpService: HttpHandlerService,
  ) {

  }

  private filterStates(value: string): Array<City> {
    let result: Array<City> = [];
    if (value.toLowerCase) {
      const filterValue = latinize(value).toLowerCase();
      result = this.cities.filter(city => latinize(city.name).toLowerCase().indexOf(filterValue) !== -1)
    }
    return result;
  }

  async ngOnInit() {
    this.cities = (await this.httpService.getCities()).sort((cityA, cityB) => cityA.name > cityB.name ? 1 : -1);

    const filteredCitiesObs = this.cityPickerCtrl.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterStates(state) : this.cities),
      );

    filteredCitiesObs.subscribe((filteredCities: Array<City>) => {
      this.filteredCitiesTop = filteredCities.slice(0, Math.min(filteredCities.length, 15));
    });
  }

  public async selectCity(cityId: string) {
    this.selectedCityId = cityId;
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public async saveCity() {
    if (!this.selectedCityId){
      console.warn("No selected city");
      return;
    }
    await this.httpService.setCity(this.selectedCityId);
    this.dialogRef.close();
  }
}
