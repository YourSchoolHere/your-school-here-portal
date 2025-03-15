import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizzesComponent } from './dashboard/quizzes/quizzes.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { UserService } from './services/user.service';
import { CodeEditorComponent } from './dashboard/quizzes/code-editor/code-editor.component';
import { CodeEditorModule, provideCodeEditor } from '@ngstack/code-editor';
import { DiagramComponent } from './dashboard/quizzes/diagram/diagram.component';
import { DiagramModule } from '@syncfusion/ej2-angular-diagrams';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EvaluateQuizComponent } from './dashboard/quizzes/evaluate-quiz/evaluate-quiz.component';
import { ShowQuizAttemptsComponent } from './dashboard/quizzes/show-quiz-attempts/show-quiz-attempts.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    QuizzesComponent,
    CodeEditorComponent,
    DiagramComponent,
    EvaluateQuizComponent,
    ShowQuizAttemptsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CodeEditorModule.forRoot(),
    DiagramModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
