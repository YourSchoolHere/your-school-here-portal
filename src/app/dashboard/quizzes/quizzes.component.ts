import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../services/http.service';
import { UserService } from '../../services/user.service';

declare type QuestionType = "sa" | "la" | "scq" | "mcq" | "code" | "draw";

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrl: './quizzes.component.scss'
})
export class QuizzesComponent {
  public subSection = "";
  public creatingNewQuizNow = false;
  public isStudentModeActive = false;
  public quiz_id = -1;
  public quizzes: {title: string, [k: string]: any}[] = [];
  public quizTitle = "";
  public questions: {type: QuestionType, question: FormControl, answer: FormControl, [k: string]: any}[] = [];

  public canAttemptRightNow = false;
  public atmptId = -1;

  public startDt = new Date();
  public endDt = new Date();

  public timeLimit = "30";
  public maxAttempts = "1";

  public timeLeft = "";
  public timeUpdateInterval: any;
  public timeLeftTimeout: any;

  constructor(private http: HttpService, public user: UserService, public router: Router) {
    this.atmptId = -1;
    if(router.url.includes("show-quiz-attempts-for")) {
      let quiz_id = Number(router.url.split("/")[5]);
      if(isNaN(quiz_id)) {
        router.navigateByUrl(`/dashboard/${this.user.course.class_id}/quizzes`);
        return;
      }
      this.quiz_id = quiz_id;
      this.subSection = "showQuizAttempts";
    }
    else if(router.url.includes("quiz-attempt-details")) {
      let atmptId = Number(router.url.split("/")[5]);
      if(isNaN(atmptId)) {
        router.navigateByUrl(`/dashboard/${this.user.course.class_id}/quizzes`);
        return;
      }
      this.atmptId = atmptId;
      this.subSection = "showQuizAttemptDetails";
    }
    else {
      this.refreshQuizList();
    }
  }

  dtChanged(ev: any, mode: "start" | "end") {
    if(mode == "start") this.startDt = ev.value;
    else this.endDt = ev.value;
  }

  refreshQuizList() {
    this.http.get(`/get-quizzes-${this.user.mode}?class_id=${this.user.course.class_id}`, {headers: {token: window.localStorage.getItem("token") || ""}})
    .then((res:any) => {
      this.quizzes = res.quizzes;
    })
    .catch(console.warn);
  }

  startCreatingQuiz() {
    this.quiz_id = -1;
    this.creatingNewQuizNow = true;
  }

  addQuestion() {
    this.questions.push({type: "sa", question: new FormControl("", Validators.required), answer: new FormControl("", Validators.required), marks: new FormControl("1", [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)])});
  }

  deleteQuestion(index: number) {
    this.questions.splice(index, 1);
  }

  changeQuestionType(index: number) {
    let qs = this.questions[index];
    if(qs.type == "scq" && !qs['scqOptions']) {
      qs['scqOptions'] = [new FormControl("Option 1"), new FormControl("Option 2")];
      qs['errorText'] = "";
    }
    else if(qs.type == "mcq" && !qs['mcqOptions']) {
      qs['mcqOptions'] = [new FormControl("Option 1"), new FormControl("Option 2")];
      qs['mcqOptionsSelected'] = [new FormControl(false), new FormControl(false)];
      qs['errorText'] = "";
    }
    else if(qs.type == "code" && !qs['lang']) {
      qs['lang'] = 'js';
      qs['errorText'] = "";
    }
  }

  addOption(index: number) {
    if(this.questions[index][this.questions[index].type == "scq" ? "scqOptions" : "mcqOptions"].length >= 6) {
      alert("You can only add a maximum of 6 options for a single/multiple choice questions.");
      return;
    }
    this.questions[index][this.questions[index].type == "scq" ? "scqOptions" : "mcqOptions"].push(new FormControl("New option"));
    if(this.questions[index].type == "mcq")
    this.questions[index]["mcqOptionsSelected"].push(new FormControl(false));
  }

  deleteOption(index: number, optnNum: number) {
    this.questions[index][this.questions[index].type == "scq" ? "scqOptions" : "mcqOptions"].splice(optnNum, 1);
    if(this.questions[index].type == "mcq")
    this.questions[index]["mcqOptionsSelected"].splice(optnNum, 1);
  }

  changeLangForCode(lang: string, idx: number) {
    this.questions[idx]['lang'] = lang;
  }

  updateCode(code: any, idx: number) {
    this.questions[idx].answer.setValue(code);
  }

  checkIfAllLabelsAreUnique(arr: string[]) {
    return (new Set(arr)).size == arr.length;
  }

  generateQuizJSON() {
    let isAnyErrors = false;
    let quizJSON = this.questions.map(qs => {
      if(typeof qs['errorText'] == "string")
        qs['errorText'] = "";
      let obj: any = {};
      obj.type = qs.type;
      if(!qs.question.valid) {
        qs['errorText'] = "Question not specified";
        isAnyErrors = true;
        return;
      }
      obj.question = qs.question.value;
      obj.answer = qs.answer.value;
      if(qs.type == "scq") {
        obj.scqOptions = [...qs['scqOptions'].map((optn:any) => optn.value)];
        if(qs.answer.value==-1) {
          qs['errorText'] = "No options selected";
          isAnyErrors = true;
          return;
        }
        obj.answer = qs.answer.value;
        if(!this.checkIfAllLabelsAreUnique(obj.scqOptions)) {
          qs['errorText'] = "Duplicate labels exist";
          isAnyErrors = true;
          return;
        }
      }
      else if(qs.type == "mcq") {
        let arr: any = [];
        obj.mcqOptions = [...qs['mcqOptions'].map((optn:any, idx: number) => {
          if(qs['mcqOptionsSelected'][idx].value)
            arr.push(optn.value);
          return optn.value;
        })];
        if(!this.checkIfAllLabelsAreUnique(obj.mcqOptions)) {
          qs['errorText'] = "Duplicate labels exist";
          isAnyErrors = true;
          return;
        }
        if(!arr.length) {
          qs['errorText'] = "No options selected";
          isAnyErrors = true;
          return;
        }
        obj.answer = arr;
      }
      else if(qs.type == "code") {
        obj.lang = qs['lang'];
      }
      if(!qs['marks'].valid) {
        qs['errorText'] = "Marks cannot have decimals and any leading zeros; only digits allowed";
        isAnyErrors = true;
        return;
      }
      obj.marks = Number(qs['marks'].value);
      return obj;
    });
    return this.user.mode == "teacher" && isAnyErrors ? null : quizJSON;
  }

  createQuiz() {
    if(!this.questions.length) return;
    let quizJSON = this.generateQuizJSON();
    if(!quizJSON) return;
    if(!this.quizTitle) return;
    let time_limit = this.timeLimit.trim();
    if(isNaN(Number(time_limit)) || !/^[1-9][0-9]*$/.test(time_limit)) return;
    let max_attempts = this.maxAttempts.trim();
    if(isNaN(Number(max_attempts)) || !["1","2","3","4","5"].includes(max_attempts)) return;
    let now = Date.now(), start_ts = this.canAttemptRightNow ? now : this.startDt.getTime(), end_ts = this.endDt.getTime();
    if(start_ts < now) return;
    if(end_ts - start_ts < 1000*60*15) return;
    this.http.post(`/create-new-quiz?class_id=${this.user.course.class_id}`, {
      title: this.quizTitle,
      json: quizJSON,
      startingAt: start_ts,
      endingAt: end_ts,
      time_limit: Number(time_limit),
      max_attempts: Number(max_attempts)
    }, {headers: {token: window.localStorage.getItem("token") || ""}})
    .then((res:any) => {
      this.refreshQuizList();
      this.creatingNewQuizNow = false;
    })
    .catch(console.warn);
  }

  canStudentAttemptQuiz(quiz: any) {
    return quiz['attempts_count'] < quiz['max_attempts'] && Date.now() < quiz['endingAt'];
  }

  canTeacherEditQuiz(quiz: any) {
    return Date.now() < quiz['startingAt'];
  }

  showQuiz(quiz_id: number) {
    this.questions = [];
    this.quiz_id = quiz_id;
    let quiz = this.quizzes.filter(q => q['quiz_id'] == quiz_id)[0];
    this.quizTitle = quiz.title;
    this.startDt = new Date(quiz['startingAt']);
    this.endDt = new Date(quiz['endingAt']);
    this.timeLimit = quiz['time_limit'].toString();
    this.maxAttempts = quiz['max_attempts'].toString();
    quiz['json'].forEach((obj:any) => {
      let res: any = {};
      res.type = obj.type;
      res.question = new FormControl(obj.question, Validators.required);
      if(res.type != "mcq")
        res.answer = new FormControl((res.type=="code" || this.user.mode=="teacher") ? obj.answer : (res.type=="scq" ? -1 : ""), Validators.required);
      res.marks = new FormControl(obj.marks, Validators.required);
      if(obj.type == "scq") {
        res.scqOptions = [];
        obj.scqOptions.forEach((optn:any, idx:number) => {
          res.scqOptions.push(new FormControl(optn));
        });
      }
      else if(obj.type == "mcq") {
        res.mcqOptions = []; res.mcqOptionsSelected = [];
        obj.mcqOptions.forEach((optn:any) => {
          res.mcqOptions.push(new FormControl(optn));
          res.mcqOptionsSelected.push(new FormControl(this.user.mode=="teacher" ? obj.answer.includes(optn) : false));
        });
        res.answer = true;
      }
      else if(obj.type == "code") {

        res.lang = obj.lang;
      }
      this.questions.push(res);
    });
    if (this.user.mode == "student") {
      let quizEndTime = Date.now() + 1000*60*Number(this.timeLimit);
      this.timeLeftTimeout = setTimeout(() => {
        if(this.timeLeftTimeout) {
          this.timeLeft = "Time's up!";
          clearTimeout(this.timeLeftTimeout);
          this.timeLeftTimeout = null;
          this.submitQuiz();
        }
      }, 1000*60*Number(this.timeLimit));
      this.timeUpdateInterval = setInterval(() => {
        let seconds = Math.floor((quizEndTime - Date.now())/1000);
        let hrs = (Math.floor(seconds/3600)/100).toFixed(2).split(".")[1];
        seconds %= 3600;
        let mins = (Math.floor(seconds/60)/100).toFixed(2).split(".")[1];
        seconds %= 60;
        this.timeLeft = `${hrs}:${mins}:${(seconds/100).toFixed(2).split(".")[1]}`;
      }, 1000);
    }
    this.creatingNewQuizNow = true;
  }

  updateQuiz() {
    if(!this.questions.length) return;
    let quizJSON = this.generateQuizJSON();
    if(!quizJSON) return;
    if(!this.quizTitle) return;
    let time_limit = this.timeLimit.trim();
    if(isNaN(Number(time_limit)) || !/^[1-9][0-9]*$/.test(time_limit)) return;
    let max_attempts = this.maxAttempts.trim();
    if(isNaN(Number(max_attempts)) || !["1","2","3","4","5"].includes(max_attempts)) return;
    let now = Date.now(), start_ts = this.canAttemptRightNow ? now : this.startDt.getTime(), end_ts = this.endDt.getTime();
    if(start_ts < now) return;
    if(end_ts - start_ts < 1000*60*15) return;
    this.http.post(`/update-quiz?class_id=${this.user.course.class_id}&quiz_id=${this.quiz_id}`, {
      title: this.quizTitle,
      json: quizJSON,
      startingAt: start_ts,
      endingAt: end_ts,
      time_limit: Number(time_limit),
      max_attempts: Number(max_attempts)
    }, {headers: {token: window.localStorage.getItem("token") || ""}})
    .then((res:any) => {
      this.refreshQuizList();
      this.creatingNewQuizNow = false;
    })
    .catch(console.warn);
  }

  submitQuiz() {
    if(this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
    if(this.timeLeftTimeout) {
      clearTimeout(this.timeLeftTimeout);
      this.timeLeftTimeout = null;
    }
    let quiz = this.quizzes.filter(q => q['quiz_id'] == this.quiz_id)[0];
    let quizJSON = {...quiz['json']};
    let totalMarks = 0;
    let totalMarksGained = this.questions.reduce((accm, obj, idx) => {
      totalMarks += obj['marks'].value;
      if(obj.type == "mcq") {
        let selectedOpts = [];
        let marksGained = 0;
        for(let i=0;i<obj["mcqOptions"].length;i++) {
          if(obj["mcqOptionsSelected"][i].value) {
            if(quiz['json'][idx].answer.includes(obj["mcqOptions"][i].value)) {
              accm += obj['marks'].value/quiz['json'][idx].answer.length;
              marksGained += obj['marks'].value/quiz['json'][idx].answer.length;
            }
            selectedOpts.push(obj["mcqOptions"][i].value)
          }
        }
        quizJSON![idx].marksGained = marksGained;
        quizJSON![idx].submittedAnswer = [...selectedOpts];
      }
      else {
        quizJSON![idx].marksGained = 0;
        if(obj.answer.value == quiz['json'][idx].answer) {
          accm += obj['marks'].value;
          quizJSON![idx].marksGained = obj['marks'].value;
        }
        quizJSON![idx].submittedAnswer = obj.answer.value;
      }
      return accm;
    }, 0);
    this.http.post(`/submit-quiz?quiz_id=${this.quiz_id}`, {
      json: quizJSON,
      marks: totalMarks,
      marks_gained: totalMarksGained
    }, {headers: {token: window.localStorage.getItem("token") || ""}})
    .then((res:any) => {
      this.creatingNewQuizNow = false;
      this.timeLeft = "";
      this.refreshQuizList();
    })
    .catch(console.warn);
  }

  showAttemptsForQuiz(quiz_id: number) {
    this.router.navigateByUrl(`/dashboard/${this.user.course.class_id}/quizzes/show-quiz-attempts-for/${quiz_id}`);
  }
}
