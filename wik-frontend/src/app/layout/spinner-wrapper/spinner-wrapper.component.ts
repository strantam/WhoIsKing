import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-spinner-wrapper',
  templateUrl: './spinner-wrapper.component.html',
  styleUrls: ['./spinner-wrapper.component.css']
})
export class SpinnerWrapperComponent implements OnInit {
  @Input()
  public showSpinner: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
