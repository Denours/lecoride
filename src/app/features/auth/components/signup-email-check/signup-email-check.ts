import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Logo } from '../../../logo/logo';

@Component({
  selector: 'app-signup-email-check',
  standalone: true,
  imports: [Logo],
  templateUrl: './signup-email-check.html',
  styleUrls: ['./signup-email-check.scss'],
})
export class SignupEmailCheck {
  constructor(private readonly router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  confirmEmail() {
    // Simulation : on considère que l’utilisateur a cliqué sur le lien dans l’email
    this.router.navigate(['/ride/search']); // tu peux remplacer par la route finale de ton app
  }
}
