import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public mode: "student" | "teacher" | null = null;
  public id = "";
  public name = "";
  public course = {
    course_id: "",
    class_id: "",
    name: ""
  }

  constructor() { }
}
