import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { OtpInput } from '../otp-input/otp-input';
import { AuthApi } from '../../services/auth-api';
import { SignupStore } from '../../store/signup.store';

@Component({
  selector: 'app-signup-phone-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OtpInput],
  templateUrl: './signup-phone-verify.html',
  styleUrls: ['./signup-phone-verify.scss'],
})
export class SignupPhoneVerify {
  loading = false;
  error?: string;

  constructor(private api: AuthApi, public store: SignupStore, private router: Router) {}

  get now(): number {
    return Date.now();
  }
  verifyOtp(code: string) {
    const state = this.store.getState();

    // Vérifie blocage temporaire
    if (state.lockUntil && Date.now() < state.lockUntil) {
      this.store.setError("Trop d'essais. Réessaie plus tard.");
      return;
    }

    this.store.startLoading();

    this.api.verifyOtp(state.phone!, code).subscribe({
      next: (res) => {
        // Stockage du token (idéal: cookie HttpOnly)
        localStorage.setItem('auth_token', res.token);

        this.api.me().subscribe(() => {
          this.store.setStep('success');
          this.router.navigate(['/signup/success']);
          this.store.stopLoading();
        });
      },
      error: () => {
        this.store.incOtpAttempt();
        this.store.setError('Code incorrect.');

        const newState = this.store.getState();
        if (newState.lockUntil) {
          // Blocage temporaire atteint
          this.store.setError("Trop d'essais. Réessaie plus tard.");
        }

        this.store.stopLoading();
      },
    });
  }
}
