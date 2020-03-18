import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public lottieConfig: Object;

  constructor(public auth: AuthService,
              private router: Router) {
    this.lottieConfig = {
      path: '/assets/animations/login-animation.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  public googleSignin(){
    this.auth.googleSignin();
  }

  public fbSignin(){
    this.auth.fbSignin();
  }

}
