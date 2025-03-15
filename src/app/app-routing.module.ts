import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'dashboard/:course-id', component: DashboardComponent},
  {path: 'dashboard/:course-id/contents', component: DashboardComponent},
  {path: 'dashboard/:course-id/quizzes', component: DashboardComponent},
  {path: 'dashboard/:course-id/quizzes/show-quiz-attempts-for/:quizId', component: DashboardComponent},
  {path: 'dashboard/:course-id/quizzes/quiz-attempt-details/:attmptId', component: DashboardComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
