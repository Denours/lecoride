import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OtpTimer {
  /** Observable du temps restant en secondes */
  remaining$ = new BehaviorSubject<number>(0);

  private sub?: Subscription;

  /** Démarre le timer pour x secondes */
  start(seconds: number) {
    this.remaining$.next(seconds);

    // Annule un timer existant s'il y en a un
    this.sub?.unsubscribe();

    // Intervalle 1s
    this.sub = interval(1000)
      .pipe(takeWhile(() => this.remaining$.value > 0))
      .subscribe(() => {
        const next = Math.max(0, this.remaining$.value - 1);
        this.remaining$.next(next);

        // Arrête l’abonnement lorsque le timer atteint 0
        if (next === 0) this.sub?.unsubscribe();
      });
  }

  /** Stoppe le timer immédiatement */
  stop() {
    this.sub?.unsubscribe();
    this.remaining$.next(0);
  }
}
