import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, of } from 'rxjs';

export interface SignupState {
  step: 'choice' | 'phone' | 'phone-verify' | 'email' | 'check-inbox' | 'success';
  phone?: string;
  email?: string;
  loading: boolean;
  error?: string;
  otpAttempts?: number;
  lockUntil?: number | null;
}

@Injectable({ providedIn: 'root' })
export class SignupStore extends ComponentStore<SignupState> {
  constructor() {
    super({ step: 'choice', loading: false, otpAttempts: 0, lockUntil: null });

    // Restaurer l'état depuis sessionStorage si présent
    const saved = sessionStorage.getItem('signupState');
    if (saved) this.setState(JSON.parse(saved));

    // Persister à chaque changement
    this.state$.subscribe((state) => sessionStorage.setItem('signupState', JSON.stringify(state)));
  }

  /** Met à jour l'étape */
  readonly setStep = this.updater((state, step: SignupState['step']) => ({
    ...state,
    step,
  }));

  /** Met à jour le numéro de téléphone */
  readonly setPhone = this.updater((state, phone: string) => ({
    ...state,
    phone,
  }));

  /** Active le loader et reset l'erreur */
  readonly startLoading = this.updater((state) => ({
    ...state,
    loading: true,
    error: undefined,
  }));

  /** Désactive le loader */
  readonly stopLoading = this.updater((state) => ({
    ...state,
    loading: false,
  }));

  /** Met à jour l'erreur */
  readonly setError = this.updater((state, error?: string) => ({
    ...state,
    error,
  }));

  /** Incrémente le nombre de tentatives OTP et bloque si >3 */
  readonly incOtpAttempt = this.updater((state) => {
    const attempts = (state.otpAttempts ?? 0) + 1;
    let lockUntil = state.lockUntil;
    if (attempts >= 3) lockUntil = Date.now() + 5 * 60 * 1000; // blocage 5 min
    return { ...state, otpAttempts: attempts, lockUntil };
  });

  /** Réinitialise les tentatives OTP */
  readonly clearOtpAttempts = this.updater((state) => ({
    ...state,
    otpAttempts: 0,
    lockUntil: null,
  }));

  requestOtp(phone: string): Observable<{ success: boolean; message: string }> {
    console.log("Simulation d'envoi OTP pour le numéro :", phone);

    // Tu peux simuler la logique : par exemple, OTP envoyé si numéro commence par +237
    if (phone.startsWith('+237')) {
      return of({ success: true, message: 'Code OTP envoyé avec succès !' });
    } else {
      return of({ success: false, message: 'Numéro invalide ou non supporté.' });
    }
  }
  public getState(): SignupState {
    return this.get();
  }

  private _email: string = '';

  get email(): string {
    return this._email;
  }
  setEmail(email: string): void {
    this._email = email;
  }
}
