import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { OtpTimer } from '../../services/otp-timer';
import { PhoneField } from '../phone-field/phone-field';
import { OtpInput } from '../otp-input/otp-input';
import { SignupStore } from '../../store/signup.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup-phone',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhoneField, OtpInput],
  templateUrl: './signup-phone.html',
  styleUrls: ['./signup-phone.scss'],
})
export class SignupPhone implements OnDestroy {
  @ViewChild(PhoneField) phoneField!: PhoneField;
  form: FormGroup;
  showOtp = false; // contrôle de l’affichage du champ OTP
  remaining = 0;
  otpValue = '123456';
  wrongAttempts = 0;
  blockedUntil: number | null = null; // timestamp Unix
  resendEnabled = false;

  private readonly sub!: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    public store: SignupStore,
    private readonly router: Router,
    private readonly timer: OtpTimer
  ) {
    this.form = this.fb.group({
      phone: ['', [Validators.required, this.e164Validator]],
    });

    // Écoute du timer
    this.sub = this.timer.remaining$.subscribe((val) => {
      this.remaining = val;

      // 🔄 Renvoi automatique si timer atteint 0
      if (this.showOtp && val === 0) {
        this.resendOtp();
      }
    });
  }
  // Validator custom
  e164Validator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    const e164Regex = /^\+[1-9]\d{1,14}$/; // format E.164
    return val && e164Regex.test(val) ? null : { invalidPhone: true };
  }
  /** Soumission du numéro de téléphone */
  onSubmit() {
    const phoneE164 = this.phoneField.getE164();

    if (!phoneE164) {
      // numéro invalide, bloquer l'action
      alert('Numéro invalide. Veuillez entrer un numéro correct au format international.');
      return;
    }

    console.log('Numéro saisi :', phoneE164);

    // ⚡ Ici, tu simules la réussite de l’envoi du code (frontend only)
    alert('Code OTP envoyé au numéro : ' + phoneE164);

    this.store.setPhone(phoneE164);
    this.showOtp = true; // on affiche le champ OTP
    // Lancer un timer de 30s
    // this.timer.start(30);
    this.startResendTimer();
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
    this.timer.start(30); // par ex. 10 secondes avant de pouvoir renvoyer
    // const sub = this.timer.remaining$.subscribe((sec) => {
    //   if (sec <= 0) this.resendEnabled = true;
    // });
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
