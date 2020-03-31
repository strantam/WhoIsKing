import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {HeaderTitleService} from "../header-title.service";
import {AuthService} from "../../authentication/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  @Output() public sidenavToggle = new EventEmitter();

  constructor(private router: Router, public headerTitleService: HeaderTitleService, public authService: AuthService) {
  }

  ngOnInit() {
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };

  public navigateBack() {
    const currentURL = this.router.url;
    this.router.navigateByUrl(currentURL.substring(0, currentURL.lastIndexOf('/')));
  }
}
