import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, OnDestroy {
  public asked: boolean = false;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.router.navigate([{outlets: {'footerinfo': ['question']}}]);
  }

  public async changeAsked(event) {
    this.asked = event.index !== 0;
  }

  async ngOnDestroy(): Promise<void> {
    setTimeout(() => {
      this.router.navigate([{outlets: {'footerinfo': ['loggedin']}}]);
    });
  }
}
