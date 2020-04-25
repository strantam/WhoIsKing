import { Component, OnInit } from '@angular/core';
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  public lottieConfig: AnimationOptions = {
    path: '/assets/animations/sad-emoji.json',
    renderer: 'canvas',
    autoplay: true,
    loop: true
  };
  constructor() { }

  ngOnInit(): void {
  }

}
