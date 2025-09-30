// src/app/features/auth/components/phone-field/phone-field.ts
import { Component, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-phone-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './phone-field.html',
  styleUrl: './phone-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneField),
      multi: true,
    },
  ],
})
export class PhoneField implements ControlValueAccessor, OnDestroy {
  // validator as ValidatorFn compatible AbstractControl
  private readonly e164Validator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const v = control.value;
    if (!v) return null; // required géré séparément
    try {
      const pn = parsePhoneNumberFromString(v);
      return pn && pn.isValid() ? null : { e164: true };
    } catch {
      return { e164: true };
    }
  };
  // contrôle interne (affiché dans le template)
  control = new FormControl('', {
    validators: [Validators.required, this.e164Validator],
    nonNullable: false,
  });

  private readonly _sub: Subscription;

  // fonctions fournies par Angular via registerOnChange / registerOnTouched
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // propager les changements du contrôle interne vers le parent via onChange
    this._sub = this.control.valueChanges.subscribe((v) => {
      this.onChange(v);
    });
  }

  // ControlValueAccessor impl.
  writeValue(value: string | null): void {
    // évite d'émettre valueChanges
    this.control.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.control.disable({ emitEvent: false })
      : this.control.enable({ emitEvent: false });
  }

  // Helper public : retourne la valeur normalisée E.164 ou null si invalide
  getE164(): string | null {
    const raw = this.control.value ?? '';
    try {
      const pn = parsePhoneNumberFromString(raw);
      return pn && pn.isValid() ? pn.number : null;
    } catch {
      return null;
    }
  }

  // Getter utilisé par le template pour afficher un message d'erreur lisible
  get errorMsg(): string {
    if (this.control.hasError('required')) return 'Numéro requis';
    if (this.control.hasError('e164')) return 'Format international requis (ex : +237 699 999 999)';
    return '';
  }

  // appeler onTouched quand l'input blur
  markTouched() {
    this.onTouched();
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }
}
