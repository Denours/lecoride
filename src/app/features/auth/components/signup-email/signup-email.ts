import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmailPasswordForm } from '../email-password-form/email-password-form';
import { SignupStore } from '../../store/signup.store';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-signup-email',
  standalone: true,
  imports: [CommonModule, EmailPasswordForm],
  templateUrl: './signup-email.html',
  styleUrls: ['./signup-email.scss'],
})
export class SignupEmail {
  constructor(public store: SignupStore, private router: Router, private api: AuthApi) {}

  /**
   * Callback lorsque le formulaire email/password est soumis avec succès.
   * @param email Email entré
   * @param password Mot de passe entré
   * @param marketing Opt-in marketing
   */
  onFormSubmit(payload: {
    email: string;
    password: string;
    marketing?: boolean;
    firstName: string;
    lastName: string;
  }) {
    this.store.startLoading();
    this.api.signupEmail(payload).subscribe({
      next: () => {
        this.store.setStep('check-inbox');
        this.router.navigate(['signup/email/check-inbox']);
      },
      error: () => {
        this.store.setError('Impossible de créer le compte. Réessaie.');
        this.store.stopLoading();
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
