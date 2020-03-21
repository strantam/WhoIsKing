import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {City} from "../../../../wik-backend/src/openApi/model/city";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HttpHandlerService {

  constructor(private httpClient: HttpClient) {
  }

  public async getCities(): Promise<Array<City>> {
    try {
      return await this.httpClient.get<Array<City>>(environment.apiUrl + 'noAuth/city').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting cities", err);
    }
  }

  public async setCity(uid: string): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'auth/city', {cityId: uid}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post city", err);
    }
  }

  public async getPersonalInfo(): Promise<{ cityName: string }> {
    try {
      return await this.httpClient.get<{ cityName: string }>(environment.apiUrl + 'auth/user/me').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post city", err);
    }
  }

  public async getNextGame(): Promise<{ uid: string, openTime: Date, closeTime: Date, currentTime: Date }> {
    try {
      const nextGame = await this.httpClient.get<{ uid: string, openTime: string, closeTime: string, currentTime: string }>(environment.apiUrl + 'noAuth/nextGame').toPromise();
      return {
        uid: nextGame.uid,
        openTime: new Date(nextGame.openTime),
        closeTime: new Date(nextGame.closeTime),
        currentTime: new Date(nextGame.currentTime)
      }
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post city", err);
    }
  }
}
