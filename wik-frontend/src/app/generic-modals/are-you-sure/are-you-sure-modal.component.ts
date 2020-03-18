import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AreYouSureCancel, AreYouSureOk, AreYouSureTitle} from "../../EnumInternalization";

export interface AreYouSureComponentData {
  question: AreYouSureTitle;
  cancel?: AreYouSureCancel;
  ok: AreYouSureOk;
}

@Component({
  selector: 'app-are-you-sure',
  templateUrl: './are-you-sure.component.html',
  styleUrls: ['./are-you-sure.component.scss']
})
export class AreYouSureModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AreYouSureModalComponent>, @Inject(MAT_DIALOG_DATA) public data: AreYouSureComponentData) {
  }

  ngOnInit() {
  }

  public onNoClick() {
    this.dialogRef.close();
  }

  public sure() {
    this.dialogRef.close(true);
  }
}
