import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {City} from "../../../../wik-backend/src/openApi/model/city";
import {Game} from "../../../../wik-backend/src/openApi/model/game";

import {environment} from "../../environments/environment";
import {GameResult} from "../../../../wik-backend/src/openApi/model/gameResult";
import {CityWithRegs} from "../../../../wik-backend/src/openApi/model/cityWithRegs";
import {ResultAfterGame} from "../../../../wik-backend/src/openApi/model/resultAfterGame";
import {User} from "../../../../wik-backend/src/openApi/model/user";

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

  public async getPersonalInfo(): Promise<User> {
    try {
      return await this.httpClient.get<User>(environment.apiUrl + 'auth/user/me').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get personal info", err);
    }
  }

  public async getNextGame(): Promise<{ uid: string, openTime: Date, closeTime: Date, currentTime: Date, changeToGuessTime: Date }> {
    try {
      const nextGame = await this.httpClient.get<{ uid: string, openTime: string, closeTime: string, currentTime: string, changeToGuessTime: string }>(environment.apiUrl + 'noAuth/nextGame').toPromise();
      return {
        uid: nextGame.uid,
        openTime: new Date(nextGame.openTime),
        closeTime: new Date(nextGame.closeTime),
        currentTime: new Date(nextGame.currentTime),
        changeToGuessTime: new Date(nextGame.changeToGuessTime)
      }
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting next game", err);
    }
  }

  public async getQuestion(gameId: string): Promise<Game> {
    try {
      return await this.httpClient.get<Game>(environment.apiUrl + 'noAuth/game/' + gameId).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get question", err);
    }
  }

  public async postAnswer(answerId: string, gameId: string): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'auth/game/' + gameId + '/solution', {answer: answerId}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post answer", err);
    }
  }

  public async postGuess(answerId: string, gameId: string): Promise<{ points: number }> {
    try {
      return await this.httpClient.post<{ points: number }>(environment.apiUrl + 'auth/game/' + gameId + '/guess', {answer: answerId}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post answer", err);
    }
  }


  public async getGameResults(gameId: string): Promise<ResultAfterGame> {
    try {
      return await this.httpClient.get<ResultAfterGame>(environment.apiUrl + 'noAuth/game/' + gameId + '/result').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting game results", err);
    }
  }

  public async getStatistics(fromDate?: string): Promise<Array<GameResult>> {
    try {
      const param = fromDate ? {datePicker: fromDate} : {};
      return await this.httpClient.get<Array<GameResult>>(environment.apiUrl + 'noAuth/game/result', {
        params: param
      }).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting stats", err);
    }
  }


  public async getRegistrations(): Promise<Array<CityWithRegs>> {
    try {
      return await this.httpClient.get<Array<CityWithRegs>>(environment.apiUrl + 'noAuth/city/registrations').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting registrations", err);
    }
  }

  public async removeUser(): Promise<void> {
    try {
      await this.httpClient.delete(environment.apiUrl + 'auth/user/me').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting registrations", err);
    }
  }
}
