import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../services/http.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public username = new FormControl('');
  public password = new FormControl('');

  constructor(private router: Router, private http: HttpService, private user: UserService) {}

  login() {
    this.http.post("/login", {
      username: this.username.value,
      password: this.password.value
    }).then((res:any) => {
      this.user.mode = (res.student_id ? "student" : "teacher");
      window.localStorage.setItem("token", res.token);
      this.router.navigateByUrl('/dashboard');
    }).catch((err:any) => {
      console.warn(err);
    });
  }

  loginWithSSO() {
    this.router.navigateByUrl('/dashboard');
  }
}
