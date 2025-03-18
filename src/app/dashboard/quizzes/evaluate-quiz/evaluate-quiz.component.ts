import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../../services/user.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-evaluate-quiz',
  templateUrl: './evaluate-quiz.component.html',
  styleUrl: './evaluate-quiz.component.scss'
})
export class EvaluateQuizComponent implements OnChanges {
  @Input() atmptId = -1;
  quizDetails: any = {};
  questions: any[] = [];
  marksArray: FormControl[] = [];

  constructor(public user: UserService, public http: HttpService, public router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.http.get(`/get-quiz-attempt-details${this.user.mode=='teacher' ? '-to-evaluate' : ''}?attempt_id=${this.atmptId}`, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.quizDetails = {...res.details};
      console.log(this.quizDetails.json);
      for(let i=0; this.quizDetails.json[i]; i++) {
        this.questions.push(this.quizDetails.json[i]);
        this.marksArray.push(new FormControl(String(this.quizDetails.json[i].marksGained)));
      }
    }).catch(console.warn);
  }

  getTotalMarksGained() {
    let totalMarksGained = 0;
    for(let i=0; i<this.marksArray.length; i++) {
      let marks = Number(this.marksArray[i].value);
      if(!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(this.marksArray[i].value) || marks > this.questions[i].marks) {
        console.log(i, this.marksArray[i].value, !/^(0 | [1-9][0-9]*)(\.[0-9]+)?$/.test(this.marksArray[i].value))
        return "N/A";
      }
      totalMarksGained += marks;
    }
    return totalMarksGained;
  }

  updateMarks() {
    let totalMarksGained = this.getTotalMarksGained();
    if(totalMarksGained == "N/A") return;
    for(let i=0; i<this.questions.length; i++) {
      this.quizDetails.json[i].marksGained = Number(this.marksArray[i].value);
    }
    this.quizDetails.marks_gained = totalMarksGained;
    this.http.post(`/update-quiz-marks?atmpt_id=${this.atmptId}`, {marks_gained: this.quizDetails.marks_gained, json: this.quizDetails.json}, {headers: {token: window.localStorage.getItem("token") || ""}})
    .then((res:any) => {
      this.router.navigateByUrl(`/dashboard/${this.user.course.class_id}/quizzes`);
    }).catch(console.warn);
  }
}
