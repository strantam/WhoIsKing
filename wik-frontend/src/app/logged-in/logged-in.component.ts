import {Component, OnInit} from '@angular/core';
import {AuthService} from "../authentication/auth.service";

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss']
})
export class LoggedInComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

  logout() {
    this.authService.signOut()
  }

}
