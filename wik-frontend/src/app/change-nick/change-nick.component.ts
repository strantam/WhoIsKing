import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {HttpHandlerService} from "../http-service/http-handler.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-change-nick',
  templateUrl: './change-nick.component.html',
  styleUrls: ['./change-nick.component.css']
})
export class ChangeNickComponent implements OnInit {
  public wrongNick = false;
  public nameCtrl = new FormControl();

  constructor(public dialogRef: MatDialogRef<ChangeNickComponent>, private httpService: HttpHandlerService) {
  }

  ngOnInit(): void {
  }

  public onNoClick() {
    this.dialogRef.close();
  }

  public async saveNick() {
    this.wrongNick = false;
    try {
      await this.httpService.changeNick(this.nameCtrl.value);
      this.dialogRef.close();

    } catch (err) {
      console.log('Error on saving new nickname');
      this.wrongNick = true;
    }
  }
}
