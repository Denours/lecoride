import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  duration?: number; // en ms, optionnel
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSubject = new Subject<ToastMessage>();
  readonly messages$ = this.messagesSubject.asObservable();

  show(text: string, duration = 3000) {
    this.messagesSubject.next({ text, duration });
  }
}
