import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.css']
})
export class AskQuestionComponent implements OnInit {
  public askQuestionForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AskQuestionComponent>, private formBuilder: FormBuilder) {
    this.askQuestionForm = this.formBuilder.group({
      question: ['', [
        Validators.required
      ]],
      answers: this.formBuilder.array([this.formBuilder.control('')])
    });
  }

  ngOnInit(): void {
  }


  public save() {
    const {value, valid} = this.askQuestionForm;
    if (valid) {
      this.dialogRef.close(value);
    }
  }

  get answers() {
    return this.askQuestionForm.get('answers') as FormArray;
  }

  addAnswer() {
    this.answers.push(this.formBuilder.control(''));
  }
}
