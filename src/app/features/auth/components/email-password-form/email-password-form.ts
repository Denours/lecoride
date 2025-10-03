import { Component, Output, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthApi } from './../../services/auth-api';
import { PhoneField } from '../phone-field/phone-field';
import { Subscription } from 'rxjs';
import { SignupStore } from '../../store/signup.store';
import { Router } from '@angular/router';
import { OtpTimer } from '../../services/otp-timer';
import { OtpInput } from '../otp-input/otp-input';

@Component({
  selector: 'app-email-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhoneField, OtpInput],
  templateUrl: './email-password-form.html',
  styleUrls: ['./email-password-form.scss'],
})
export class EmailPasswordForm implements OnDestroy {
  @ViewChild(PhoneField, { static: false }) phoneField?: PhoneField;
  @ViewChild('p1') inp1!: ElementRef;
  form;
  @Output() formSubmit = new EventEmitter<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    marketing?: boolean;
  }>();
  displayPhoneFields = true;
  showOtp = false; // contrôle de l’affichage du champ OTP
  remaining = 0;
  otpValue = '123456';
  wrongAttempts = 0;
  blockedUntil: number | null = null; // timestamp Unix
  resendEnabled = false;

  private readonly sub!: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: AuthApi,
    public store: SignupStore,
    private readonly router: Router,
    private readonly timer: OtpTimer
  ) {
    this.form = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', [Validators.required, this.e164Validator]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.minLength(8), this.strongPasswordValidator()],
        ],

        confirm: ['', Validators.required],
        cgu: [false, Validators.requiredTrue],
        marketing: [false],
      },
      { validators: this.passwordsMatch }
    );
    // Écoute du timer
    this.sub = this.timer.remaining$.subscribe((val) => {
      this.remaining = val;

      // 🔄 Renvoi automatique si timer atteint 0
      if (this.showOtp && val === 0) {
        this.resendOtp();
      }
    });
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
    if (/\d/.test(pw)) score++;
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
      if (/\d/.test(value)) score++;
      if (/[\W_]/.test(value)) score++;

      // Au moins 3 critères requis
      return score >= 3 ? null : { weakPassword: true };
    };
  }
  displayFormFields() {
    const ch = this.inp1.nativeElement.checked;
    if (ch) {
      this.displayPhoneFields = true;
      return;
    }
    this.displayPhoneFields = false;
  }

  // Validator custom
  e164Validator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    const e164Regex = /^\+[1-9]\d{1,14}$/; // format E.164
    return val && e164Regex.test(val) ? null : { invalidPhone: true };
  }
  /** Soumission du numéro de téléphone */
  onSubmit() {
    const phoneE164 = this.phoneField?.getE164();
    const firstName = this.form.get('firstName')?.value?.trim();
    const lastName = this.form.get('lastName')?.value?.trim();
    const email = this.form.get('email')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';
    const marketing = this.form.get('marketing')?.value ?? false;

    if (!firstName || !lastName) {
      alert('Veuillez saisir votre prénom et nom.');
      return;
    }

    console.log('Nom complet :', firstName, lastName);
    if (this.displayPhoneFields) {
      if (!phoneE164) {
        // numéro invalide, bloquer l'action
        alert('Numéro invalide. Veuillez entrer un numéro correct au format international.');
        return;
      }
      console.log('Numéro saisi :', phoneE164);
      alert(`Code OTP envoyé à ${firstName} ${lastName} sur le numéro : ${phoneE164}`);
      // Simulation envoi OTP

      this.store.setPhone(phoneE164);
      this.showOtp = true; // on affiche le champ OTP
      // Lancer un timer de 30s
      // this.timer.start(30);
      this.startResendTimer();
    } else {
      this.formSubmit.emit({ firstName, lastName, email, password, marketing });
      console.log(this.form.value);
    }
  }

  /** Callback quand l’utilisateur a complété les 6 chiffres */
  onOtpComplete(otp: string) {
    // Si blocage actif, on ignore
    if (this.isBlocked()) return;

    if (otp === this.otpValue) {
      alert('OTP correct ! Utilisateur connecté.');
      this.router.navigate(['/ride/search']);

      // Ici tu pourrais naviguer ou passer à l'étape suivante
    } else {
      this.wrongAttempts++;
      if (this.wrongAttempts >= 3) {
        this.blockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
        this.showOtp = false;
        this.wrongAttempts = 0; // reset tentative après blocage
        this.startBlockedTimer();
      } else {
        alert(`OTP incorrect. Tentative ${this.wrongAttempts}/3`);
      }
    }
  }
  get isPhoneValid(): boolean {
    // phoneField peut être undefined au début du ngAfterViewInit
    return !!this.phoneField && !!this.phoneField.getE164();
  }

  /** Retourne vrai si blocage actif */
  isBlocked() {
    return this.blockedUntil && this.blockedUntil > Date.now();
  }

  /** Timer pour réactiver le champ OTP après blocage */
  startBlockedTimer() {
    const interval = setInterval(() => {
      if (!this.isBlocked()) {
        this.blockedUntil = null;
        this.showOtp = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  /** Timer pour activer le bouton "Réessayer OTP" */
  startResendTimer() {
    this.resendEnabled = false;
    this.timer.start(30); // par ex. 30 secondes avant de pouvoir renvoyer
    const sub = this.timer.remaining$.subscribe((sec) => {
      if (sec <= 0) {
        this.resendEnabled = true;
        sub.unsubscribe();
      }
    });
  }
  getBlockedSeconds(): number {
    if (!this.blockedUntil) return 0;
    return Math.max(0, Math.floor((this.blockedUntil - Date.now()) / 1000));
  }

  resendOtp() {
    if (!this.resendEnabled) return;
    alert('OTP renvoyé (simulé) !');
    this.startResendTimer();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
