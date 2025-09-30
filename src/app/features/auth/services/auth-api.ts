import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { User } from '../models/user.type';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly base = '/auth/signup';

  constructor(private readonly http: HttpClient) {}

  /** Vérification OTP reçu par SMS */
  verifyOtp(phoneE164: string, otp: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.base}/phone/verify-otp`, {
      phone: phoneE164,
      otp,
    });
  }

  /** Inscription par email + mot de passe */
  // auth-api.service.ts (dev)
  signupEmail(payload: { email: string; password: string; marketing?: boolean }) {
    return of({ ok: true }).pipe(delay(500)); // RxJS observable simulant succès
  }

  /** Confirmation email via lien deep-link */
  confirmEmail(token: string): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(`${this.base}/email/confirm?token=${token}`);
  }

  /** Récupération des infos utilisateur */
  me(): Observable<User> {
    return this.http.get<User>('/me');
  }
}
