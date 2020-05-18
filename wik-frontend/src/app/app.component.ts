import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wik';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      "google-logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/login/google.svg')
    );
    this.matIconRegistry.addSvgIcon(
      "facebook-logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/login/facebook.svg')
    );
  }

  ngOnInit(): void {
  }


}
