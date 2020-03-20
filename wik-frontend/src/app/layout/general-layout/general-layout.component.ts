import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  styleUrls: ['./general-layout.component.scss']
})
export class GeneralLayoutComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {
    this.router.navigate([{ outlets: { 'footerinfo': ['loggedin'] }}]);
  }
}
