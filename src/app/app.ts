import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './features/auth/services/toast';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  toasts: ToastMessage[] = [];
  private readonly destroyRef = inject(DestroyRef); // injecte le DestroyRef

  constructor(private readonly toast: ToastService) {
    // On peut abonner directement dans le constructeur
    this.toast.messages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((msg) => {
      this.toasts.push(msg);
      const duration = msg.duration ?? 3000;
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t !== msg);
      }, duration);
    });
  }
}
