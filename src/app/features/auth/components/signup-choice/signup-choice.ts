import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Logo } from '../../../logo/logo';

@Component({
  selector: 'app-signup-choice',
  standalone: true,
  imports: [CommonModule, RouterModule, Logo],
  templateUrl: './signup-choice.html',
  styleUrls: ['./signup-choice.scss'],
})
export class SignupChoice {
  constructor(private readonly router: Router) {}

  go(path: string) {
    this.router.navigate(['/signup', path]);
  }
}
