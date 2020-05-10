import {Component, OnInit} from '@angular/core';
@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  public asked: boolean = false;

  constructor() {
  }

  ngOnInit(): void {

  }

  public async changeAsked(event) {
    this.asked = event.index !== 0;
  }



}
