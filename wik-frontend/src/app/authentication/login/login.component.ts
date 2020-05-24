import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public lottieConfig: AnimationOptions = {
    path: '/assets/animations/login-animation.json',
    renderer: 'canvas',
    autoplay: true,
    loop: true
  };

  constructor(public dialogRef: MatDialogRef<LoginComponent>,
              @Inject(MAT_DIALOG_DATA) public data,
              public auth: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.auth.authUser.subscribe(user => {
      if (user) {
        this.router.navigate([{outlets: {'footerinfo': ['loggedin']}}]);
        this.dialogRef.close();
      }
    });
  }

  public googleSignin() {
    this.auth.googleSignin();
    this.dialogRef.close();
  }

  public fbSignin() {
    this.auth.fbSignin();
    this.dialogRef.close();
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}
