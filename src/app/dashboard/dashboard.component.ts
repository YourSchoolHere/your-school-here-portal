import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../services/http.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public schoolInfo: { [k: string]: any } = {};
  public courses: any[] = [];
  public selectedCourse: any = "";
  public subSection = "";

  constructor(private router: Router, private http: HttpService, public user: UserService) {
    (async() => {
      let token = window.localStorage.getItem("token") || "";
      if(!token) {
        router.navigateByUrl("/login");
      }
      else {
        await http.get('/validate-token', {headers: {token}})
        .then((res:any) => {
          user.mode = res.student_id ? "student" : "teacher";
          user.id = res.student_id || res.teacher_id;
          user.name = res.name;
        })
        .catch((err:any) => {
          console.warn(err);
          window.localStorage.removeItem("token");
          router.navigateByUrl("/login");
        });
      }
      let res = await fetch("./schoolInfo.json");
      this.schoolInfo = await res.json();
      let parts = router.url.split("/");
      if (parts.length > 2) {
        this.selectedCourse = parts[2];
        user.course.class_id = parts[2];
        this.subSection = "contents";
        if (parts.length > 3) {
          this.subSection = parts[3];
        }
      }
      else {
        if(user.mode == "teacher") {
          await http.get('/get-teacher-subjects', {headers: {token}})
          .then((res:any) => {
            this.courses = res.courses;
          })
          .catch(console.warn)
        }
        else {
          await http.get('/get-student-subjects', {headers: {token}})
          .then((res:any) => {
            this.courses = res.courses;
          })
          .catch(console.warn)
        }
      }
    })();
  }

  selectCourse(classID: string) {
    this.user.course = {...this.courses.filter(obj => obj.class_id == classID)[0]};

    console.log(this.user.mode);
    this.router.navigateByUrl(`/dashboard/${classID}`);
  }

  gotoSection(section: string) {
    this.router.navigateByUrl(`/dashboard/${this.selectedCourse}/${section}`);
  }

  logout() {
    window.localStorage.removeItem("token");
    this.router.navigateByUrl('/login');
  }
}
