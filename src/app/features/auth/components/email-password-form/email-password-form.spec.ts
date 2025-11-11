import { TestBed } from '@angular/core/testing';
import { EmailPasswordForm } from './email-password-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthApi } from './../../services/auth-api';
import { SignupStore } from '../../store/signup.store';
import { Router } from '@angular/router';
import { OtpTimer } from '../../services/otp-timer';
import { Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { PhoneField } from '../phone-field/phone-field';

describe('EmailPasswordForm Component', () => {
  let component: EmailPasswordForm;
  let fixture: ReturnType<typeof TestBed.createComponent<EmailPasswordForm>>;
  let timerSubject: Subject<number>;
  let storeMock: jasmine.SpyObj<SignupStore>;
  let routerMock: jasmine.SpyObj<Router>;
  let otpTimerMock: jasmine.SpyObj<OtpTimer>;

  beforeEach(() => {
    timerSubject = new Subject<number>();
    storeMock = jasmine.createSpyObj('SignupStore', ['setPhone']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    otpTimerMock = jasmine.createSpyObj('OtpTimer', ['start'], {
      remaining$: timerSubject.asObservable(),
    });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EmailPasswordForm],
      providers: [
        FormBuilder,
        { provide: AuthApi, useValue: {} },
        { provide: SignupStore, useValue: storeMock },
        { provide: Router, useValue: routerMock },
        { provide: OtpTimer, useValue: otpTimerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailPasswordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display or hide phone fields based on checkbox', () => {
    component.inp1 = new ElementRef<HTMLInputElement>({ checked: true } as HTMLInputElement);
    component.displayFormFields();
    expect(component.displayPhoneFields).toBeTrue();

    component.inp1 = new ElementRef<HTMLInputElement>({ checked: false } as HTMLInputElement);
    component.displayFormFields();
    expect(component.displayPhoneFields).toBeFalse();
  });

  it('should correctly detect phone validity', () => {
    // Mock PhoneField minimal pour test
    const mockPhoneField: Partial<PhoneField> = {
      getE164: () => '+1234567890',
    };

    component.phoneField = mockPhoneField as PhoneField;

    expect(component.isPhoneValid).toBeTrue();
  });

  it('should handle onSubmit with valid phone', () => {
    spyOn(globalThis, 'alert');
    spyOn(component, 'startResendTimer');

    const mockPhoneField: Partial<PhoneField> = {
      getE164: () => '+1234567890',
    };
    component.phoneField = mockPhoneField as PhoneField;

    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Abc12345!',
      marketing: true,
    });
    component.displayPhoneFields = true;
    component.onSubmit();

    expect(globalThis.alert).toHaveBeenCalledWith(
      'Code OTP envoyé à John Doe sur le numéro : +1234567890'
    );
    expect(storeMock.setPhone).toHaveBeenCalledWith('+1234567890');
    expect(component.showOtp).toBeTrue();
    expect(component.startResendTimer).toHaveBeenCalled();
  });

  it('should show alert if phone is invalid on submit', () => {
    spyOn(globalThis, 'alert');

    const mockPhoneField: Partial<PhoneField> = {
      getE164: () => null,
    };
    component.phoneField = mockPhoneField as PhoneField;

    component.displayPhoneFields = true;
    component.form.patchValue({ firstName: 'John', lastName: 'Doe' });
    component.onSubmit();

    expect(globalThis.alert).toHaveBeenCalledWith(
      'Numéro invalide. Veuillez entrer un numéro correct au format international.'
    );
  });
});
