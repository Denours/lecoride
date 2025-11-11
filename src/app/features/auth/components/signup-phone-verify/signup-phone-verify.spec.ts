import { SignupPhoneVerify } from './signup-phone-verify';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withRouterConfig, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignupStore } from '../../store/signup.store';
import { AuthApi } from '../../services/auth-api';

class MockAuthApi {
  verifyOtp(phone: string, code: string) {
    return of({ token: 'dummy_token' });
  }
  me() {
    return of({});
  }
}

class MockStore {
  private state = { phone: '+1234567890', lockUntil: null };
  startLoading = jasmine.createSpy();
  stopLoading = jasmine.createSpy();
  setStep = jasmine.createSpy();
  setError = jasmine.createSpy();
  incOtpAttempt = jasmine.createSpy();
  getState() {
    return this.state;
  }
  setState(state: any) {
    this.state = state;
  }
}

describe('SignupPhoneVerify', () => {
  let component: SignupPhoneVerify;
  let fixture: ComponentFixture<SignupPhoneVerify>;
  let router: Router;
  let store: MockStore;
  let api: MockAuthApi;

  beforeEach(async () => {
    store = new MockStore();
    api = new MockAuthApi();

    await TestBed.configureTestingModule({
      imports: [SignupPhoneVerify],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' })),
        { provide: SignupStore, useValue: store },
        { provide: AuthApi, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPhoneVerify);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return current timestamp from now', () => {
    const time = Date.now();
    expect(component.now).toBeGreaterThanOrEqual(time);
  });

  it('should block OTP if lockUntil is in the future', () => {
    store.setState({ phone: '+1234567890', lockUntil: Date.now() + 10000 });
    component.verifyOtp('123456');
    expect(store.setError).toHaveBeenCalledWith("Trop d'essais. Réessaie plus tard.");
  });

  it('should handle correct OTP and navigate', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.verifyOtp('123456');
    tick();
    expect(localStorage.getItem('auth_token')).toBe('dummy_token');
    expect(store.setStep).toHaveBeenCalledWith('success');
    expect(router.navigate).toHaveBeenCalledWith(['/signup/success']);
    expect(store.stopLoading).toHaveBeenCalled();
  }));

  it('should handle incorrect OTP without lock', fakeAsync(() => {
    spyOn(api, 'verifyOtp').and.returnValue(throwError(() => new Error('fail')));
    component.verifyOtp('000000');
    tick();
    expect(store.incOtpAttempt).toHaveBeenCalled();
    expect(store.setError).toHaveBeenCalledWith('Code incorrect.');
    expect(store.stopLoading).toHaveBeenCalled();
  }));

  it('should handle incorrect OTP with lock', fakeAsync(() => {
    spyOn(api, 'verifyOtp').and.returnValue(throwError(() => new Error('fail')));
    store.setState({ phone: '+1234567890', lockUntil: Date.now() + 1000 });
    component.verifyOtp('000000');
    tick();
    expect(store.setError).toHaveBeenCalledWith("Trop d'essais. Réessaie plus tard.");
  }));
});
