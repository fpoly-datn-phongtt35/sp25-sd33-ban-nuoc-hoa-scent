import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReturnService {
  private returnIdSubject = new BehaviorSubject<number | null>(null);
  returnId$ = this.returnIdSubject.asObservable();

  setReturnId(returnId: number) {
    this.returnIdSubject.next(returnId);
  }
}