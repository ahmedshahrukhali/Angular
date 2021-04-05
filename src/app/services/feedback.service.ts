import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';

import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { Feedback } from '../shared/feedback';

import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }




    
  getFeedbackList(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(baseURL + 'feedback')
    .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeedback(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(baseURL + 'feedback/' + id)
    .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeedbackIds(): Observable<string[] | any> {
    return this.getFeedbackList().pipe(map(dishes => dishes.map(dish => dish.id)))
    .pipe(catchError(error => error));
  }
  submitFeedback(feedback: Feedback): Observable<Feedback> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      })
    };
    return this.http.post<Feedback>(baseURL + 'feedback/', feedback, httpOptions)
    .pipe(catchError(this.processHTTPMsgService.handleError));
  };


  
}
