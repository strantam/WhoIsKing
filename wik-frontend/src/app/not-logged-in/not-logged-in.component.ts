import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../authentication/login/login.component";

@Component({
  selector: 'app-not-logged-in',
  templateUrl: './not-logged-in.component.html',
  styleUrls: ['./not-logged-in.component.scss']
})
export class NotLoggedInComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  async login() {
    const dialogRef = this.dialog.open(LoginComponent);
  }

}
