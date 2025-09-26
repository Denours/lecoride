import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup-choice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signup-choice.html',
  styleUrls: ['./signup-choice.scss']
})
export class SignupChoice {
  constructor(private router: Router) {}

  go(path: string) {
    this.router.navigate(['/signup', path]);
  }
}
