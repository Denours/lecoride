import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthApi } from './../../services/auth-api';

@Component({
  selector: 'app-email-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-password-form.html',
  styleUrls: ['./email-password-form.scss'],
})
export class EmailPasswordForm {
  form;
  @Output() formSubmit = new EventEmitter<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    marketing?: boolean;
  }>();

  constructor(private fb: FormBuilder, private api: AuthApi) {
    this.form = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
  Validators.required,
  Validators.minLength(8),
  this.strongPasswordValidator()
]],

        confirm: ['', Validators.required],
        cgu: [false, Validators.requiredTrue],
        marketing: [false],
      },
      { validators: this.passwordsMatch }
    );
  }

  passwordStrength = 0; // 0-4

  passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password')?.value;
    const confirm = control.get('confirm')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  updateStrength() {
    const pw = this.form.get('password')?.value ?? '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[\W_]/.test(pw)) score++;
    this.passwordStrength = Math.min(score, 4);
  }

  submit() {
    if (this.form.invalid) return;

    const firstName = this.form.get('firstName')?.value ?? '';
    const lastName = this.form.get('lastName')?.value ?? '';
    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';
    const marketing = this.form.get('marketing')?.value ?? false;

    this.formSubmit.emit({ firstName, lastName, email, password, marketing });
    console.log(this.form.value);
  }

  strongPasswordValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    let score = 0;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[\W_]/.test(value)) score++;

    // Au moins 3 critères requis
    return score >= 3 ? null : { weakPassword: true };
  };
}

}
