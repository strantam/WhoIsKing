import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";
import {SnackbarTexts} from "../../EnumInternalization";

export interface I18nSnackBarData {
  text: SnackbarTexts
}

@Component({
  selector: 'app-i18n-snack-bar',
  templateUrl: './i18n-snack-bar.component.html',
  styleUrls: ['./i18n-snack-bar.component.scss']
})
export class I18nSnackBarComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: I18nSnackBarData) { }

  ngOnInit() {
  }

}
