import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../../services/user.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-show-quiz-attempts',
  templateUrl: './show-quiz-attempts.component.html',
  styleUrl: './show-quiz-attempts.component.scss'
})
export class ShowQuizAttemptsComponent implements OnChanges {
  @Input() quizId = -1;
  quizAttempts: any[] = [];
  constructor(public user: UserService, public http: HttpService, public router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.http.get(`/get-${this.user.mode=='teacher' ? 'all' : 'student'}-quiz-attempts?quiz_id=${this.quizId}`, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.quizAttempts = res.attempts;
    }).catch(console.warn);
  }

  showQuizResult(attempt: number) {
    this.router.navigateByUrl(`/dashboard/${this.user.course.class_id}/quizzes/quiz-attempt-details/${attempt}`);
  }
}
