import {Component, OnInit} from '@angular/core';
import {HttpHandlerService} from "../http-service/http-handler.service";
import {Game} from "../../../../wik-backend/src/openApi/model/game";

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  public asked: boolean = false;

  public askedForAllOwner: boolean = true;
  public notAskedForAllOwner: boolean = true;

  public questions: Array<Game> = [];

  constructor(private httpHandlerService: HttpHandlerService) {
  }

  ngOnInit(): void {
  }

  public async changeAsked(event) {
    this.asked = event.index !== 0;
    this.getQuestions();
  }

  public async changeOwner(event) {
    this.asked ? this.askedForAllOwner = event.index === 0 : this.notAskedForAllOwner = event.index === 0;
    this.getQuestions();
  }

  public async getQuestions() {
    if (this.asked && this.askedForAllOwner || (!this.asked && this.notAskedForAllOwner)) {
      this.questions = await this.httpHandlerService.getAllGames(this.asked);
    } else {
      this.questions = await this.httpHandlerService.getOwnGames(this.asked);
    }
  }


}
