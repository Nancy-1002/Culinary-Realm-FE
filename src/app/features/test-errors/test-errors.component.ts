import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-test-errors',
  standalone: true,
  imports: [],
  templateUrl: './test-errors.component.html',
  styleUrl: './test-errors.component.scss'
})
export class TestErrorsComponent {
  baseUrl = 'https://localhost:7170/api/'
  private http = inject(HttpClient);
  validationErrors?: string[] = [];

  get404Error(){
    return this.http.get(this.baseUrl + 'buggy/notfound')
     .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error)
      });
  }
  get400Error(){
    return this.http.get(this.baseUrl + 'buggy/badrequest')
     .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error)
      });
  }
  get401Error(){
    return this.http.get(this.baseUrl + 'buggy/unauthorized')
     .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error)
      });
  }
  get500Error(){
    return this.http.get(this.baseUrl + 'buggy/internalerror')
     .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error)
      });
  }
  get400ValidationError(){
    return this.http.post(this.baseUrl + 'buggy/validationerror',{})
     .subscribe({
        next: (response) => console.log(response),
        error: (error) => this.validationErrors = error
      });
  }
}
