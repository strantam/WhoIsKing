import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {City} from "../../../../wik-backend/src/openApi/model/city";
import {Game} from "../../../../wik-backend/src/openApi/model/game";

import {environment} from "../../environments/environment";
import {CityWithRegs} from "../../../../wik-backend/src/openApi/model/cityWithRegs";
import {ResultAfterGame} from "../../../../wik-backend/src/openApi/model/resultAfterGame";
import {User} from "../../../../wik-backend/src/openApi/model/user";
import {Level} from "../../../../wik-backend/src/openApi/model/level";
import {GameModel} from "../model/GameModel";
import {Statistics} from "../../../../wik-backend/src/openApi/model/statistics";

@Injectable({
  providedIn: 'root'
})
export class HttpHandlerService {

  constructor(private httpClient: HttpClient) {
  }

  public async getCities(): Promise<Array<City>> {
    try {
      return await this.httpClient.get<Array<City>>(environment.apiUrl + 'city').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting cities", err);
    }
  }

  public async getLevels(): Promise<Array<Level>> {
    try {
      return await this.httpClient.get<Array<Level>>(environment.apiUrl + 'level').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting levels", err);
    }
  }

  public async setCity(uid: string): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'user/me/city', {cityId: uid}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post city", err);
    }
  }

  public async getPersonalInfo(): Promise<User> {
    try {
      return await this.httpClient.get<User>(environment.apiUrl + 'user/me').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get personal info", err);
    }
  }

  public async getNextGame(): Promise<GameModel> {
    try {
      const nextGame = await this.httpClient.get<{ uid: string, openTime: string, closeTime: string, currentTime: string, changeToGuessTime: string }>(environment.apiUrl + 'game/next').toPromise();
      return {
        uid: nextGame.uid,
        openTime: new Date(nextGame.openTime),
        closeTime: new Date(nextGame.closeTime),
        currentTime: new Date(nextGame.currentTime),
        changeToGuessTime: new Date(nextGame.changeToGuessTime),
        frontendTime: new Date(),
      }
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting next game", err);
    }
  }

  public async getQuestion(gameId: string): Promise<GameModel> {
    try {
      const question = await this.httpClient.get<Game>(environment.apiUrl + 'game/' + gameId).toPromise();

      return {
        ...question,
        openTime: new Date(question.openTime),
        closeTime: new Date(question.closeTime),
        currentTime: new Date(question.currentTime),
        changeToGuessTime: new Date(question.changeToGuessTime),
        frontendTime: new Date(),
      }
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get question", err);
    }
  }

  public async getAllGames(askedQuestions: boolean): Promise<Array<Game>> {
    try {
      const param = askedQuestions ? {askedQuestion: 'true'} : {};
      return await this.httpClient.get<Array<Game>>(environment.apiUrl + 'game/', {params: param}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get question", err);
    }
  }

  public async getOwnGames(askedQuestions: boolean): Promise<Array<Game>> {
    try {
      const param = askedQuestions ? {askedQuestion: 'true'} : {};
      return await this.httpClient.get<Array<Game>>(environment.apiUrl + 'game/own', {params: param}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error get question", err);
    }
  }

  public async postAnswer(answerId: string, gameId: string): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'game/' + gameId + '/solution', {answer: answerId}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post answer", err);
    }
  }

  public async postGuess(answerId: string, gameId: string): Promise<{ points: number }> {
    try {
      return await this.httpClient.post<{ points: number }>(environment.apiUrl + 'game/' + gameId + '/guess', {answer: answerId}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post answer", err);
    }
  }

  public async postVote(gameId: string): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'game/' + gameId + '/vote', {}).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post answer", err);
    }
  }

  public async postQuestion(question: Game): Promise<void> {
    try {
      await this.httpClient.post(environment.apiUrl + 'game', question).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error post question", err);
    }
  }

  public async getGameResults(gameId: string): Promise<ResultAfterGame> {
    try {
      return await this.httpClient.get<ResultAfterGame>(environment.apiUrl + 'game/' + gameId + '/result').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting game results", err);
    }
  }

  public async getStatistics(fromDate?: string): Promise<Statistics> {
    try {
      const param = fromDate ? {datePicker: fromDate} : {};
      return await this.httpClient.get<Statistics>(environment.apiUrl + 'game/result', {
        params: param
      }).toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting stats", err);
    }
  }


  public async getRegistrations(): Promise<Array<CityWithRegs>> {
    try {
      return await this.httpClient.get<Array<CityWithRegs>>(environment.apiUrl + 'city/registrations').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting registrations", err);
    }
  }

  public async removeUser(): Promise<void> {
    try {
      await this.httpClient.delete(environment.apiUrl + 'user/me').toPromise();
    } catch (err) {
      // TODO handle errors on ui
      console.error("Error getting registrations", err);
    }
  }
}
